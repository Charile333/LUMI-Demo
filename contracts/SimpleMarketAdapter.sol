// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleMarketAdapter
 * @notice 极简版市场适配器 - 移除了 Oracle 依赖
 * @dev 仅用于学习和测试，不依赖 UMA Oracle
 * 
 * 核心功能：
 * - 创建市场
 * - 管理市场状态
 * - 手动解析市场（由管理员）
 * - 查询市场信息
 */

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

contract SimpleMarketAdapter {
    
    // =============================================================
    //                          存储变量
    // =============================================================
    
    /// @notice Conditional Tokens Framework 合约
    IConditionalTokens public immutable ctf;
    
    /// @notice 合约所有者（可以解析市场）
    address public owner;
    
    /// @notice 市场信息结构
    struct Market {
        bytes32 questionId;      // 问题ID
        bytes32 conditionId;     // 条件ID
        string title;            // 市场标题
        string description;      // 市场描述
        uint256 outcomeSlotCount; // 结果数量（通常是2：YES/NO）
        uint256 createdAt;       // 创建时间
        bool resolved;           // 是否已解析
        uint256[] payouts;       // 解析结果
    }
    
    /// @notice 市场列表
    bytes32[] public marketList;
    
    /// @notice 问题ID => 市场信息
    mapping(bytes32 => Market) public markets;
    
    // =============================================================
    //                            事件
    // =============================================================
    
    event MarketCreated(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        string title,
        uint256 outcomeSlotCount
    );
    
    event MarketResolved(
        bytes32 indexed questionId,
        bytes32 indexed conditionId,
        uint256[] payouts
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
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
    
    constructor(address _ctf) {
        require(_ctf != address(0), "Invalid CTF address");
        ctf = IConditionalTokens(_ctf);
        owner = msg.sender;
    }
    
    // =============================================================
    //                        核心函数
    // =============================================================
    
    /**
     * @notice 创建新市场
     * @param questionId 问题ID（唯一标识符）
     * @param title 市场标题
     * @param description 市场描述
     * @param outcomeSlotCount 结果数量（通常是2：YES/NO）
     * @return conditionId 条件ID
     */
    function createMarket(
        bytes32 questionId,
        string memory title,
        string memory description,
        uint256 outcomeSlotCount
    ) external returns (bytes32 conditionId) {
        // 检查市场是否已存在
        require(markets[questionId].createdAt == 0, "Market already exists");
        require(outcomeSlotCount >= 2, "Invalid outcome count");
        require(bytes(title).length > 0, "Empty title");
        
        // 在 CTF 上准备条件
        ctf.prepareCondition(address(this), questionId, outcomeSlotCount);
        
        // 获取条件ID
        conditionId = ctf.getConditionId(address(this), questionId, outcomeSlotCount);
        
        // 创建市场记录
        Market storage market = markets[questionId];
        market.questionId = questionId;
        market.conditionId = conditionId;
        market.title = title;
        market.description = description;
        market.outcomeSlotCount = outcomeSlotCount;
        market.createdAt = block.timestamp;
        market.resolved = false;
        
        // 添加到市场列表
        marketList.push(questionId);
        
        emit MarketCreated(questionId, conditionId, title, outcomeSlotCount);
        
        return conditionId;
    }
    
    /**
     * @notice 解析市场（仅管理员）
     * @param questionId 问题ID
     * @param payouts 解析结果数组
     * 
     * @dev 对于 YES/NO 市场：
     *      YES 获胜: payouts = [1, 0]
     *      NO 获胜:  payouts = [0, 1]
     *      平局:     payouts = [1, 1]
     */
    function resolveMarket(
        bytes32 questionId,
        uint256[] memory payouts
    ) external onlyOwner {
        Market storage market = markets[questionId];
        
        require(market.createdAt > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(payouts.length == market.outcomeSlotCount, "Invalid payouts length");
        
        // 在 CTF 上报告结果
        ctf.reportPayouts(questionId, payouts);
        
        // 更新市场状态
        market.resolved = true;
        market.payouts = payouts;
        
        emit MarketResolved(questionId, market.conditionId, payouts);
    }
    
    // =============================================================
    //                        查询函数
    // =============================================================
    
    /**
     * @notice 获取市场信息
     */
    function getMarket(bytes32 questionId) external view returns (Market memory) {
        return markets[questionId];
    }
    
    /**
     * @notice 获取市场数量
     */
    function getMarketCount() external view returns (uint256) {
        return marketList.length;
    }
    
    /**
     * @notice 获取市场列表
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
     * @notice 检查市场是否已解析
     */
    function isMarketResolved(bytes32 questionId) external view returns (bool) {
        return markets[questionId].resolved;
    }
    
    /**
     * @notice 获取市场的解析结果
     */
    function getMarketPayouts(bytes32 questionId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(markets[questionId].resolved, "Market not resolved");
        return markets[questionId].payouts;
    }
    
    // =============================================================
    //                        管理函数
    // =============================================================
    
    /**
     * @notice 转移所有权
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


