// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IConditionalTokens
 * @notice Conditional Tokens Framework (CTF) 接口
 * @dev 包含 ERC1155 标准接口
 */
interface IConditionalTokens {
    // =============================================================
    //                      CTF 核心函数
    // =============================================================

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

