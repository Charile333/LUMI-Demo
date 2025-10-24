// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RealUmaCTFAdapter
 * @notice 使用真实 UMA Optimistic Oracle V2 的市场适配器
 * @dev 替换了测试用的 MockOptimisticOracle
 * 
 * 主要改进：
 * - 使用真实的 UMA Oracle 接口
 * - 支持完整的提案/争议机制
 * - 可配置的挑战期
 * - 真实的代币奖励系统
 */

import "./interfaces/IOptimisticOracleV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IConditionalTokens {
    function prepareCondition(
        address oracle,
        bytes32 questionId,
        uint outcomeSlotCount
    ) external;

    function reportPayouts(
        bytes32 questionId,
        uint[] calldata payouts
    ) external;

    function getConditionId(
        address oracle,
        bytes32 questionId,
        uint outcomeSlotCount
    ) external pure returns (bytes32);
}

contract RealUmaCTFAdapter {
    
    // =============================================================
    //                          存储变量
    // =============================================================
    
    /// @notice Conditional Tokens Framework
    IConditionalTokens public immutable ctf;
    
    /// @notice 真实的 UMA Optimistic Oracle V2
    IOptimisticOracleV2 public immutable optimisticOracle;
    
    /// @notice 合约所有者
    address public owner;
    
    /// @notice YES_OR_NO_QUERY 标识符（来自 UMIP-107）
    bytes32 public constant YES_OR_NO_IDENTIFIER = bytes32("YES_OR_NO_QUERY");
    
    /// @notice 默认挑战期（2小时）
    uint256 public constant DEFAULT_LIVENESS = 7200;
    
    /// @notice 市场信息
    struct Market {
        bytes32 questionId;
        bytes32 conditionId;
        string title;
        string description;
        uint256 outcomeSlotCount;
        uint256 requestTimestamp;
        bool resolved;
        address rewardToken;
        uint256 reward;
        uint256[] payouts;
    }
    
    /// @notice 市场列表
    bytes32[] public marketList;
    
    /// @notice 问题ID => 市场信息
    mapping(bytes32 => Market) public markets;
    
    // =============================================================
    //                            事件
    // =============================================================
    
    event MarketInitialized(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        string title,
        uint256 outcomeSlotCount,
        address rewardToken,
        uint256 reward
    );
    
    event OraclePriceRequested(
        bytes32 indexed questionId,
        uint256 timestamp,
        address rewardToken,
        uint256 reward
    );
    
    event MarketResolved(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        uint256[] payouts,
        int256 oraclePrice
    );
    
    // =============================================================
    //                          修饰符
    // =============================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // =============================================================
    //                          构造函数
    // =============================================================
    
    /// @param _ctf ConditionalTokens 合约地址
    /// @param _optimisticOracle UMA Optimistic Oracle V2 地址
    constructor(address _ctf, address _optimisticOracle) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_optimisticOracle != address(0), "Invalid Oracle address");
        
        ctf = IConditionalTokens(_ctf);
        optimisticOracle = IOptimisticOracleV2(_optimisticOracle);
        owner = msg.sender;
    }
    
    // =============================================================
    //                        核心函数
    // =============================================================
    
    /**
     * @notice 初始化新市场并请求 Oracle 价格
     * @param questionId 问题ID
     * @param title 市场标题
     * @param description 市场描述
     * @param outcomeSlotCount 结果数量（通常是2）
     * @param rewardToken 奖励代币地址（必须是白名单代币）
     * @param reward 提案奖励金额
     * @param customLiveness 自定义挑战期（秒），0 表示使用默认值
     * @return conditionId 条件ID
     */
    function initialize(
        bytes32 questionId,
        string memory title,
        string memory description,
        uint256 outcomeSlotCount,
        address rewardToken,
        uint256 reward,
        uint256 customLiveness
    ) external returns (bytes32 conditionId) {
        require(markets[questionId].requestTimestamp == 0, "Market already exists");
        require(outcomeSlotCount >= 2, "Invalid outcome count");
        require(bytes(title).length > 0, "Empty title");
        require(rewardToken != address(0), "Invalid reward token");
        
        // 如果有奖励，转移代币
        if (reward > 0) {
            IERC20(rewardToken).transferFrom(msg.sender, address(this), reward);
            IERC20(rewardToken).approve(address(optimisticOracle), reward);
        }
        
        // 在 CTF 上准备条件
        ctf.prepareCondition(address(this), questionId, outcomeSlotCount);
        
        // 获取条件ID
        conditionId = ctf.getConditionId(address(this), questionId, outcomeSlotCount);
        
        // 构建 ancillaryData（包含市场信息）
        bytes memory ancillaryData = abi.encodePacked(
            "title:", title,
            ",description:", description
        );
        
        // 当前时间戳
        uint256 timestamp = block.timestamp;
        
        // 向 UMA Oracle 请求价格
        optimisticOracle.requestPrice(
            YES_OR_NO_IDENTIFIER,
            timestamp,
            ancillaryData,
            IERC20(rewardToken),
            reward
        );
        
        // 如果指定了自定义挑战期，设置它
        if (customLiveness > 0) {
            optimisticOracle.setCustomLiveness(
                YES_OR_NO_IDENTIFIER,
                timestamp,
                ancillaryData,
                customLiveness
            );
        }
        
        // 创建市场记录
        Market storage market = markets[questionId];
        market.questionId = questionId;
        market.conditionId = conditionId;
        market.title = title;
        market.description = description;
        market.outcomeSlotCount = outcomeSlotCount;
        market.requestTimestamp = timestamp;
        market.resolved = false;
        market.rewardToken = rewardToken;
        market.reward = reward;
        
        // 添加到列表
        marketList.push(questionId);
        
        emit MarketInitialized(questionId, conditionId, title, outcomeSlotCount, rewardToken, reward);
        emit OraclePriceRequested(questionId, timestamp, rewardToken, reward);
        
        return conditionId;
    }
    
    /**
     * @notice 解析市场（从 Oracle 获取价格）
     * @param questionId 问题ID
     */
    function resolve(bytes32 questionId) external {
        Market storage market = markets[questionId];
        
        require(market.requestTimestamp > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        
        // 构建 ancillaryData（必须与初始化时相同）
        bytes memory ancillaryData = abi.encodePacked(
            "title:", market.title,
            ",description:", market.description
        );
        
        // 从 Oracle 获取并结算价格
        int256 price = optimisticOracle.settleAndGetPrice(
            YES_OR_NO_IDENTIFIER,
            market.requestTimestamp,
            ancillaryData
        );
        
        // 转换价格为 payouts
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
            // INVALID/TIE - 平分
            payouts[0] = 1;
            payouts[1] = 1;
        } else {
            revert("Invalid oracle price");
        }
        
        // 在 CTF 上报告结果
        ctf.reportPayouts(questionId, payouts);
        
        // 更新市场状态
        market.resolved = true;
        market.payouts = payouts;
        
        emit MarketResolved(questionId, market.conditionId, payouts, price);
    }
    
    /**
     * @notice 检查市场是否可以解析
     * @param questionId 问题ID
     * @return 如果 Oracle 有价格则返回 true
     */
    function canResolve(bytes32 questionId) external view returns (bool) {
        Market memory market = markets[questionId];
        
        if (market.requestTimestamp == 0 || market.resolved) {
            return false;
        }
        
        bytes memory ancillaryData = abi.encodePacked(
            "title:", market.title,
            ",description:", market.description
        );
        
        return optimisticOracle.hasPrice(
            address(this),
            YES_OR_NO_IDENTIFIER,
            market.requestTimestamp,
            ancillaryData
        );
    }
    
    // =============================================================
    //                        查询函数
    // =============================================================
    
    function getMarket(bytes32 questionId) external view returns (Market memory) {
        return markets[questionId];
    }
    
    function getMarketCount() external view returns (uint256) {
        return marketList.length;
    }
    
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
    
    // =============================================================
    //                        管理函数
    // =============================================================
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}


