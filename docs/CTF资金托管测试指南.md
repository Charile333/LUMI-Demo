# 🧪 CTF 资金托管测试指南

## 🎯 测试目标

测试用户买入 YES/NO 后，市场解析时能否正确提取奖励。

---

## 📋 测试前准备

### 1. 环境检查

```bash
# 检查 Node.js 版本
node --version  # 需要 >= 18

# 检查依赖
npm install

# 检查环境变量
# 确保 .env 文件中有：
# POLYGON_AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

### 2. 钱包准备

- ✅ 安装 MetaMask 或支持的钱包
- ✅ 连接到 Polygon Amoy 测试网
- ✅ 确保有测试代币（USDC 和 MATIC）

### 3. 合约地址确认

检查 `lib/ctf/redeem.ts` 中的合约地址：

```typescript
const CONFIG = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  collateralToken: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', // Mock USDC
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
  chainId: 80002
};
```

---

## 🧪 测试方法

### 方法1：完整流程测试（推荐）

#### 步骤1：创建测试市场

```typescript
// 1. 在管理后台创建市场
// 2. 确保市场有 condition_id
// 3. 记录 marketId 和 conditionId
```

#### 步骤2：用户买入 YES/NO

```typescript
// 1. 打开市场详情页面
// 2. 连接钱包
// 3. 买入 YES 或 NO（例如：$10）
// 4. 确认交易成功
// 5. 检查钱包中的 Position Tokens
```

#### 步骤3：解析市场

```typescript
// 方法1：使用管理后台解析
// 方法2：调用合约解析
// 确保市场状态变为 'resolved'
```

#### 步骤4：提取奖励

```typescript
// 1. 刷新市场详情页面
// 2. 应该看到"提取奖励"区域
// 3. 点击"提取奖励"按钮
// 4. 确认钱包交易
// 5. 检查 USDC 余额增加
```

---

### 方法2：使用测试脚本

创建 `scripts/test-redeem.ts`：

```typescript
import { ethers } from 'ethers';
import { 
  redeemPositions, 
  checkRedeemableBalance,
  isMarketResolved,
  calculateRedeemablePayout
} from '../lib/ctf/redeem';

// 配置
const CONFIG = {
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
  privateKey: process.env.TEST_PRIVATE_KEY!, // 测试账户私钥
  conditionId: '0x...', // 测试市场的 conditionId
  outcomeIndex: 1 // 1 = YES, 0 = NO
};

async function testRedeem() {
  console.log('🧪 开始测试 CTF Redeem 功能...\n');

  // 1. 初始化 provider 和 signer
  const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
  const signer = new ethers.Wallet(CONFIG.privateKey, provider);
  const userAddress = await signer.getAddress();

  console.log('📝 测试账户:', userAddress);
  console.log('📝 Condition ID:', CONFIG.conditionId);
  console.log('📝 Outcome Index:', CONFIG.outcomeIndex, CONFIG.outcomeIndex === 1 ? '(YES)' : '(NO)');
  console.log('');

  // 2. 检查市场是否已解析
  console.log('1️⃣ 检查市场解析状态...');
  const resolved = await isMarketResolved(provider, CONFIG.conditionId);
  console.log('   市场已解析:', resolved ? '✅' : '❌');
  
  if (!resolved) {
    console.log('   ⚠️ 市场未解析，无法测试提取功能');
    return;
  }
  console.log('');

  // 3. 检查可赎回余额
  console.log('2️⃣ 检查可赎回余额...');
  const balanceInfo = await checkRedeemableBalance(
    provider,
    userAddress,
    CONFIG.conditionId,
    CONFIG.outcomeIndex
  );
  
  console.log('   有可赎回余额:', balanceInfo.hasBalance ? '✅' : '❌');
  console.log('   持仓数量:', balanceInfo.balance, 'USDC');
  console.log('   Position ID:', balanceInfo.positionId);
  
  if (!balanceInfo.hasBalance) {
    console.log('   ⚠️ 没有可赎回的 Position Tokens');
    return;
  }
  console.log('');

  // 4. 计算预期 payout
  console.log('3️⃣ 计算预期 payout...');
  const payoutInfo = await calculateRedeemablePayout(
    provider,
    userAddress,
    CONFIG.conditionId,
    CONFIG.outcomeIndex
  );
  
  console.log('   预期 payout:', payoutInfo.payout, 'USDC');
  console.log('   持仓余额:', payoutInfo.positionBalance, 'USDC');
  console.log('');

  // 5. 检查 USDC 余额（提取前）
  console.log('4️⃣ 检查 USDC 余额（提取前）...');
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdcContract = new ethers.Contract(
    '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
    usdcAbi,
    provider
  );
  const balanceBefore = await usdcContract.balanceOf(userAddress);
  const balanceBeforeFormatted = ethers.utils.formatUnits(balanceBefore, 6);
  console.log('   USDC 余额:', balanceBeforeFormatted);
  console.log('');

  // 6. 执行赎回
  console.log('5️⃣ 执行赎回...');
  const result = await redeemPositions(
    signer,
    CONFIG.conditionId,
    CONFIG.outcomeIndex
  );

  if (result.success) {
    console.log('   ✅ 赎回成功！');
    console.log('   交易哈希:', result.transactionHash);
    console.log('   浏览器查看:', result.explorerUrl);
    console.log('   提取金额:', result.payout, 'USDC');
    console.log('');

    // 7. 检查 USDC 余额（提取后）
    console.log('6️⃣ 检查 USDC 余额（提取后）...');
    const balanceAfter = await usdcContract.balanceOf(userAddress);
    const balanceAfterFormatted = ethers.utils.formatUnits(balanceAfter, 6);
    const increase = parseFloat(balanceAfterFormatted) - parseFloat(balanceBeforeFormatted);
    
    console.log('   USDC 余额:', balanceAfterFormatted);
    console.log('   增加金额:', increase.toFixed(6), 'USDC');
    console.log('   预期增加:', result.payout, 'USDC');
    
    if (Math.abs(increase - parseFloat(result.payout || '0')) < 0.01) {
      console.log('   ✅ 余额增加正确！');
    } else {
      console.log('   ⚠️ 余额增加不匹配');
    }
  } else {
    console.log('   ❌ 赎回失败:', result.error);
  }

  console.log('\n✅ 测试完成！');
}

// 运行测试
testRedeem().catch(console.error);
```

运行测试：

```bash
# 设置测试账户私钥（不要提交到代码库）
export TEST_PRIVATE_KEY=your_private_key_here

# 运行测试
npx tsx scripts/test-redeem.ts
```

---

### 方法3：前端界面测试

#### 步骤1：启动开发服务器

```bash
npm run dev
```

#### 步骤2：访问市场详情页面

```
http://localhost:3000/market/[marketId]
```

#### 步骤3：测试流程

1. **连接钱包**
   - 点击"连接钱包"
   - 选择测试账户
   - 确认连接

2. **检查市场状态**
   - 确保市场已解析（status === 'resolved'）
   - 确保市场有 condition_id

3. **查看提取按钮**
   - 应该看到"提取奖励"区域
   - 显示持仓和可提取金额

4. **执行提取**
   - 点击"提取奖励"按钮
   - 确认钱包交易
   - 等待交易确认

5. **验证结果**
   - 检查钱包 USDC 余额增加
   - 检查交易哈希
   - 检查提取按钮消失或显示"无可赎回余额"

---

## 🔍 测试检查清单

### 功能测试

- [ ] 市场未解析时，不显示提取按钮
- [ ] 市场已解析但无持仓时，显示"无可赎回余额"
- [ ] 市场已解析且有持仓时，显示提取按钮和金额
- [ ] 点击提取按钮，弹出钱包确认
- [ ] 交易成功后，USDC 余额增加
- [ ] 交易成功后，提取按钮状态更新
- [ ] 支持 YES 和 NO 两种结果的提取

### 边界测试

- [ ] 市场解析中（payoutDenominator = 1）时，无法提取
- [ ] 持仓为 0 时，无法提取
- [ ] 网络错误时，显示错误信息
- [ ] 用户拒绝交易时，显示错误信息
- [ ] Gas 不足时，显示错误信息

### 性能测试

- [ ] 检查可赎回余额的响应时间 < 2秒
- [ ] 提取交易的确认时间 < 30秒
- [ ] 页面加载时，不阻塞 UI

---

## 🐛 常见问题排查

### 问题1：提取按钮不显示

**可能原因**：
- 市场未解析
- 市场没有 condition_id
- 用户没有持仓

**解决方法**：
```typescript
// 检查市场状态
console.log('Market status:', market.status);
console.log('Condition ID:', market.condition_id);
console.log('Resolved:', await isMarketResolved(provider, conditionId));
```

### 问题2：提取失败

**可能原因**：
- 市场未解析
- 用户没有持仓
- Gas 不足
- 合约地址错误

**解决方法**：
```typescript
// 检查所有条件
const resolved = await isMarketResolved(provider, conditionId);
const balance = await checkRedeemableBalance(provider, userAddress, conditionId, outcomeIndex);
const gasPrice = await provider.getGasPrice();

console.log('Resolved:', resolved);
console.log('Has balance:', balance.hasBalance);
console.log('Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'));
```

### 问题3：余额不增加

**可能原因**：
- payout 计算错误
- 交易失败但显示成功
- 查看错误的代币地址

**解决方法**：
```typescript
// 检查 payout 计算
const payoutInfo = await calculateRedeemablePayout(provider, userAddress, conditionId, outcomeIndex);
console.log('Expected payout:', payoutInfo.payout);

// 检查交易状态
const receipt = await provider.getTransactionReceipt(txHash);
console.log('Transaction status:', receipt.status); // 1 = success, 0 = failed
```

---

## 📊 测试数据记录

### 测试用例1：正常提取

| 项目 | 值 |
|------|-----|
| 市场ID | 123 |
| Condition ID | 0x... |
| 持仓 | 10 USDC |
| Outcome | YES |
| 预期 Payout | 10 USDC |
| 实际 Payout | ? |
| 交易哈希 | ? |
| 状态 | ✅/❌ |

### 测试用例2：部分提取

| 项目 | 值 |
|------|-----|
| 持仓 | 20 USDC |
| 提取 | 10 USDC |
| 剩余 | 10 USDC |
| 状态 | ✅/❌ |

---

## 🎯 测试脚本

创建 `scripts/test-redeem-full.ts` 完整测试脚本：

```typescript
import { ethers } from 'ethers';
import * as redeem from '../lib/ctf/redeem';

const RPC_URL = 'https://polygon-amoy-bor-rpc.publicnode.com';
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY!;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // 从命令行参数获取 conditionId
  const conditionId = process.argv[2];
  const outcomeIndex = parseInt(process.argv[3] || '1');
  
  if (!conditionId) {
    console.error('Usage: npx tsx scripts/test-redeem-full.ts <conditionId> [outcomeIndex]');
    process.exit(1);
  }
  
  console.log('🧪 CTF Redeem 完整测试\n');
  console.log('Condition ID:', conditionId);
  console.log('Outcome Index:', outcomeIndex, outcomeIndex === 1 ? '(YES)' : '(NO)');
  console.log('');
  
  // 执行测试
  const result = await redeem.redeemPositions(signer, conditionId, outcomeIndex);
  
  if (result.success) {
    console.log('✅ 测试成功！');
    console.log('Transaction:', result.transactionHash);
    console.log('Payout:', result.payout, 'USDC');
  } else {
    console.error('❌ 测试失败:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
```

使用：

```bash
npx tsx scripts/test-redeem-full.ts 0x... 1
```

---

## ✅ 测试完成标准

- ✅ 所有功能测试通过
- ✅ 边界测试通过
- ✅ 性能测试通过
- ✅ 错误处理正确
- ✅ 用户体验良好

---

## 📝 测试报告模板

```markdown
# CTF 资金托管测试报告

## 测试日期
2024-XX-XX

## 测试环境
- 网络：Polygon Amoy Testnet
- 合约地址：0x...
- 测试账户：0x...

## 测试结果
- ✅ 功能测试：通过
- ✅ 边界测试：通过
- ⚠️ 性能测试：部分通过

## 发现的问题
1. ...

## 建议
1. ...
```

---

## 🔗 相关文档

- [CTF资金托管实施指南.md](./CTF资金托管实施指南.md)
- [CTF资金托管实施完成总结.md](./CTF资金托管实施完成总结.md)





