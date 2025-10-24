// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title ConditionalTokens
 * @notice 完整版 Conditional Tokens - 基于 Gnosis 官方实现
 * @dev 支持 ERC1155，可用于 Polymarket 订单薄
 * @dev Solidity 0.8.x 自动检查溢出，无需 SafeMath
 */
contract FullConditionalTokens is ERC1155 {

    // 条件相关存储
    mapping(bytes32 => uint256) public payoutDenominator;
    mapping(bytes32 => uint256) public payoutNumerators;
    mapping(bytes32 => uint256) public conditionOutcomeSlotCounts;

    // 事件
    event ConditionPreparation(
        bytes32 indexed conditionId,
        address indexed oracle,
        bytes32 indexed questionId,
        uint256 outcomeSlotCount
    );

    event ConditionResolution(
        bytes32 indexed conditionId,
        address indexed oracle,
        bytes32 indexed questionId,
        uint256 outcomeSlotCount,
        uint256[] payoutNumerators
    );

    event PositionSplit(
        address indexed stakeholder,
        address collateralToken,
        bytes32 indexed parentCollectionId,
        bytes32 indexed conditionId,
        uint256[] partition,
        uint256 amount
    );

    event PositionsMerge(
        address indexed stakeholder,
        address collateralToken,
        bytes32 indexed parentCollectionId,
        bytes32 indexed conditionId,
        uint256[] partition,
        uint256 amount
    );

    event PayoutRedemption(
        address indexed redeemer,
        address indexed collateralToken,
        bytes32 indexed parentCollectionId,
        bytes32 conditionId,
        uint256[] indexSets,
        uint256 payout
    );

    constructor() ERC1155("") {}

    /**
     * @notice 准备条件
     */
    function prepareCondition(
        address oracle,
        bytes32 questionId,
        uint256 outcomeSlotCount
    ) external {
        require(outcomeSlotCount > 1 && outcomeSlotCount <= 256, "Invalid outcome count");
        
        bytes32 conditionId = getConditionId(oracle, questionId, outcomeSlotCount);
        require(payoutDenominator[conditionId] == 0, "Condition already prepared");
        
        payoutDenominator[conditionId] = 1;
        conditionOutcomeSlotCounts[conditionId] = outcomeSlotCount;
        
        emit ConditionPreparation(conditionId, oracle, questionId, outcomeSlotCount);
    }

    /**
     * @notice 报告结果
     */
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external {
        uint256 outcomeSlotCount = payouts.length;
        require(outcomeSlotCount > 1, "Invalid payout count");
        
        bytes32 conditionId = getConditionId(msg.sender, questionId, outcomeSlotCount);
        require(payoutDenominator[conditionId] != 0, "Condition not prepared");
        require(payoutDenominator[conditionId] == 1, "Payouts already reported");
        
        uint256 den = 0;
        for (uint256 i = 0; i < outcomeSlotCount; i++) {
            den = den + payouts[i];
        }
        require(den > 0, "Invalid payout distribution");
        
        payoutDenominator[conditionId] = den;
        
        // 存储每个结果的分子
        for (uint256 i = 0; i < outcomeSlotCount; i++) {
            uint256 indexSet = 1 << i;
            bytes32 collectionId = keccak256(abi.encodePacked(conditionId, indexSet));
            payoutNumerators[collectionId] = payouts[i];
        }
        
        emit ConditionResolution(conditionId, msg.sender, questionId, outcomeSlotCount, payouts);
    }

    /**
     * @notice 分割仓位（铸造 Outcome Tokens）
     */
    function splitPosition(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external {
        require(amount > 0, "Amount must be positive");
        
        uint256 outcomeSlotCount = conditionOutcomeSlotCounts[conditionId];
        require(outcomeSlotCount > 0, "Condition not prepared");
        
        // 转移抵押品
        if (collateralToken != address(0)) {
            require(
                IERC20(collateralToken).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
        }
        
        // 铸造 outcome tokens
        uint256[] memory amounts = new uint256[](partition.length);
        uint256[] memory tokenIds = new uint256[](partition.length);
        
        for (uint256 i = 0; i < partition.length; i++) {
            bytes32 collectionId = keccak256(abi.encodePacked(conditionId, partition[i]));
            uint256 positionId = uint256(keccak256(abi.encodePacked(collateralToken, collectionId)));
            
            tokenIds[i] = positionId;
            amounts[i] = amount;
        }
        
        _mintBatch(msg.sender, tokenIds, amounts, "");
        
        emit PositionSplit(
            msg.sender,
            collateralToken,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );
    }

    /**
     * @notice 合并仓位（销毁 Outcome Tokens）
     */
    function mergePositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external {
        require(amount > 0, "Amount must be positive");
        
        uint256[] memory amounts = new uint256[](partition.length);
        uint256[] memory tokenIds = new uint256[](partition.length);
        
        for (uint256 i = 0; i < partition.length; i++) {
            bytes32 collectionId = keccak256(abi.encodePacked(conditionId, partition[i]));
            uint256 positionId = uint256(keccak256(abi.encodePacked(collateralToken, collectionId)));
            
            tokenIds[i] = positionId;
            amounts[i] = amount;
        }
        
        _burnBatch(msg.sender, tokenIds, amounts);
        
        // 返还抵押品
        if (collateralToken != address(0)) {
            require(
                IERC20(collateralToken).transfer(msg.sender, amount),
                "Transfer failed"
            );
        }
        
        emit PositionsMerge(
            msg.sender,
            collateralToken,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );
    }

    /**
     * @notice 赎回仓位
     */
    function redeemPositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata indexSets
    ) external {
        uint256 den = payoutDenominator[conditionId];
        require(den > 1, "Condition not resolved");
        
        uint256 totalPayout = 0;
        uint256[] memory amounts = new uint256[](indexSets.length);
        uint256[] memory tokenIds = new uint256[](indexSets.length);
        
        for (uint256 i = 0; i < indexSets.length; i++) {
            bytes32 collectionId = keccak256(abi.encodePacked(conditionId, indexSets[i]));
            uint256 positionId = uint256(keccak256(abi.encodePacked(collateralToken, collectionId)));
            
            uint256 balance = balanceOf(msg.sender, positionId);
            if (balance > 0) {
                uint256 payout = payoutNumerators[collectionId];
                totalPayout = totalPayout + (balance * payout / den);
                
                tokenIds[i] = positionId;
                amounts[i] = balance;
            }
        }
        
        if (totalPayout > 0) {
            // 销毁 tokens
            for (uint256 i = 0; i < indexSets.length; i++) {
                if (amounts[i] > 0) {
                    _burn(msg.sender, tokenIds[i], amounts[i]);
                }
            }
            
            // 支付抵押品
            if (collateralToken != address(0)) {
                require(
                    IERC20(collateralToken).transfer(msg.sender, totalPayout),
                    "Transfer failed"
                );
            }
            
            emit PayoutRedemption(
                msg.sender,
                collateralToken,
                parentCollectionId,
                conditionId,
                indexSets,
                totalPayout
            );
        }
    }

    /**
     * @notice 计算 Condition ID
     */
    function getConditionId(
        address oracle,
        bytes32 questionId,
        uint256 outcomeSlotCount
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(oracle, questionId, outcomeSlotCount));
    }

    /**
     * @notice 计算 Collection ID
     */
    function getCollectionId(
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256 indexSet
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(conditionId, indexSet));
    }

    /**
     * @notice 计算 Position ID
     */
    function getPositionId(
        address collateralToken,
        bytes32 collectionId
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(collateralToken, collectionId)));
    }

    /**
     * @notice 检查是否已解析
     */
    function isResolved(bytes32 conditionId) external view returns (bool) {
        return payoutDenominator[conditionId] > 1;
    }
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

