// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice 用于测试的 Mock USDC，任何人都可以免费铸造
 */
contract MockUSDC is ERC20 {
    uint8 private _decimals = 6; // USDC 使用 6 位小数

    constructor() ERC20("Mock USDC", "USDC") {}

    /**
     * @notice 任何人都可以免费铸造
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice 自己铸造给自己
     */
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

