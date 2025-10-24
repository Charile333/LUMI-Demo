// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * Mock UMA乐观预言机
 * 仅用于本地测试，模拟UMA预言机的基本功能
 */
contract MockOptimisticOracle {
    
    // 存储价格数据
    int256 private price;
    bool private hasPriceData;
    
    event PriceRequested(
        bytes32 identifier,
        uint256 timestamp,
        bytes ancillaryData
    );
    
    event PriceProposed(
        bytes32 identifier,
        uint256 timestamp,
        int256 proposedPrice
    );
    
    /**
     * 请求价格数据
     */
    function requestPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        address currency,
        uint256 reward
    ) external returns (uint256) {
        emit PriceRequested(identifier, timestamp, ancillaryData);
        return timestamp;
    }
    
    /**
     * 检查是否有价格数据
     */
    function hasPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (bool) {
        return hasPriceData;
    }
    
    /**
     * 获取价格数据
     */
    function getPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (int256) {
        require(hasPriceData, "Price not available");
        return price;
    }
    
    // ========== 测试辅助函数 ==========
    
    /**
     * 设置价格（测试用）
     * @param _price 价格（1e18 = YES, 0 = NO, 5e17 = INVALID）
     */
    function setPrice(int256 _price) external {
        price = _price;
        emit PriceProposed(bytes32(0), block.timestamp, _price);
    }
    
    /**
     * 设置是否有价格数据（测试用）
     */
    function setHasPrice(bool _hasPrice) external {
        hasPriceData = _hasPrice;
    }
}










