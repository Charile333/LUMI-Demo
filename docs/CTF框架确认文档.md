# 🔍 CTF 框架确认文档

## 🎯 目标

确认 LUMI 项目使用的 CTF 框架是否与 Polymarket 使用的官方框架一致。

---

## 📊 当前项目中的 CTF 实现

### 1. 合约文件

#### `contracts/ConditionalTokens.sol`（简化版）

```solidity
/**
 * 简化版 Conditional Tokens 合约
 * 用于本地测试 prepareCondition 功能
 * 
 * 完整实现参考: https://github.com/gnosis/conditional-tokens-contracts
 */
```

**功能**：
- ✅ `prepareCondition()` - 准备条件
- ✅ `reportPayouts()` - 报告结果
- ✅ `getConditionId()` - 计算条件ID
- ❌ **缺少** `splitPosition()` - 分割仓位（铸造tokens）
- ❌ **缺少** `mergePositions()` - 合并仓位（销毁tokens）
- ❌ **缺少** `redeemPositions()` - 赎回仓位（提取奖励）
- ❌ **缺少** ERC1155 支持

**结论**：这是简化版，**不完整**，不能用于生产。

---

#### `contracts/FullConditionalTokens.sol`（完整版）

```solidity
/**
 * @title ConditionalTokens
 * @notice 完整版 Conditional Tokens - 基于 Gnosis 官方实现
 * @dev 支持 ERC1155，可用于 Polymarket 订单薄
 */
contract FullConditionalTokens is ERC1155 {
```

**功能**：
- ✅ `prepareCondition()` - 准备条件
- ✅ `reportPayouts()` - 报告结果
- ✅ `splitPosition()` - 分割仓位（铸造tokens）
- ✅ `mergePositions()` - 合并仓位（销毁tokens）
- ✅ `redeemPositions()` - 赎回仓位（提取奖励）
- ✅ ERC1155 支持
- ✅ 事件支持

**结论**：这是完整版，**功能齐全**，可以用于生产。

---

### 2. 部署信息

从 `deployments/amoy-full-system.json`：

```json
{
  "fullConditionalTokens": {
    "address": "0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2",
    "version": "full-erc1155"
  }
}
```

**结论**：使用的是自己部署的 `FullConditionalTokens` 合约。

---

## 🔍 Polymarket 使用的 CTF 框架

### 官方框架

**Polymarket 使用 Gnosis 官方的 Conditional Tokens Framework**

- **GitHub**: https://github.com/gnosis/conditional-tokens-contracts
- **标准**: ERC1155 标准
- **核心功能**：
  - `prepareCondition()` - 准备条件
  - `splitPosition()` - 分割仓位
  - `mergePositions()` - 合并仓位
  - `redeemPositions()` - 赎回仓位
  - `reportPayouts()` - 报告结果

---

## 📊 对比分析

### 功能对比

| 功能 | Gnosis 官方 | LUMI FullConditionalTokens | LUMI ConditionalTokens |
|------|------------|---------------------------|----------------------|
| `prepareCondition()` | ✅ | ✅ | ✅ |
| `reportPayouts()` | ✅ | ✅ | ✅ |
| `splitPosition()` | ✅ | ✅ | ❌ |
| `mergePositions()` | ✅ | ✅ | ❌ |
| `redeemPositions()` | ✅ | ✅ | ❌ |
| ERC1155 支持 | ✅ | ✅ | ❌ |
| 事件支持 | ✅ | ✅ | ✅ |

### 接口对比

#### LUMI 接口 (`IConditionalTokens.sol`)

```solidity
interface IConditionalTokens {
    function prepareCondition(...) external;
    function reportPayouts(...) external;
    function getConditionId(...) external pure returns (bytes32);
    // ERC1155 标准接口
    function safeTransferFrom(...) external;
    function balanceOf(...) external view returns (uint256);
    // ...
}
```

**问题**：接口中**缺少** `splitPosition()`, `mergePositions()`, `redeemPositions()`

#### Gnosis 官方接口

```solidity
interface IConditionalTokens {
    function prepareCondition(...) external;
    function reportPayouts(...) external;
    function splitPosition(...) external;
    function mergePositions(...) external;
    function redeemPositions(...) external;
    // ERC1155 标准接口
    // ...
}
```

---

## ⚠️ 发现的问题

### 1. 接口不完整

**问题**：`contracts/interfaces/IConditionalTokens.sol` 中缺少关键函数：

- ❌ `splitPosition()` - 用于铸造 Position Tokens
- ❌ `mergePositions()` - 用于销毁 Position Tokens
- ❌ `redeemPositions()` - 用于提取奖励

**影响**：
- 无法使用完整的 CTF 功能
- 无法实现资金托管（方案1）

---

### 2. 合约实现 vs 接口

**现状**：
- ✅ `FullConditionalTokens.sol` 实现了所有功能
- ❌ `IConditionalTokens.sol` 接口不完整

**影响**：
- 其他合约使用接口时，无法调用完整功能
- 需要更新接口定义

---

## ✅ 确认结果

### 1. 合约实现

- ✅ **`FullConditionalTokens.sol`** 是基于 Gnosis 官方实现的完整版
- ✅ **功能齐全**：包含所有核心功能
- ✅ **ERC1155 支持**：符合标准
- ✅ **可以用于生产**

### 2. 接口定义

- ❌ **`IConditionalTokens.sol`** 接口不完整
- ❌ **缺少关键函数**：`splitPosition()`, `mergePositions()`, `redeemPositions()`
- ⚠️ **需要更新接口**

### 3. 与 Polymarket 的兼容性

- ✅ **合约实现兼容**：`FullConditionalTokens.sol` 实现了所有 Gnosis 官方功能
- ⚠️ **接口需要更新**：接口定义不完整
- ✅ **功能对齐**：可以实现与 Polymarket 相同的资金托管方式

---

## 🔧 需要做的修改

### 1. 更新接口定义

**文件**：`contracts/interfaces/IConditionalTokens.sol`

**需要添加**：

```solidity
function splitPosition(
    address collateralToken,
    bytes32 parentCollectionId,
    bytes32 conditionId,
    uint256[] calldata partition,
    uint256 amount
) external;

function mergePositions(
    address collateralToken,
    bytes32 parentCollectionId,
    bytes32 conditionId,
    uint256[] calldata partition,
    uint256 amount
) external;

function redeemPositions(
    address collateralToken,
    bytes32 parentCollectionId,
    bytes32 conditionId,
    uint256[] calldata indexSets
) external;

function getCollectionId(
    bytes32 parentCollectionId,
    bytes32 conditionId,
    uint256 indexSet
) external pure returns (bytes32);

function getPositionId(
    address collateralToken,
    bytes32 collectionId
) external pure returns (uint256);
```

### 2. 确认部署的合约

**确认**：当前部署的合约是 `FullConditionalTokens` 还是 `ConditionalTokens`？

- ✅ 如果是 `FullConditionalTokens`：功能完整，可以使用
- ❌ 如果是 `ConditionalTokens`：功能不完整，需要重新部署

---

## 📝 总结

### ✅ 好消息

1. **合约实现完整**：`FullConditionalTokens.sol` 实现了所有 Gnosis 官方功能
2. **与 Polymarket 兼容**：可以使用相同的资金托管方式
3. **ERC1155 标准**：符合标准，可以与其他系统集成

### ⚠️ 需要修复

1. **接口定义不完整**：需要添加 `splitPosition()`, `mergePositions()`, `redeemPositions()`
2. **确认部署的合约**：确认使用的是完整版还是简化版

### 🎯 结论

**LUMI 的 CTF 框架是基于 Gnosis 官方实现的完整版，与 Polymarket 使用的框架兼容。**

只需要：
1. 更新接口定义
2. 确认部署的合约是完整版

就可以使用与 Polymarket 相同的资金托管方式（方案1）！

---

## 🔗 参考链接

- **Gnosis 官方 CTF**: https://github.com/gnosis/conditional-tokens-contracts
- **Polymarket 文档**: https://docs.polymarket.com/
- **ERC1155 标准**: https://eips.ethereum.org/EIPS/eip-1155





