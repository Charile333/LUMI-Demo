# ⚡ 快速部署指南

> 3步完成 Polymarket 系统完整部署

---

## 🎯 将要部署的内容

- ✅ **UMA 官方预言机** (Optimistic Oracle V2)
- ✅ **Polymarket 官方 CTF Exchange**
- ✅ **Conditional Tokens Framework**
- ✅ **完整的配置自动化**

---

## 📝 准备工作 (5分钟)

### 1. 配置私钥

创建 `.env.local` 文件：

```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
```

### 2. 获取测试币

访问: https://faucet.polygon.technology/

需要至少 **1 POL**

---

## 🚀 部署步骤 (3步)

### 步骤 1: 一键部署所有合约

```bash
npx hardhat run scripts/deploy-complete-polymarket-system.js --network amoy
```

**这会部署/配置**:
- ✅ Conditional Tokens Framework
- ✅ Mock USDC (测试用)
- ✅ CTF Exchange (使用 Polymarket 官方)
- ✅ RealUmaCTFAdapter (UMA 预言机适配器)
- ✅ 连接到 UMA 官方预言机

⏱️ **预计时间**: 2-3 分钟

---

### 步骤 2: 自动更新配置

```bash
node scripts/update-config-from-deployment.js
```

**这会更新**:
- ✅ `lib/blockchainService.ts`
- ✅ `lib/providers/blockchain.ts`
- ✅ `lib/market-activation/blockchain-activator.ts`
- ✅ 生成配置摘要文档

⏱️ **预计时间**: 5 秒

---

### 步骤 3: 启动服务

```bash
npm run dev
```

打开浏览器访问: http://localhost:3000

⏱️ **预计时间**: 10 秒

---

## ✅ 部署完成！

您现在拥有：

| 组件 | 状态 | 说明 |
|------|------|------|
| **UMA 预言机** | ✅ | 与 Polymarket 完全相同 |
| **CTF Exchange** | ✅ | Polymarket 官方部署 |
| **Conditional Tokens** | ✅ | Gnosis 官方实现 |
| **订单簿系统** | ✅ | Supabase 实现 |

---

## 🔍 验证部署

### 查看部署地址

```bash
cat deployments/amoy-complete-polymarket.json
```

### 查看配置摘要

```bash
cat POLYMARKET_SYSTEM_CONFIG.md
```

### 测试创建市场

访问: http://localhost:3000/_dev_only_admin/create-market

---

## 📍 重要地址

### Polygon Amoy 测试网

| 合约 | 地址 |
|------|------|
| **UMA Oracle V2** | `0x263351499f82C107e540B01F0Ca959843e22464a` |
| **CTF Exchange** | `0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40` |
| **Your Adapter** | 部署后显示 |

---

## 🎯 下一步

### 1. 创建测试市场
```
http://localhost:3000/_dev_only_admin/create-market
```

### 2. 测试交易
```
http://localhost:3000/trade/[marketId]
```

### 3. 验证订单簿
```
http://localhost:3000/grid-market
```

---

## 🐛 遇到问题？

### 错误: 余额不足
```bash
# 访问水龙头
https://faucet.polygon.technology/
```

### 错误: 私钥无效
```bash
# 检查 .env.local
# 确保私钥不包含 0x 前缀
PRIVATE_KEY=abc123...  # ✅ 正确
PRIVATE_KEY=0xabc123...  # ❌ 错误
```

### 错误: RPC 超时
```bash
# 编辑 hardhat.config.js
# 更换 RPC URL
url: "https://rpc-amoy.polygon.technology"
```

---

## 📚 详细文档

- **完整部署指南**: `完整部署Polymarket系统指南.md`
- **UMA预言机说明**: `UMA预言机使用说明.md`
- **切换指南**: `切换到UMA官方预言机指南.md`
- **配置完成说明**: `UMA预言机配置完成.md`

---

## 🎉 完成！

您现在拥有一个功能完整的 **Polymarket 克隆系统**！

### 系统特性

✅ 去中心化预言机 (UMA V2)  
✅ 订单簿交易 (CTF Exchange)  
✅ 条件代币 (Gnosis CTF)  
✅ 争议机制 (2小时挑战期)  
✅ 与 Polymarket 架构完全一致  

---

**开始预测市场之旅！** 🚀

