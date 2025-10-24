// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * UMA-CTF适配器 - 简化版本用于学习和测试
 * 完整版本：https://github.com/Polymarket/uma-ctf-adapter
 * 
 * 功能：
 * 1. 连接UMA预言机和条件代币框架
 * 2. 初始化预测市场
 * 3. 从UMA获取结果并解析市场
 */

// 导入条件代币合约
import "./ConditionalTokens.sol";

/**
 * UMA乐观预言机接口（简化版）
 */
interface IOptimisticOracle {
    function requestPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        address currency,
        uint256 reward
    ) external returns (uint256);
    
    function hasPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (bool);
    
    function getPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (int256);
}

/**
 * UMA-CTF适配器合约
 */
contract UmaCTFAdapter {
    
    // ========== 状态变量 ==========
    
    ConditionalTokens public ctf;
    IOptimisticOracle public oracle;
    
    // YES/NO查询的标识符
    bytes32 public constant YES_OR_NO_QUERY = bytes32("YES_OR_NO_QUERY");
    
    // 市场信息结构
    struct Market {
        bytes32 questionId;           // 问题ID
        bytes32 conditionId;          // 条件ID（CTF）
        uint256 outcomeSlotCount;     // 结果数量（通常是2：YES/NO）
        uint64 requestTimestamp;      // 请求时间戳
        address rewardToken;          // 奖励代币
        uint256 reward;               // 奖励金额
        bool resolved;                // 是否已解析
        bytes ancillaryData;          // 辅助数据（问题描述等）
    }
    
    // questionId => Market
    mapping(bytes32 => Market) public markets;
    
    // 所有市场的questionId列表
    bytes32[] public marketList;
    
    // ========== 事件 ==========
    
    event MarketInitialized(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        uint256 outcomeSlotCount,
        uint64 requestTimestamp,
        string title
    );
    
    event MarketResolved(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        uint256[] payouts,
        int256 oraclePrice
    );
    
    event MarketReset(
        bytes32 indexed questionId,
        string reason
    );
    
    // ========== 构造函数 ==========
    
    constructor(
        address _ctf,
        address _oracle
    ) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_oracle != address(0), "Invalid oracle address");
        
        ctf = ConditionalTokens(_ctf);
        oracle = IOptimisticOracle(_oracle);
    }
    
    // ========== 主要功能 ==========
    
    /**
     * 初始化新市场
     * @param questionId 问题ID（唯一标识）
     * @param title 市场标题
     * @param description 市场描述
     * @param outcomeSlotCount 结果数量（2 = YES/NO）
     * @param rewardToken 奖励代币地址（USDC等）
     * @param reward 奖励金额
     * @return conditionId 条件ID
     */
    function initialize(
        bytes32 questionId,
        string calldata title,
        string calldata description,
        uint256 outcomeSlotCount,
        address rewardToken,
        uint256 reward
    ) external returns (bytes32) {
        require(markets[questionId].requestTimestamp == 0, "Market already exists");
        require(outcomeSlotCount == 2, "Only YES/NO markets supported");
        require(rewardToken != address(0), "Invalid reward token");
        require(reward > 0, "Reward must be positive");
        
        // 1. 在CTF上准备条件
        ctf.prepareCondition(
            address(this),  // 预言机地址（本合约）
            questionId,
            outcomeSlotCount
        );
        
        // 2. 获取conditionId
        bytes32 conditionId = ctf.getConditionId(
            address(this),
            questionId,
            outcomeSlotCount
        );
        
        // 3. 准备辅助数据（包含问题详情）
        bytes memory ancillaryData = abi.encode(
            title,
            description,
            block.timestamp
        );
        
        // 4. 向UMA请求价格数据
        uint64 requestTimestamp = uint64(block.timestamp);
        
        // 注意：实际使用时需要先approve rewardToken
        // oracle.requestPrice(
        //     YES_OR_NO_QUERY,
        //     requestTimestamp,
        //     ancillaryData,
        //     rewardToken,
        //     reward
        // );
        
        // 5. 存储市场信息
        markets[questionId] = Market({
            questionId: questionId,
            conditionId: conditionId,
            outcomeSlotCount: outcomeSlotCount,
            requestTimestamp: requestTimestamp,
            rewardToken: rewardToken,
            reward: reward,
            resolved: false,
            ancillaryData: ancillaryData
        });
        
        marketList.push(questionId);
        
        emit MarketInitialized(
            questionId,
            conditionId,
            outcomeSlotCount,
            requestTimestamp,
            title
        );
        
        return conditionId;
    }
    
    /**
     * 解析市场
     * @param questionId 问题ID
     */
    function resolve(bytes32 questionId) external {
        Market storage market = markets[questionId];
        
        require(market.requestTimestamp > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        
        // 1. 检查UMA是否有结果
        bool hasPrice = oracle.hasPrice(
            YES_OR_NO_QUERY,
            market.requestTimestamp,
            market.ancillaryData
        );
        
        require(hasPrice, "Oracle price not available");
        
        // 2. 从UMA获取结果
        int256 price = oracle.getPrice(
            YES_OR_NO_QUERY,
            market.requestTimestamp,
            market.ancillaryData
        );
        
        // 3. 转换为payout数组
        uint256[] memory payouts = new uint256[](market.outcomeSlotCount);
        
        if (price == 1e18) {
            // YES - 第一个结果获胜
            payouts[0] = 1;
            payouts[1] = 0;
        } else if (price == 0) {
            // NO - 第二个结果获胜
            payouts[0] = 0;
            payouts[1] = 1;
        } else if (price == 5e17) {
            // INVALID/TIE - 平分（0.5 * 1e18）
            payouts[0] = 1;
            payouts[1] = 1;
        } else {
            revert("Invalid oracle price");
        }
        
        // 4. 在CTF上报告结果
        ctf.reportPayouts(questionId, payouts);
        
        market.resolved = true;
        
        emit MarketResolved(
            questionId,
            market.conditionId,
            payouts,
            price
        );
    }
    
    /**
     * 重置有争议的市场
     * @param questionId 问题ID
     * @param reason 重置原因
     */
    function reset(bytes32 questionId, string calldata reason) external {
        Market storage market = markets[questionId];
        
        require(market.requestTimestamp > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        
        // 重新发送UMA请求（实际使用时）
        uint64 newTimestamp = uint64(block.timestamp);
        market.requestTimestamp = newTimestamp;
        
        emit MarketReset(questionId, reason);
    }
    
    // ========== 查询函数 ==========
    
    /**
     * 获取市场信息
     */
    function getMarket(bytes32 questionId) external view returns (Market memory) {
        return markets[questionId];
    }
    
    /**
     * 获取市场数量
     */
    function getMarketCount() external view returns (uint256) {
        return marketList.length;
    }
    
    /**
     * 获取市场列表
     */
    function getMarketList(uint256 offset, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        require(offset < marketList.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > marketList.length) {
            end = marketList.length;
        }
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = marketList[i];
        }
        
        return result;
    }
    
    /**
     * 检查市场是否可以解析
     */
    function canResolve(bytes32 questionId) external view returns (bool) {
        Market memory market = markets[questionId];
        
        if (market.requestTimestamp == 0 || market.resolved) {
            return false;
        }
        
        return oracle.hasPrice(
            YES_OR_NO_QUERY,
            market.requestTimestamp,
            market.ancillaryData
        );
    }
}










