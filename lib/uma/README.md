# 🔮 UMA 协议集成

本目录包含 UMA 官方协议的集成代码。

## 📦 已安装的 UMA 包

```bash
@uma/sdk          # UMA 官方 SDK
@uma/contracts-node  # UMA 合约 ABI 和地址
```

来源: https://github.com/UMAprotocol/protocol

---

## 📁 文件说明

### `oracle-client.ts`

**UMA 预言机客户端**

提供与 UMA Optimistic Oracle V2 交互的完整接口。

**功能**：
- ✅ 请求价格（requestPrice）
- ✅ 提案价格（proposePrice）
- ✅ 争议提案（disputePrice）
- ✅ 结算价格（settle）
- ✅ 查询状态（getState）
- ✅ 事件监听

**使用示例**：

```typescript
import { UMAOracleClient, createYesNoQuery } from '@/lib/uma/oracle-client';

// 创建客户端
const client = new UMAOracleClient(provider);

// 获取挑战期
const liveness = await client.getDefaultLiveness();
console.log('挑战期:', liveness / 3600, '小时');

// 检查价格是否已解析
const hasPrice = await client.hasPrice(
  adapterAddress,
  'YES_OR_NO_QUERY',
  timestamp,
  createYesNoQuery('Will Bitcoin exceed $100k?')
);

// 获取状态
const state = await client.getState(...);
```

---

## 🎯 UMA 预言机工作流程

### 完整流程（Polymarket 使用的）

```
1. 创建市场
   ↓
2. 市场到期
   ↓
3. 请求 UMA 价格
   adapter.requestOraclePrice(questionId)
   ↓
4. 提案者提交结果（需保证金）
   oracle.proposePrice(...)
   ↓
5. 挑战期（默认 2 小时）
   - 任何人可以争议
   - 争议者也需要提供保证金
   ↓
6. 如果有争议
   └─> UMA 代币持有者投票
   └─> 正确方获得奖励
   └─> 错误方失去保证金
   ↓
7. 结算市场
   adapter.resolve(questionId)
   ↓
8. 用户赎回代币
```

---

## 🔑 关键概念

### 1. Identifier（标识符）

UMA 使用标识符来定义数据类型：

- **YES_OR_NO_QUERY**: 二元问题（YES/NO）
- **PRICE_FEED**: 价格数据
- 等等...

### 2. Ancillary Data（辅助数据）

提供额外的上下文信息：

```typescript
// YES/NO 问题格式
const ancillaryData = "q: Will Bitcoin exceed $100k by 2024?";

// 编码为字节
const encoded = ethers.utils.toUtf8Bytes(ancillaryData);
```

### 3. Liveness（挑战期）

提案后的争议窗口期：

```typescript
const defaultLiveness = await oracle.defaultLiveness();
// 通常是 7200 秒（2小时）
```

### 4. Bond（保证金）

提案者和争议者都需要质押代币：

- 提案者：提交结果时质押
- 争议者：提出争议时质押
- 正确方：获得奖励
- 错误方：失去保证金

---

## 📊 UMA Oracle 状态

```typescript
enum OracleState {
  Invalid = 0,      // 无效
  Requested = 1,    // 已请求
  Proposed = 2,     // 已提案
  Expired = 3,      // 已过期（可结算）
  Disputed = 4,     // 已争议
  Resolved = 5,     // 已解析
  Settled = 6       // 已结算
}
```

---

## 🔧 使用方法

### 在您的代码中使用

```typescript
import { UMAOracleClient, createYesNoQuery, parseYesNoResult } from '@/lib/uma/oracle-client';

// 创建客户端
const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy-bor-rpc.publicnode.com');
const client = new UMAOracleClient(provider);

// 检查预言机状态
const state = await client.getState(
  adapterAddress,
  'YES_OR_NO_QUERY',
  timestamp,
  createYesNoQuery('Your question?')
);

// 解析结果
if (state === OracleState.Settled) {
  const price = await client.getPrice(...);
  const result = parseYesNoResult(price);
  console.log('市场结果:', result); // YES 或 NO
}
```

---

## 🧪 测试脚本

### 运行 UMA 预言机测试

```bash
npx hardhat run scripts/uma-oracle-test.js --network amoy
```

**测试内容**：
- ✅ 连接 UMA 官方预言机
- ✅ 获取预言机配置
- ✅ 查询市场状态
- ✅ 演示完整流程

---

## 📚 UMA 官方资源

### GitHub 仓库
- **主仓库**: https://github.com/UMAprotocol/protocol
- **文档**: https://docs.uma.xyz
- **快速开始**: https://github.com/UMAprotocol/dev-quickstart

### 重要包

根据 UMA Protocol monorepo：

| 包 | 功能 | 文档 |
|---|------|------|
| `@uma/sdk` | UMA SDK | 主要开发工具 |
| `@uma/contracts-node` | 合约 ABI 和地址 | 合约接口 |
| `@uma/core` | 核心合约 | 智能合约源码 |

---

## 🎯 与 Polymarket 的集成

Polymarket 使用 UMA 的方式：

1. **创建市场**: 使用 uma-ctf-adapter
2. **请求价格**: 通过适配器调用 UMA Oracle
3. **提案结果**: 提案者向 UMA 提交
4. **争议处理**: 使用 UMA 的争议机制
5. **结算**: 从 UMA 获取最终结果

**您的系统现在也是这样工作的！** ✅

---

## 🔍 调试工具

### 查看预言机事件

```typescript
import { UMAOracleClient } from '@/lib/uma/oracle-client';

const client = new UMAOracleClient(provider);

// 监听价格请求
client.onPriceRequested((requester, identifier, timestamp, data) => {
  console.log('价格已请求:', { requester, identifier, timestamp, data });
});

// 监听提案
client.onPriceProposed((requester, proposer, price) => {
  console.log('已提案:', { requester, proposer, price });
});

// 监听争议
client.onPriceDisputed((requester, disputer) => {
  console.log('已争议:', { requester, disputer });
});

// 监听结算
client.onPriceSettled((requester, price) => {
  console.log('已结算:', { requester, price });
});
```

---

## ⚠️ 重要提示

### 测试网 vs 主网

**Polygon Amoy 测试网**（当前）：
```
UMA Oracle: 0x263351499f82C107e540B01F0Ca959843e22464a
```

**Polygon 主网**（生产）：
```
UMA Oracle: 0xee3Afe347D5C74317041E2618C49534dAf887c24
```

### 保证金要求

- 提案者需要质押代币
- 争议者也需要质押代币
- 测试网使用 Mock USDC
- 主网需要真实的 USDC 或其他白名单代币

---

## 🎊 总结

您现在拥有：

✅ **UMA 官方 SDK** - 完整的开发工具  
✅ **预言机客户端** - 封装好的接口  
✅ **测试脚本** - 验证集成  
✅ **完整文档** - 使用指南  

开始使用 UMA 协议构建去中心化预测市场吧！🚀

