# 🚀 生产环境部署指南

## 📋 从本地测试到生产环境的完整流程

---

## ✅ 当前状态

你已经完成：
- ✅ 本地 Hardhat 节点测试
- ✅ 合约功能验证
- ✅ 前端集成测试
- ✅ MetaMask 连接测试

---

## 🎯 切换到真实 BSC 合约

### 自动切换机制（已内置）

你的代码已经支持**自动网络检测**：

```typescript
// components/ConditionalTokens/useConditionalTokens.ts

// 根据用户的网络自动选择合约地址
if (network.chainId === 31337) {
  contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // 本地
} else if (network.chainId === 56) {
  contractAddress = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";  // BSC 主网 ✅
}
```

**无需修改代码！用户切换网络即可自动使用对应合约。**

---

## 🔧 配置说明

### 1. 环境变量配置

创建 `.env.production` 文件（生产环境）：

```env
# BSC 真实合约地址（已硬编码在代码中，可选配置）
NEXT_PUBLIC_CONTRACT_ADDRESS=0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7

# 默认网络（可选）
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56

# Supabase 配置（生产环境）
NEXT_PUBLIC_SUPABASE_URL=你的生产环境_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的生产环境_key
SUPABASE_SERVICE_ROLE_KEY=你的生产环境_service_key

# 管理后台密码
ADMIN_PASSWORD=强密码
```

创建 `.env.local` 文件（本地开发）：

```env
# 本地 Hardhat 合约地址
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# 本地网络
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337

# Supabase 配置（开发环境）
NEXT_PUBLIC_SUPABASE_URL=你的开发环境_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的开发环境_key
SUPABASE_SERVICE_ROLE_KEY=你的开发环境_service_key

# 管理后台密码
ADMIN_PASSWORD=admin123
```

---

## 🎨 前端页面配置

### 测试页面 vs 生产页面

**测试页面**（保留用于开发）：
- `/test-local` - 本地 Hardhat 测试
- `/test-contract` - BSC 测试网/主网测试

**生产页面**（面向用户）：
- 主要的市场页面（`/automotive`, `/tech-ai` 等）
- 这些页面不直接调用合约创建
- 通过管理后台创建市场数据

---

## 🔐 需要保留的接口

### 1. 合约查询接口（只读）

**已实现**：
```typescript
// 查询 Condition ID
getConditionId(oracle, questionId, outcomeCount)

// 查询结果数量
getOutcomeSlotCount(conditionId)

// 检查条件是否已解决
checkConditionResolved(conditionId)
```

**用途**：
- 在前端显示市场状态
- 验证市场是否存在
- 检查市场是否已结算

---

### 2. 合约写入接口（需要钱包）

**已实现**：
```typescript
// 创建市场（需要管理员权限）
createMarket(questionId, outcomeCount)
```

**用途**：
- 管理员创建新市场
- 后台管理功能

---

### 3. 网络检测接口

**已实现**：
```typescript
// 自动检测用户网络
const network = await provider.getNetwork();

// 根据 chainId 选择合约
if (network.chainId === 56) {
  // 使用 BSC 主网合约
}
```

---

## 📊 建议的接口扩展

### 1. 市场解决接口（未来需要）

```typescript
// 报告市场结果
reportPayouts(conditionId, payouts)

// 示例：
// YES 赢了：reportPayouts(conditionId, [1, 0])
// NO 赢了：reportPayouts(conditionId, [0, 1])
```

**需要添加**：
```typescript
const reportPayouts = async (
  conditionId: string,
  payouts: number[]
) => {
  const contract = await getWritableContract();
  const tx = await contract.reportPayouts(conditionId, payouts);
  return await tx.wait();
};
```

---

### 2. 用户下注接口（未来需要）

Conditional Tokens 本身不处理下注，需要额外的合约：
- Fixed Product Market Maker (FPMM)
- 或其他 AMM 合约

---

### 3. 查询用户持仓接口（未来需要）

```typescript
// 查询用户的 Token 余额
getUserBalance(address, positionId)
```

---

## 🚦 部署前检查清单

### 阶段 1: 开发环境测试 ✅（已完成）

- [x] 本地 Hardhat 节点运行正常
- [x] 合约功能测试通过
- [x] 前端集成测试通过
- [x] MetaMask 连接正常
- [x] 创建市场功能正常

---

### 阶段 2: BSC 测试网验证（建议）

**目的**：在真实区块链环境测试，但使用测试币

#### 步骤：

1. **在 MetaMask 添加 BSC 测试网**：
```
网络名称: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
货币符号: BNB
区块浏览器: https://testnet.bscscan.com
```

2. **获取测试 BNB**：
   - 访问：https://testnet.bnbchain.org/faucet-smart
   - 输入你的钱包地址
   - 领取测试 BNB

3. **在测试网上创建 1-2 个市场**：
   - 访问 `/test-contract` 页面
   - 切换到 BSC 测试网
   - 创建市场并验证

4. **验证项目**：
   - [ ] 能连接 BSC 测试网
   - [ ] 能创建市场
   - [ ] Gas 消耗合理
   - [ ] 交易能在 BSCScan 上查看

---

### 阶段 3: BSC 主网小额测试（上线前）

**目的**：在生产环境最终验证

#### 准备：

1. **测试钱包**（不要用主钱包）
2. **少量 BNB**（约 0.02 BNB = ~$6）
3. **创建 2-3 个真实市场**

#### 步骤：

1. **在 MetaMask 切换到 BSC 主网**

2. **创建测试市场**：
   - 创建 1 个二元市场
   - 创建 1 个多选市场
   - 记录 Gas 消耗

3. **验证项目**：
   - [ ] 能连接 BSC 主网
   - [ ] 能创建市场
   - [ ] 在 BSCScan 上能看到交易
   - [ ] Gas 成本符合预期（~$0.10-0.30）

---

### 阶段 4: 生产环境部署

#### 部署步骤：

1. **配置生产环境变量**：
```bash
# .env.production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56
NEXT_PUBLIC_SUPABASE_URL=生产环境_url
# ... 其他配置
```

2. **构建生产版本**：
```bash
npm run build
```

3. **部署到服务器**：
```bash
# Vercel
vercel --prod

# 或其他平台
npm start
```

4. **验证部署**：
   - [ ] 网站可访问
   - [ ] MetaMask 连接正常
   - [ ] 能切换到 BSC 主网
   - [ ] 测试页面功能正常

---

## 📝 生产环境注意事项

### 1. 权限管理

**创建市场功能**应该：
- ❌ 不对普通用户开放
- ✅ 只有管理员可以访问
- ✅ 通过后台管理页面操作

建议在 `/admin/markets` 添加身份验证：
```typescript
// 检查管理员权限
if (!isAdmin) {
  return <div>需要管理员权限</div>;
}
```

---

### 2. Gas 费用管理

**建议方案**：
- 创建专用的管理钱包
- 只用于创建市场
- 定期充值 BNB
- 监控 Gas 消耗

**成本估算**（BSC 主网）：
- 二元市场：~$0.10/个
- 多选市场：~$0.15/个
- 每月 100 个市场：~$10-15

---

### 3. 错误处理

生产环境需要完善的错误处理：

```typescript
try {
  const receipt = await createMarket(questionId, outcomeCount);
  // 成功处理
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Gas 费用不足，通知管理员充值
  } else if (error.message.includes('user rejected')) {
    // 用户取消，记录日志
  } else {
    // 其他错误，发送告警
  }
}
```

---

### 4. 日志记录

建议添加日志系统：
```typescript
// 记录每次市场创建
console.log({
  timestamp: new Date(),
  action: 'createMarket',
  questionId,
  outcomeCount,
  txHash,
  gasUsed,
  operator: walletAddress
});
```

---

## 🔗 相关合约接口文档

### Conditional Tokens 主要函数

```solidity
// 创建条件（市场）
function prepareCondition(
    address oracle,
    bytes32 questionId,
    uint outcomeSlotCount
) external;

// 报告结果
function reportPayouts(
    bytes32 questionId,
    uint[] calldata payouts
) external;

// 查询 Condition ID
function getConditionId(
    address oracle,
    bytes32 questionId,
    uint outcomeSlotCount
) external pure returns (bytes32);

// 查询结果数量
function getOutcomeSlotCount(
    bytes32 conditionId
) external view returns (uint);
```

---

## 🎯 推荐的工作流

### 开发阶段（现在）
```
本地 Hardhat 网络 (Chain ID: 31337)
    ↓
快速迭代测试
    ↓
验证功能正确性
```

### 测试阶段（下一步）
```
BSC 测试网 (Chain ID: 97)
    ↓
真实区块链环境
    ↓
使用测试 BNB（免费）
```

### 预发布阶段
```
BSC 主网小额测试 (Chain ID: 56)
    ↓
2-3 个真实市场
    ↓
验证生产环境（约 $0.50）
```

### 生产阶段
```
BSC 主网正式运营
    ↓
管理员创建市场
    ↓
用户参与预测
```

---

## 📚 相关文档

- [BSC 主网配置](https://docs.bnbchain.org/docs/wallet/metamask)
- [Conditional Tokens 文档](https://docs.gnosis.io/conditionaltokens/)
- [合约地址](https://bscscan.com/address/0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7)

---

## 💡 总结

### 需要保留的接口

| 接口 | 用途 | 优先级 |
|------|------|--------|
| `createMarket()` | 创建市场 | P0（已有） |
| `getConditionId()` | 查询 ID | P0（已有） |
| `getOutcomeSlotCount()` | 查询选项数 | P1（已有） |
| `checkConditionResolved()` | 检查是否结算 | P1（已有） |
| `reportPayouts()` | 报告结果 | P0（待添加） |
| `getUserBalance()` | 查询持仓 | P2（未来） |

### 切换到生产环境的步骤

1. ✅ **无需修改代码**（已自动支持）
2. ✅ **配置环境变量**（可选）
3. ✅ **BSC 测试网验证**（强烈建议）
4. ✅ **小额主网测试**（建议）
5. ✅ **正式部署上线**

---

**你的代码已经完全支持切换到真实合约！** 🚀

只需要用户在 MetaMask 中切换到 BSC 主网，代码会自动使用真实合约地址！

---

**最后更新**: 2025-10-21  
**当前合约**: 0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7  
**部署状态**: ✅ 就绪

