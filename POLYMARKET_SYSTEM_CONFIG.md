# 🔮 Polymarket 系统配置

## 部署信息
- **网络**: amoy
- **链ID**: 80002
- **部署时间**: 2025-10-29T21:38:57.958Z
- **部署者**: 0xaa22D02aA0C31cF4140d54284B249cDb651107aB

## 合约地址

### 核心合约

| 合约 | 地址 | 类型 |
|------|------|------|
| **Conditional Tokens** | `0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2` | Existing |
| **CTF Exchange** | `0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d` | Existing |
| **UmaCTFAdapter** | `0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C` | Newly Deployed |
| **UMA Oracle** | `0x263351499f82C107e540B01F0Ca959843e22464a` | UMA Official V2 |
| **Collateral (USDC)** | `0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a` | Existing Mock USDC |

### 区块链浏览器链接

- ConditionalTokens: https://amoy.polygonscan.com/address/0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
- CTF Exchange: https://amoy.polygonscan.com/address/0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d
- UmaCTFAdapter: https://amoy.polygonscan.com/address/0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C
- UMA Oracle: https://amoy.polygonscan.com/address/0x263351499f82C107e540B01F0Ca959843e22464a
- Mock USDC: https://amoy.polygonscan.com/address/0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a

## 配置说明

### UMA 预言机
- ✅ 使用 **UMA Optimistic Oracle V2** 官方部署
- ✅ 与 **Polymarket 完全相同**
- ✅ 支持争议机制（2小时挑战期）
- ✅ 去中心化裁决

### CTF Exchange
- 📝 自定义部署
- 参考 Polymarket 官方实现

### Conditional Tokens
- ✅ 基于 **Gnosis CTF** 官方实现
- ✅ 支持 ERC1155 标准
- ✅ 完整的条件代币功能

## 系统架构

```
用户界面 (Next.js)
  ↓
订单系统 (Supabase) ← 链下订单簿
  ↓
CTF Exchange: 0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d
  ↓
Conditional Tokens: 0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
  ↓
UMA Oracle: 0x263351499f82C107e540B01F0Ca959843e22464a
```

## 使用方法

### 创建市场

```javascript
const adapter = new ethers.Contract(
  "0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C",
  ADAPTER_ABI,
  signer
);

await adapter.initialize(
  questionId,
  "市场标题",
  "市场描述",
  2,  // YES/NO
  "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a",  // USDC
  ethers.utils.parseUnits("100", 6),  // 100 USDC 奖励
  0   // 使用默认挑战期
);
```

### 订单簿交易

```javascript
const exchange = new ethers.Contract(
  "0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d",
  EXCHANGE_ABI,
  signer
);

// 创建订单、填充订单等...
```

## 重要提示

⚠️ **测试网环境**
- 这是 Polygon Amoy 测试网部署
- 使用 Mock USDC 进行测试
- 所有交易都是测试性质的

⚠️ **UMA 预言机**
- 使用真实的 UMA Oracle，有实际的挑战期
- 市场结算需要等待约 2 小时
- 提案者需要提供保证金

⚠️ **CTF Exchange**
- 自定义部署，建议在生产环境使用官方版本

## 下一步

1. ✅ 配置已自动更新
2. 重启开发服务器: `npm run dev`
3. 测试创建市场功能
4. 验证订单簿交易
5. 测试 UMA 预言机集成

## 参考资料

- UMA 文档: https://docs.uma.xyz
- Polymarket CTF Exchange: https://github.com/Polymarket/ctf-exchange
- Gnosis CTF: https://github.com/gnosis/conditional-tokens-contracts

---

最后更新: 2025-10-29T21:39:12.566Z
