// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * 简化版 Conditional Tokens 合约
 * 用于本地测试 prepareCondition 功能
 * 
 * 完整实现参考: https://github.com/gnosis/conditional-tokens-contracts
 */
contract ConditionalTokens {
    
    /// @dev 条件信息存储
    mapping(bytes32 => uint) public payoutDenominator;
    
    /// @dev 存储每个条件的结果数量
    mapping(bytes32 => uint) public conditionOutcomeSlotCounts;
    
    event ConditionPreparation(
        bytes32 indexed conditionId,
        address indexed oracle,
        bytes32 indexed questionId,
        uint outcomeSlotCount
    );
    
    event ConditionResolution(
        bytes32 indexed conditionId,
        address indexed oracle,
        bytes32 indexed questionId,
        uint outcomeSlotCount,
        uint[] payoutNumerators
    );

    /**
     * @dev 创建一个新的预测条件
     * @param oracle 预言机地址（决定结果的账户）
     * @param questionId 问题的唯一标识符
     * @param outcomeSlotCount 结果数量（例如 2 表示 YES/NO）
     */
    function prepareCondition(
        address oracle,
        bytes32 questionId,
        uint outcomeSlotCount
    ) external {
        require(outcomeSlotCount > 1, "Outcomes must be at least 2");
        require(outcomeSlotCount <= 256, "Too many outcomes");
        
        bytes32 conditionId = getConditionId(oracle, questionId, outcomeSlotCount);
        
        require(payoutDenominator[conditionId] == 0, "Condition already prepared");
        
        // 初始化条件（denominator > 0 表示条件已创建）
        payoutDenominator[conditionId] = 1;
        conditionOutcomeSlotCounts[conditionId] = outcomeSlotCount;
        
        emit ConditionPreparation(
            conditionId,
            oracle,
            questionId,
            outcomeSlotCount
        );
    }
    
    /**
     * @dev 计算条件 ID
     * @param oracle 预言机地址
     * @param questionId 问题 ID
     * @param outcomeSlotCount 结果数量
     * @return 条件的唯一标识符
     */
    function getConditionId(
        address oracle,
        bytes32 questionId,
        uint outcomeSlotCount
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(oracle, questionId, outcomeSlotCount));
    }
    
    /**
     * @dev 获取条件的结果数量
     * @param conditionId 条件 ID
     * @return 结果数量（如果条件不存在返回 0）
     */
    function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint) {
        return conditionOutcomeSlotCounts[conditionId];
    }
    
    /**
     * @dev 解决条件（设置最终结果）
     * @param questionId 问题 ID
     * @param payouts 每个结果的支付比例
     */
    function reportPayouts(
        bytes32 questionId,
        uint[] calldata payouts
    ) external {
        uint outcomeSlotCount = payouts.length;
        bytes32 conditionId = getConditionId(msg.sender, questionId, outcomeSlotCount);
        
        require(payoutDenominator[conditionId] != 0, "Condition not prepared");
        require(payouts.length > 1, "Must have at least 2 outcomes");
        
        uint den = 0;
        for (uint i = 0; i < payouts.length; i++) {
            uint payout = payouts[i];
            den = den + payout;
        }
        
        require(den > 0, "Invalid payout distribution");
        payoutDenominator[conditionId] = den;
        
        emit ConditionResolution(
            conditionId,
            msg.sender,
            questionId,
            outcomeSlotCount,
            payouts
        );
    }
    
    /**
     * @dev 检查条件是否已解决
     * @param conditionId 条件 ID
     * @return 是否已解决
     */
    function isResolved(bytes32 conditionId) external view returns (bool) {
        return payoutDenominator[conditionId] > 1;
    }
}

