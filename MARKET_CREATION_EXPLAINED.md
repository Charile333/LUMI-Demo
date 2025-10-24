# 🏗️ 市场创建合约架构说明

## 📊 核心合约

### 主合约：`TestUmaCTFAdapter`
**地址**: `0x5D440c98B55000087a8b0C164f1690551d18CfcC`

**作用**: 
- 🎯 **市场创建的核心合约**
- 管理市场生命周期
- 存储市场信息
- 调度其他合约

---

## 🔄 创建市场流程

当用户在后台创建市场时，调用的是：

### 1. **TestUmaCTFAdapter.initialize()**
```solidity
function initialize(
    bytes32 questionId,      // 问题 ID
    string memory title,     // 市场标题
    string memory description, // 市场描述
    uint256 outcomeSlotCount, // 结果数量（通常是 2：YES/NO）
    address rewardToken,     // 奖励代币（Mock USDC）
    uint256 reward,          // 奖励金额
    uint256 customLiveness   // 自定义挑战期（未使用）
) external returns (bytes32 conditionId)
```

### 这个函数会做什么？

```
步骤 1: 接收 USDC 奖励
  ↓
步骤 2: 调用 ConditionalTokens.prepareCondition()
  → 创建条件（Condition）
  → 生成 Condition ID
  ↓
步骤 3: 调用 MockOracle.requestPrice()
  → 向预言机请求价格数据
  ↓
步骤 4: 存储市场信息
  → 保存到 markets mapping
  → 添加到 marketList 数组
  ↓
步骤 5: 发出事件 MarketInitialized
```

---

## 🧩 涉及的合约

### 1. **TestUmaCTFAdapter** (主合约)
```
地址: 0x5D440c98B55000087a8b0C164f1690551d18CfcC
角色: 市场管理器
功能:
  - initialize() - 创建市场
  - resolve() - 解析市场
  - getMarket() - 查询市场
  - getMarketList() - 获取市场列表
```

### 2. **FullConditionalTokens** (条件代币)
```
地址: 0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
角色: Token 管理器
功能:
  - prepareCondition() - 准备条件（由 Adapter 调用）
  - splitPosition() - 铸造 YES/NO Tokens（用户调用）
  - redeemPositions() - 赎回代币（用户调用）
```

### 3. **MockOptimisticOracle** (预言机)
```
地址: 0x378fA22104E4c735680772Bf18C5195778a55b33
角色: 价格提供者
功能:
  - requestPrice() - 请求价格（由 Adapter 调用）
  - setPrice() - 设置价格（管理员调用）
  - getPrice() - 获取价格（由 Adapter 调用）
```

### 4. **MockUSDC** (奖励代币)
```
地址: 0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a
角色: 奖励代币
功能:
  - transferFrom() - 转移奖励到 Adapter
  - transfer() - 分发奖励
```

---

## 📝 创建市场的完整调用链

```
用户（后台）
  ↓
  调用 TestUmaCTFAdapter.initialize()
  ↓
  ├─→ USDC.transferFrom(user, adapter, reward)
  │   ✅ 接收奖励
  │
  ├─→ FullConditionalTokens.prepareCondition(adapter, questionId, 2)
  │   ✅ 创建条件
  │   ✅ 生成 Condition ID
  │
  ├─→ MockOracle.requestPrice(identifier, timestamp, data, usdc, reward)
  │   ✅ 请求价格数据
  │
  └─→ 存储市场信息
      ✅ markets[questionId] = Market{...}
      ✅ marketList.push(questionId)
      ✅ emit MarketInitialized(...)
```

---

## 🎯 各合约的职责

### TestUmaCTFAdapter（管理员）
```
负责:
  ✅ 接收用户创建市场请求
  ✅ 协调其他合约
  ✅ 存储市场元数据
  ✅ 管理市场状态
  ✅ 解析市场结果

不负责:
  ❌ Token 铸造（由 FullCTF 负责）
  ❌ 价格确定（由 Oracle 负责）
  ❌ 订单交易（由 Exchange 负责）
```

### FullConditionalTokens（Token 工厂）
```
负责:
  ✅ 准备条件（创建市场时）
  ✅ 铸造 Outcome Tokens（用户交易时）
  ✅ 管理 Token 余额
  ✅ 赎回代币（市场解析后）

不负责:
  ❌ 市场元数据（由 Adapter 负责）
  ❌ 价格确定（由 Oracle 负责）
```

### MockOptimisticOracle（裁判）
```
负责:
  ✅ 接收价格请求
  ✅ 存储价格数据
  ✅ 提供价格给 Adapter

不负责:
  ❌ 市场创建（由 Adapter 负责）
  ❌ Token 管理（由 CTF 负责）
```

---

## 💡 为什么需要这么多合约？

### 设计原则：职责分离

```
TestUmaCTFAdapter (业务逻辑层)
  ↓ 调用
FullConditionalTokens (Token 层)
  ↓ 查询
MockOptimisticOracle (数据层)
```

### 好处：
1. **模块化** - 每个合约职责单一
2. **可升级** - 可以单独升级某个模块
3. **安全** - 降低单点失败风险
4. **兼容** - 符合 Polymarket 标准架构

---

## 📊 实际创建流程示例

### 用户操作
```javascript
// 前端: app/admin/test-market/page.tsx

// 1. 用户填写表单
title: "AI 会在 2025 年超越人类吗？"
description: "预测 AI 技术发展"
reward: 10 USDC

// 2. 批准 USDC
await usdc.approve(adapterAddress, 10 USDC)

// 3. 调用创建市场
await adapter.initialize(
  questionId,
  title,
  description,
  2,              // YES/NO
  usdcAddress,
  10 USDC,
  0               // liveness（未使用）
)
```

### 合约执行（自动）
```
TestUmaCTFAdapter:
  ├─ 接收 10 USDC ✅
  ├─ 调用 FullCTF.prepareCondition() ✅
  ├─ 调用 Oracle.requestPrice() ✅
  ├─ 存储市场信息 ✅
  └─ 返回 Condition ID ✅

Gas 消耗: ~200,000
```

---

## 🔍 如何查看创建的市场？

### 方法 1: 通过前端
```
访问: http://localhost:3000
自动从 TestUmaCTFAdapter 读取市场列表
```

### 方法 2: 通过合约
```javascript
// 查询市场数量
await adapter.getMarketCount()  // 返回: 2

// 获取市场列表
await adapter.getMarketList(0, 10)  // 返回: [questionId1, questionId2]

// 获取市场详情
await adapter.getMarket(questionId)  // 返回市场所有信息
```

### 方法 3: 通过脚本
```bash
npx hardhat run scripts/verify-market-creation.js --network amoy
```

---

## 📋 总结

### 创建市场的合约是：`TestUmaCTFAdapter`

**地址**: `0x5D440c98B55000087a8b0C164f1690551d18CfcC`

**它的作用**:
1. ✅ 接收创建市场请求
2. ✅ 调用 FullConditionalTokens 准备条件
3. ✅ 调用 Oracle 请求价格
4. ✅ 存储市场信息
5. ✅ 管理市场生命周期

**它不直接负责**:
- ❌ Token 铸造（由 FullConditionalTokens 负责）
- ❌ 订单交易（由 CTFExchange 负责）
- ❌ 价格确定（由 Oracle 负责）

**合约类型**: **Adapter（适配器）**
- 连接用户和底层合约
- 提供简化的接口
- 管理业务逻辑

---

## 🎯 快速参考

| 功能 | 合约 | 地址 |
|------|------|------|
| **创建市场** | TestUmaCTFAdapter | 0x5D440c98... |
| 准备条件 | FullConditionalTokens | 0xb171BBc6... |
| 价格请求 | MockOptimisticOracle | 0x378fA221... |
| 奖励代币 | MockUSDC | 0x8d2dae90... |
| 订单交易 | CTFExchange | 0x213F1F4F... |

---

**创建时间**: 2025-10-23  
**网络**: Polygon Amoy Testnet  
**已创建市场**: 2 个







