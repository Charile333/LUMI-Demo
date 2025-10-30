# 🔄 切换到Polymarket官方UMA预言机指南

## 📊 当前状态

您的项目有**三个预言机**选项：

| 预言机 | 类型 | 状态 | 说明 |
|--------|------|------|------|
| **MockOptimisticOracle** | Mock测试版 | ✅ 当前使用 | 自己实现，仅供测试 |
| **TestUmaCTFAdapter** | 测试适配器 | ✅ 当前使用 | 连接Mock预言机 |
| **RealUmaCTFAdapter** | 真实UMA | ⏳ 需要部署 | **Polymarket官方使用的** |

---

## 🎯 目标

切换到 **UMA Optimistic Oracle V2**（Polymarket官方使用的预言机）

**UMA预言机地址** (Polygon Amoy测试网):
```
0x263351499f82C107e540B01F0Ca959843e22464a
```

这是UMA官方部署的，**Polymarket也使用这个预言机系统**！

---

## 🚀 切换步骤

### 步骤1: 配置私钥（如果还没有）

编辑 `.env.local` 文件（如果没有则创建）：

```bash
# 添加您的私钥（用于部署合约）
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Amoy RPC URL（可选，使用默认也可以）
AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

⚠️ **获取测试币**: https://faucet.polygon.technology/

---

### 步骤2: 部署RealUmaCTFAdapter合约

```bash
npx hardhat run scripts/deploy-real-uma-adapter.js --network amoy
```

部署成功后，会在 `deployments/amoy-real-uma.json` 生成配置文件。

**记下这三个地址**：
- ConditionalTokens 地址
- RealUmaCTFAdapter 地址  
- UMA Oracle 地址: `0x263351499f82C107e540B01F0Ca959843e22464a`

---

### 步骤3: 更新前端配置

需要更新**3个文件**中的合约地址：

#### 📁 文件1: `lib/blockchainService.ts`

```typescript
// 当前配置（Mock版本）
const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',  // ❌ 旧的
  fullCtf: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  exchange: '0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};

// 修改为（真实UMA）
const CONTRACTS = {
  realAdapter: 'YOUR_DEPLOYED_REAL_ADAPTER_ADDRESS',  // ✅ 新的
  conditionalTokens: 'YOUR_CONDITIONAL_TOKENS_ADDRESS',
  exchange: '0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',  // ✅ UMA官方
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};
```

#### 📁 文件2: `lib/providers/blockchain.ts`

```typescript
// 第10-13行修改
const CONTRACTS = {
  realAdapter: 'YOUR_DEPLOYED_REAL_ADAPTER_ADDRESS',  // ✅ 改这里
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',  // ✅ 添加这行
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};
```

#### 📁 文件3: `lib/market-activation/blockchain-activator.ts`

```typescript
// 第7-11行修改
const CONTRACTS = {
  adapter: 'YOUR_DEPLOYED_REAL_ADAPTER_ADDRESS',  // ✅ 改这里
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  ctf: 'YOUR_CONDITIONAL_TOKENS_ADDRESS',  // ✅ 改这里
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a'  // ✅ 添加这行
};
```

---

### 步骤4: 更新ABI（如果需要）

`RealUmaCTFAdapter` 的ABI与 `TestUmaCTFAdapter` 基本相同，但增加了几个函数：

```typescript
const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
  
  // ✅ 新增：UMA相关函数
  "function resolve(bytes32 questionId) external",
  "function requestOraclePrice(bytes32 questionId) external returns (uint256)"
];
```

---

## 🔍 验证切换成功

### 1. 检查预言机类型

访问区块链浏览器验证：
```
https://amoy.polygonscan.com/address/0x263351499f82C107e540B01F0Ca959843e22464a
```

应该显示是UMA官方的 `OptimisticOracleV2` 合约。

### 2. 测试市场创建

创建一个测试市场，验证工作流程：

```javascript
// 1. 创建市场
await adapter.initialize(
  questionId,
  "Test Market",
  "Will this work?",
  2,  // YES/NO
  mockUSDC.address,
  ethers.utils.parseUnits("100", 6),  // 100 USDC奖励
  0   // 使用默认挑战期（2小时）
);

// 2. 等待市场到期...

// 3. 请求UMA预言机价格
await adapter.requestOraclePrice(questionId);

// 4. 等待挑战期（2小时）

// 5. 解析市场
await adapter.resolve(questionId);
```

---

## ⚠️ 重要区别

### Mock预言机 vs 真实UMA预言机

| 特性 | Mock预言机 | 真实UMA预言机 |
|------|-----------|--------------|
| **结算方式** | 手动设置 | 提案+争议 |
| **挑战期** | 无 | 2小时 |
| **去中心化** | ❌ | ✅ |
| **提案奖励** | 无 | 有（需要质押代币） |
| **适用环境** | 测试 | 生产 |
| **成本** | 免费 | 需要代币奖励 |

### 使用真实UMA的注意事项

1. **奖励代币必须在UMA白名单中**
   - 测试网可以使用Mock USDC
   - 主网需要使用真实的USDC或其他白名单代币

2. **需要等待真实的挑战期**
   - 默认2小时
   - 可以自定义（customLiveness参数）

3. **提案者需要质押代币**
   - 防止恶意提案
   - 正确提案会获得奖励

4. **任何人都可以提出争议**
   - 如果有争议，UMA代币持有者投票
   - 这是Polymarket使用的去中心化裁决机制

---

## 📚 参考资料

### UMA官方文档
- 官网: https://uma.xyz
- 文档: https://docs.uma.xyz/developers/optimistic-oracle-v2
- GitHub: https://github.com/UMAprotocol/protocol

### Polymarket参考
- uma-ctf-adapter: https://github.com/Polymarket/uma-ctf-adapter
- CTF Exchange: https://github.com/Polymarket/ctf-exchange

---

## 🎯 总结

完成切换后，您的预测市场将使用：

✅ **与Polymarket完全相同的预言机系统**  
✅ **去中心化的结果裁决机制**  
✅ **真实的提案/争议流程**  
✅ **UMA官方的Optimistic Oracle V2**

这就是**Polymarket官方使用的预言机架构**！🎉

---

需要帮助？参考项目文档 `UMA预言机使用说明.md` 获取更多详细信息。

