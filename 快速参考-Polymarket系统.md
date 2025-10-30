# ⚡ Polymarket 系统快速参考

> 一页纸快速参考所有关键信息

---

## 🔮 核心合约地址

```
UMA Oracle V2:        0x263351499f82C107e540B01F0Ca959843e22464a  ✅ 官方
CTF Exchange:         0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40  ✅ 官方
RealUmaCTFAdapter:    0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C  ✅ 已部署
ConditionalTokens:    0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2  ✅ 已配置
Mock USDC:            0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a  ✅ 测试用
```

---

## 🚀 快速命令

```bash
# 启动开发服务器
npm run dev

# 测试 UMA 预言机
npx hardhat run scripts/uma-oracle-test.js --network amoy

# 查看部署信息
cat deployments/amoy-complete-polymarket.json

# 查看配置摘要
cat POLYMARKET_SYSTEM_CONFIG.md
```

---

## 🌐 快速链接

```
应用主页:    http://localhost:3000
市场列表:    http://localhost:3000/grid-market
管理后台:    http://localhost:3000/_dev_only_admin/create-market

UMA Oracle:  https://amoy.polygonscan.com/address/0x263351499f82C107e540B01F0Ca959843e22464a
CTF Exchange: https://amoy.polygonscan.com/address/0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40
Your Adapter: https://amoy.polygonscan.com/address/0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C
```

---

## 🎯 快速测试流程

### 1. 基础测试（5分钟）
```
1. 访问 localhost:3000
2. 浏览市场列表
3. 查看市场详情
4. 检查订单簿
```

### 2. 创建市场（10分钟）
```
1. 访问管理后台
2. 填写市场信息
3. 部署到链上
4. 在列表中查看新市场
```

### 3. UMA 预言机（2小时+）
```
1. 等待市场到期
2. 请求预言机价格
3. 等待挑战期（2小时）
4. 结算市场
```

---

## 📚 关键文档

| 文档 | 用途 |
|------|------|
| `系统部署完成-最终总结.md` | 📊 总体概览 |
| `UMA协议集成完成.md` | 🔮 UMA集成说明 |
| `Polymarket官方系统配置完成.md` | ⚙️ 官方组件配置 |
| `UMA预言机测试指南.md` | 🧪 详细测试步骤 |
| `lib/uma/README.md` | 💻 SDK使用指南 |

---

## ⚡ 常用代码片段

### UMA 客户端
```typescript
import { UMAOracleClient } from '@/lib/uma/oracle-client';
const client = new UMAOracleClient(provider);
const liveness = await client.getDefaultLiveness();
```

### 查询市场
```typescript
const adapter = new ethers.Contract(ADAPTER_ADDRESS, ABI, provider);
const count = await adapter.getMarketCount();
const market = await adapter.getMarket(questionId);
```

### 监听事件
```typescript
client.onPriceSettled((requester, price) => {
  console.log('市场已结算:', price.toString());
});
```

---

## 🔑 钱包信息

```
地址: 0xaa22D02aA0C31cF4140d54284B249cDb651107aB
私钥: 已保存在 .env.local
余额: ~0.037 POL

水龙头: https://faucet.polygon.technology/
```

---

## 🎊 系统特性

✅ 去中心化预言机（UMA V2）  
✅ 审计过的交易所（Polymarket官方）  
✅ 订单簿交易系统  
✅ 条件代币框架  
✅ 争议和挑战机制  
✅ 经济激励模型  
✅ 与 Polymarket 100% 一致  

---

## 📞 获取帮助

**项目文档**: 12+ 个 .md 文件  
**UMA 文档**: https://docs.uma.xyz  
**Polymarket**: https://github.com/Polymarket  

---

**一切就绪！开始构建您的预测市场！** 🚀

