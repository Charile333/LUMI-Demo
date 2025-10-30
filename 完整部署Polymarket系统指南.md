# 🚀 完整部署 Polymarket 系统指南

## 📋 部署内容

本指南将帮您部署完整的 Polymarket 克隆系统，包括：

1. ✅ **UMA 官方预言机** - Optimistic Oracle V2
2. ✅ **Polymarket 官方 CTF Exchange** - 订单簿交易所
3. ✅ **Conditional Tokens Framework** - 预测市场代币系统
4. ✅ **RealUmaCTFAdapter** - UMA 预言机适配器
5. ✅ **完整的配置自动化**

---

## 🎯 部署选项

### 选项 A：一键完整部署（推荐）⭐

使用完整部署脚本，自动部署所有组件并配置系统。

### 选项 B：使用现有合约

复用 Polymarket 官方在测试网的部署。

---

## 📝 准备工作

### 1. 配置私钥

编辑或创建 `.env.local` 文件：

```bash
# 您的钱包私钥（不要包含 0x 前缀）
PRIVATE_KEY=your_private_key_here

# Polygon Amoy RPC URL（可选，使用默认也可以）
AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

⚠️ **安全提示**:
- 不要提交 `.env.local` 到 Git
- 使用测试钱包，不要用存有真实资产的钱包
- 确保 `.gitignore` 包含 `.env.local`

### 2. 获取测试币

访问 Polygon Amoy 水龙头获取测试 POL：

🔗 https://faucet.polygon.technology/

建议获取至少 **1 POL** 用于部署。

### 3. 安装依赖

```bash
npm install
```

---

## 🚀 选项 A：一键完整部署

### 步骤 1: 运行部署脚本

```bash
npx hardhat run scripts/deploy-complete-polymarket-system.js --network amoy
```

### 这个脚本会做什么？

1. **检查或部署 Conditional Tokens**
   - 如果存在则使用现有的
   - 否则部署新的 Full CTF

2. **检查或部署 Mock USDC**
   - 测试用的稳定币
   - 自动铸造 100,000 USDC 到您的地址

3. **配置 CTF Exchange**
   - 默认使用 Polymarket 官方部署 ⭐
   - 地址: `0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40`
   - 或者部署自己的（可在脚本中修改）

4. **部署 RealUmaCTFAdapter**
   - 连接到 UMA 官方预言机
   - 地址: `0x263351499f82C107e540B01F0Ca959843e22464a`

5. **保存部署信息**
   - 生成 `deployments/amoy-complete-polymarket.json`

### 步骤 2: 自动更新配置

```bash
node scripts/update-config-from-deployment.js
```

这会自动更新：
- ✅ `lib/blockchainService.ts`
- ✅ `lib/providers/blockchain.ts`
- ✅ `lib/market-activation/blockchain-activator.ts`

### 步骤 3: 查看配置摘要

```bash
cat POLYMARKET_SYSTEM_CONFIG.md
```

### 步骤 4: 启动服务

```bash
npm run dev
```

---

## 🔧 选项 B：使用现有合约

### 已知的 Polymarket 官方部署

#### Polygon Amoy 测试网

| 合约 | 地址 | 说明 |
|------|------|------|
| **UMA Oracle V2** | `0x263351499f82C107e540B01F0Ca959843e22464a` | ✅ 官方 |
| **CTF Exchange** | `0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40` | ✅ 官方 |

#### 您还需要部署

- **RealUmaCTFAdapter** - 连接 UMA 预言机和 CTF
- **Conditional Tokens** (如果没有)
- **Mock USDC** (测试用)

### 手动配置步骤

1. **部署 RealUmaCTFAdapter**:
```bash
npx hardhat run scripts/deploy-real-uma-adapter.js --network amoy
```

2. **手动更新配置文件**:

编辑 `lib/blockchainService.ts`:
```typescript
const CONTRACTS = {
  realAdapter: 'YOUR_DEPLOYED_ADAPTER_ADDRESS',
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
  conditionalTokens: 'YOUR_CTF_ADDRESS',
  exchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',  // Polymarket 官方
  mockUSDC: 'YOUR_USDC_ADDRESS',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};
```

类似地更新其他两个文件。

---

## 📊 部署后验证

### 1. 检查合约部署

访问 Polygon Amoy 浏览器：

```
https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
```

### 2. 验证 UMA 预言机

```
https://amoy.polygonscan.com/address/0x263351499f82C107e540B01F0Ca959843e22464a
```

应该显示 `OptimisticOracleV2` 合约。

### 3. 验证 CTF Exchange

```
https://amoy.polygonscan.com/address/0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40
```

应该显示 Polymarket 官方的 CTF Exchange。

### 4. 测试市场创建

使用管理后台创建一个测试市场：

```
http://localhost:3000/_dev_only_admin/create-market
```

---

## 🎯 系统架构

部署完成后，您的系统架构为：

```
┌─────────────────────────────────────────┐
│         用户界面 (Next.js)              │
│     Prediction Market Frontend          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      订单系统 (Supabase + WebSocket)    │
│         链下订单簿 (CLOB)               │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   CTF Exchange (链上结算)               │
│   0xdFE02...AD99E40                     │
│   ✅ Polymarket 官方                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Conditional Tokens Framework          │
│   条件代币铸造和管理                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   RealUmaCTFAdapter                     │
│   UMA 预言机适配器                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   UMA Optimistic Oracle V2              │
│   0x2633...464a                         │
│   ✅ UMA 官方 (Polymarket 同款)         │
└─────────────────────────────────────────┘
```

---

## 🔍 部署脚本详解

### deploy-complete-polymarket-system.js

**功能**:
- 完整部署所有组件
- 自动检测现有合约
- 使用 Polymarket 官方 CTF Exchange
- 连接 UMA 官方预言机
- 生成部署配置文件

**关键特性**:
- ✅ 彩色输出，易于阅读
- ✅ 余额检查和确认提示
- ✅ 自动等待区块确认
- ✅ 完整的部署摘要
- ✅ 自动生成配置文档

### update-config-from-deployment.js

**功能**:
- 读取部署配置
- 自动更新所有配置文件
- 生成配置摘要文档

**更新的文件**:
1. `lib/blockchainService.ts`
2. `lib/providers/blockchain.ts`
3. `lib/market-activation/blockchain-activator.ts`
4. 生成 `POLYMARKET_SYSTEM_CONFIG.md`

---

## ⚠️ 重要提示

### 关于 UMA 预言机

✅ **使用真实的 UMA Oracle V2**
- 这不是 Mock，是真实的预言机
- 有实际的挑战期（约2小时）
- 提案者需要提供保证金
- 支持争议和投票机制

### 关于 CTF Exchange

✅ **默认使用 Polymarket 官方部署**
- 地址: `0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40`
- 已经过 Chainsecurity 审计
- 与 Polymarket 生产环境相同
- 可以在脚本中修改为部署自己的

### 关于测试网

⚠️ **这是测试网环境**
- 所有交易都是测试性质
- 使用 Mock USDC（非真实 USDC）
- 不要在主网使用测试配置

---

## 🐛 常见问题

### Q1: 部署失败，提示余额不足

**A**: 访问水龙头获取更多测试币：
```
https://faucet.polygon.technology/
```

### Q2: 私钥配置不正确

**A**: 检查 `.env.local` 文件：
- 私钥不要包含 `0x` 前缀
- 确保文件在项目根目录
- 重启终端后重试

### Q3: RPC 连接超时

**A**: 尝试更换 RPC URL：
```bash
# 编辑 hardhat.config.js
amoy: {
  url: "https://rpc-amoy.polygon.technology",  // 官方 RPC
  // 或者
  url: "https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY"
}
```

### Q4: 合约已存在错误

**A**: 脚本会自动检测现有合约：
- 如果想强制重新部署，删除对应的部署文件
- 或者在脚本中修改检测逻辑

### Q5: 如何切换回 Mock 预言机？

**A**: 编辑配置文件，将 `realAdapter` 改回 `testAdapter`：
```typescript
const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',  // Mock 版本
  // realAdapter: 'YOUR_REAL_ADAPTER',  // 注释掉真实版本
  // ...
};
```

---

## 📚 参考资料

### 官方文档
- **UMA 协议**: https://docs.uma.xyz
- **Polymarket CTF Exchange**: https://github.com/Polymarket/ctf-exchange
- **Gnosis CTF**: https://github.com/gnosis/conditional-tokens-contracts

### 项目文档
- `UMA预言机使用说明.md` - 预言机架构详解
- `切换到UMA官方预言机指南.md` - 切换指南
- `UMA预言机配置完成.md` - 配置说明
- `POLYMARKET_SYSTEM_CONFIG.md` - 系统配置摘要

### 合约地址
- **UMA Oracle V2**: https://docs.uma.xyz/developers/optimistic-oracle-v2
- **Polymarket Deployments**: https://github.com/Polymarket/ctf-exchange#deployments

---

## 🎉 部署完成检查清单

完成部署后，确认以下项目：

- [ ] RealUmaCTFAdapter 已部署
- [ ] UMA Oracle 地址正确 (`0x263...464a`)
- [ ] CTF Exchange 已配置（官方或自部署）
- [ ] Conditional Tokens 已部署
- [ ] Mock USDC 已部署并铸造
- [ ] 所有配置文件已更新
- [ ] 配置摘要已生成
- [ ] 开发服务器可以启动
- [ ] 可以访问管理后台
- [ ] 测试市场创建功能正常

---

## 🚀 下一步

1. **测试系统功能**
   - 创建测试市场
   - 测试订单簿交易
   - 验证 UMA 预言机集成

2. **部署到主网** (生产环境)
   - 使用真实的 USDC
   - 连接 Polygon 主网
   - UMA Oracle: `0xee3Afe347D5C74317041E2618C49534dAf887c24`
   - 进行完整的安全审计

3. **优化和扩展**
   - 添加更多市场类型
   - 优化订单簿性能
   - 实现高级交易功能

---

## 📞 获取帮助

如果遇到问题：

1. 查看项目文档
2. 检查区块链浏览器的交易状态
3. 查看脚本输出的错误信息
4. 参考 Polymarket 和 UMA 官方文档

---

**祝您部署顺利！🎊**

您现在拥有一个功能完整的 Polymarket 克隆系统！

