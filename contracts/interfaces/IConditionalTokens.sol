// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IConditionalTokens
 * @notice Conditional Tokens Framework (CTF) 接口
 * @dev 基于 Gnosis 官方 CTF 框架，与 Polymarket 兼容
 * @dev 包含 ERC1155 标准接口和 CTF 核心功能
 */
interface IConditionalTokens {
    // =============================================================
    //                      CTF 核心函数
    // =============================================================

    /**
     * @notice 准备条件（创建市场）
     */
    function prepareCondition(
        address oracle,
        bytes32 questionId,
        uint256 outcomeSlotCount
    ) external;

    /**
     * @notice 报告结果（解析市场）
     */
    function reportPayouts(
        bytes32 questionId,
        uint256[] calldata payouts
    ) external;

    /**
     * @notice 分割仓位（铸造 Position Tokens）
     * @dev 用户买入时，用 USDC 铸造 Position Tokens
     */
    function splitPosition(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    /**
     * @notice 合并仓位（销毁 Position Tokens）
     * @dev 用户卖出时，销毁 Position Tokens 获得 USDC
     */
    function mergePositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    /**
     * @notice 赎回仓位（提取奖励）
     * @dev 市场解析后，用户提取 USDC 奖励
     */
    function redeemPositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata indexSets
    ) external;

    /**
     * @notice 计算 Condition ID
     */
    function getConditionId(
        address oracle,
        bytes32 questionId,
        uint256 outcomeSlotCount
    ) external pure returns (bytes32);

    /**
     * @notice 计算 Collection ID
     */
    function getCollectionId(
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256 indexSet
    ) external pure returns (bytes32);

    /**
     * @notice 计算 Position ID
     */
    function getPositionId(
        address collateralToken,
        bytes32 collectionId
    ) external pure returns (uint256);

    /**
     * @notice 检查条件是否已解析
     */
    function isResolved(bytes32 conditionId) external view returns (bool);

    // =============================================================
    //                      ERC1155 标准接口
    // =============================================================

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external;

    function balanceOf(address account, uint256 id) external view returns (uint256);

    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory);

    function setApprovalForAll(address operator, bool approved) external;

    function isApprovedForAll(address account, address operator) external view returns (bool);
}

