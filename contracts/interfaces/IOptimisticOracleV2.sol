// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct RequestSettings {
    bool eventBased;
    bool refundOnDispute;
    bool callbackOnPriceProposed;
    bool callbackOnPriceDisputed;
    bool callbackOnPriceSettled;
    uint256 bond;
    uint256 customLiveness;
}

struct Request {
    address proposer;
    address disputer;
    IERC20 currency;
    bool settled;
    RequestSettings requestSettings;
    int256 proposedPrice;
    int256 resolvedPrice;
    uint256 expirationTime;
    uint256 reward;
    uint256 finalFee;
}

/// @title Optimistic Oracle V2 Interface
/// @notice 真实的 UMA Optimistic Oracle V2 接口
interface IOptimisticOracleV2 {
    function requestPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        IERC20 currency,
        uint256 reward
    ) external returns (uint256 totalBond);

    function proposePrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        int256 proposedPrice
    ) external returns (uint256 totalBond);

    function disputePrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external returns (uint256 totalBond);

    function setBond(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        uint256 bond
    ) external returns (uint256 totalBond);

    function setEventBased(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external;

    function setCustomLiveness(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        uint256 customLiveness
    ) external;

    function settle(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external returns (uint256 payout);

    function settleAndGetPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external returns (int256);

    function getRequest(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (Request memory);

    function hasPrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (bool);

    function defaultLiveness() external view returns (uint256);
}


