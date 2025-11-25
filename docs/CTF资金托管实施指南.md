# 💰 CTF 资金托管实施指南

## ✅ 实施状态

**已完成的核心功能**：
- ✅ CTF redeem 服务库 (`lib/ctf/redeem.ts`)
- ✅ API 接口 (`app/api/ctf/redeem/route.ts`)
- ✅ 前端组件 (`components/ctf/RedeemButton.tsx`)

---

## 📋 功能说明

### 1. CTF Redeem 服务库

**文件**：`lib/ctf/redeem.ts`

**核心功能**：
- `checkRedeemableBalance()` - 检查用户是否有可赎回的 Position Tokens
- `isMarketResolved()` - 检查市场是否已解析
- `calculateRedeemablePayout()` - 计算可赎回的奖励金额
- `redeemPositions()` - 执行赎回（提取奖励）
- `redeemPositionsBatch()` - 批量赎回多个市场

---

### 2. API 接口

**文件**：`app/api/ctf/redeem/route.ts`

**端点**：
- `GET /api/ctf/redeem` - 检查可赎回余额
  - 参数：`userAddress`, `conditionId`, `outcomeIndex`
  - 返回：可赎回状态、余额、预期 payout

**注意**：实际赎回应该在前端执行（需要用户钱包签名）

---

### 3. 前端组件

**文件**：`components/ctf/RedeemButton.tsx`

**功能**：
- 自动检查市场是否已解析
- 自动检查用户是否有可赎回余额
- 显示可提取的奖励金额
- 一键提取奖励

---

## 🚀 使用方法

### 方法1：使用 RedeemButton 组件（推荐）

```tsx
import RedeemButton from '@/components/ctf/RedeemButton';

function MarketPage({ market }) {
  return (
    <div>
      <h1>{market.title}</h1>
      
      {/* 市场解析后显示提取按钮 */}
      {market.resolved && (
        <RedeemButton
          conditionId={market.condition_id}
          outcomeIndex={1} // 1 = YES, 0 = NO
          marketTitle={market.title}
          onSuccess={(result) => {
            console.log('提取成功！', result);
            // result.payout - 提取的 USDC 金额
            // result.txHash - 交易哈希
          }}
          onError={(error) => {
            console.error('提取失败：', error);
          }}
        />
      )}
    </div>
  );
}
```

---

### 方法2：直接使用服务库

```tsx
import { redeemPositions, checkRedeemableBalance } from '@/lib/ctf/redeem';
import { ethers } from 'ethers';

async function handleRedeem() {
  // 1. 获取 provider 和 signer
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // 2. 检查可赎回余额
  const userAddress = await signer.getAddress();
  const balanceInfo = await checkRedeemableBalance(
    provider,
    userAddress,
    conditionId,
    1 // outcomeIndex: 1 = YES, 0 = NO
  );

  if (!balanceInfo.hasBalance) {
    console.log('无可赎回余额');
    return;
  }

  // 3. 执行赎回
  const result = await redeemPositions(signer, conditionId, 1);

  if (result.success) {
    console.log('提取成功！', {
      payout: result.payout,
      txHash: result.transactionHash,
      explorerUrl: result.explorerUrl
    });
  } else {
    console.error('提取失败：', result.error);
  }
}
```

---

### 方法3：使用 API 接口

```tsx
// 检查可赎回余额
async function checkRedeemable() {
  const response = await fetch(
    `/api/ctf/redeem?userAddress=${userAddress}&conditionId=${conditionId}&outcomeIndex=1`
  );
  const data = await response.json();

  if (data.redeemable) {
    console.log('可提取奖励：', data.expectedPayout, 'USDC');
  }
}
```

---

## 📊 完整流程

### 用户买入 YES/NO 时的流程

```
1. 用户买入 YES/NO
   ↓
2. 资金转换为 Position Tokens
   ↓
3. Position Tokens 存储在用户钱包中
   ↓
4. 等待市场解析
   ↓
5. 市场解析后，Position Tokens 可兑换
   ↓
6. 用户点击"提取奖励"按钮
   ↓
7. 调用 redeemPositions()
   ↓
8. 获得 USDC 奖励
```

---

## 🔧 集成到市场页面

### 步骤1：在市场页面导入组件

```tsx
// app/market/[marketId]/page.tsx
import RedeemButton from '@/components/ctf/RedeemButton';
```

### 步骤2：在市场解析后显示按钮

```tsx
{market.resolved && market.condition_id && (
  <div className="mt-4 p-4 bg-green-50 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">提取奖励</h3>
    <RedeemButton
      conditionId={market.condition_id}
      outcomeIndex={1} // 根据用户持仓决定
      marketTitle={market.title}
      onSuccess={(result) => {
        toast.success(`成功提取 ${result.payout} USDC！`);
      }}
    />
  </div>
)}
```

---

## 🧪 测试

### 测试脚本

创建 `scripts/test-redeem.ts`：

```typescript
import { ethers } from 'ethers';
import { redeemPositions, checkRedeemableBalance } from '../lib/ctf/redeem';

async function testRedeem() {
  const provider = new ethers.providers.JsonRpcProvider(
    'https://polygon-amoy-bor-rpc.publicnode.com'
  );
  
  // 使用测试账户
  const privateKey = process.env.TEST_PRIVATE_KEY!;
  const signer = new ethers.Wallet(privateKey, provider);

  const conditionId = '0x...'; // 测试市场的 conditionId
  const outcomeIndex = 1; // YES

  // 1. 检查可赎回余额
  const balanceInfo = await checkRedeemableBalance(
    provider,
    await signer.getAddress(),
    conditionId,
    outcomeIndex
  );

  console.log('可赎回余额：', balanceInfo);

  // 2. 执行赎回
  if (balanceInfo.hasBalance) {
    const result = await redeemPositions(signer, conditionId, outcomeIndex);
    console.log('赎回结果：', result);
  }
}

testRedeem();
```

---

## 📝 注意事项

### 1. 市场必须已解析

- 只有市场解析后，Position Tokens 才能兑换
- 使用 `isMarketResolved()` 检查

### 2. 用户必须有持仓

- 只有持有 Position Tokens 的用户才能提取
- 使用 `checkRedeemableBalance()` 检查

### 3. 需要用户钱包签名

- 赎回操作需要用户钱包签名
- 必须在前端执行，不能在后端执行

### 4. Gas 费用

- 用户需要支付 Gas 费用
- 建议批量赎回多个市场以节省 Gas

---

## 🎯 下一步

1. **集成到市场页面** - 在市场解析后显示提取按钮
2. **创建批量提取功能** - 允许用户批量提取多个市场的奖励
3. **添加通知** - 市场解析后通知用户
4. **优化用户体验** - 添加加载状态、错误处理等

---

## 🔗 相关文档

- [资金托管方案.md](./资金托管方案.md)
- [主流平台资金托管方式对比.md](./主流平台资金托管方式对比.md)
- [CTF框架确认文档.md](./CTF框架确认文档.md)





