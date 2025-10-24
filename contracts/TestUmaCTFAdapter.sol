// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Mock Oracle Interface（简化版，用于测试）
interface IMockOracle {
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
 * @title TestUmaCTFAdapter
 * @notice 测试版 UMA-CTF 适配器，使用 Mock Oracle
 * @dev 允许使用任意 ERC20 代币作为奖励（包括 Mock USDC）
 */
contract TestUmaCTFAdapter {
    
    // =============================================================
    //                          存储变量
    // =============================================================
    
    ConditionalTokens public immutable ctf;
    IMockOracle public immutable oracle;
    address public owner;
    
    bytes32 public constant YES_OR_NO_IDENTIFIER = bytes32("YES_OR_NO_QUERY");
    
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
    
    bytes32[] public marketList;
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
    
    constructor(address _ctf, address _oracle) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_oracle != address(0), "Invalid Oracle address");
        
        ctf = ConditionalTokens(_ctf);
        oracle = IMockOracle(_oracle);
        owner = msg.sender;
    }
    
    // =============================================================
    //                        核心函数
    // =============================================================
    
    /**
     * @notice 初始化新市场
     * @param questionId 问题ID
     * @param title 市场标题
     * @param description 市场描述
     * @param outcomeSlotCount 结果数量（通常是2）
     * @param rewardToken 奖励代币地址（可以是任意 ERC20，包括 Mock USDC）
     * @param reward 奖励金额
     * @param customLiveness 自定义挑战期（未使用，保持接口兼容）
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
            // Mock Oracle 不需要 approve，直接传递参数即可
        }
        
        // 在 CTF 上准备条件
        ctf.prepareCondition(address(this), questionId, outcomeSlotCount);
        
        // 获取条件ID
        conditionId = ctf.getConditionId(address(this), questionId, outcomeSlotCount);
        
        // 构建 ancillaryData
        bytes memory ancillaryData = abi.encodePacked(
            "title:", title,
            ",description:", description
        );
        
        // 当前时间戳
        uint256 timestamp = block.timestamp;
        
        // 向 Mock Oracle 请求价格（Mock Oracle 不会失败）
        oracle.requestPrice(
            YES_OR_NO_IDENTIFIER,
            timestamp,
            ancillaryData,
            rewardToken, // Mock Oracle 接受任意代币
            reward
        );
        
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
        
        marketList.push(questionId);
        
        emit MarketInitialized(
            questionId,
            conditionId,
            title,
            outcomeSlotCount,
            rewardToken,
            reward
        );
        
        return conditionId;
    }
    
    /**
     * @notice 解析市场
     * @param questionId 问题ID
     * @return success 是否成功
     */
    function resolve(bytes32 questionId) external returns (bool) {
        Market storage market = markets[questionId];
        require(market.requestTimestamp > 0, "Market does not exist");
        require(!market.resolved, "Already resolved");
        
        bytes memory ancillaryData = abi.encodePacked(
            "title:", market.title,
            ",description:", market.description
        );
        
        // 检查 Oracle 是否有价格
        bool hasPrice = oracle.hasPrice(
            YES_OR_NO_IDENTIFIER,
            market.requestTimestamp,
            ancillaryData
        );
        
        require(hasPrice, "Oracle price not available");
        
        // 获取 Oracle 价格
        int256 price = oracle.getPrice(
            YES_OR_NO_IDENTIFIER,
            market.requestTimestamp,
            ancillaryData
        );
        
        // 转换价格为 payouts
        uint256[] memory payouts = new uint256[](market.outcomeSlotCount);
        
        if (price == 1e18) {
            // YES
            payouts[0] = 1;
            payouts[1] = 0;
        } else if (price == 0) {
            // NO
            payouts[0] = 0;
            payouts[1] = 1;
        } else {
            // INVALID - 平分
            payouts[0] = 1;
            payouts[1] = 1;
        }
        
        // 在 CTF 上报告 payouts
        ctf.reportPayouts(questionId, payouts);
        
        // 更新市场状态
        market.resolved = true;
        market.payouts = payouts;
        
        emit MarketResolved(questionId, market.conditionId, payouts, price);
        
        return true;
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
    
    function getMarketList(uint256 offset, uint256 limit) external view returns (bytes32[] memory) {
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
    
    function canResolve(bytes32 questionId) external view returns (bool) {
        Market storage market = markets[questionId];
        if (market.requestTimestamp == 0 || market.resolved) {
            return false;
        }
        
        bytes memory ancillaryData = abi.encodePacked(
            "title:", market.title,
            ",description:", market.description
        );
        
        return oracle.hasPrice(
            YES_OR_NO_IDENTIFIER,
            market.requestTimestamp,
            ancillaryData
        );
    }
}

