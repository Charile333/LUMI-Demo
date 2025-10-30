# 🎯 LUMI Polymarket 三大组件集成指南

> 在所有LUMI预测市场页面中集成 UMA、Polymarket 和 Gnosis 官方组件

---

## 📦 已完成的集成文件

### 1. 核心库文件

#### ✅ `public/js/lumi-polymarket-integration.js`
**用途**: 通用JavaScript库，可在所有HTML页面中使用

**功能**:
- 连接 MetaMask 钱包
- 创建预测市场 (Gnosis Conditional Tokens)
- 执行交易 (Polymarket CTF Exchange)
- 结算市场 (UMA Optimistic Oracle)
- 赎回奖金

**使用方法**:
```html
<!-- 在任何HTML页面中引入 -->
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
<script src="/js/lumi-polymarket-integration.js"></script>

<script>
// 初始化
const lumi = new LUMIPolymarket();
await lumi.init();

// 创建市场
const result = await lumi.createMarket("标题", "描述", 100);

// 下注
const { order, signature } = await lumi.createOrder(tokenId, 10, 0.6, 'BUY');
await lumi.fillOrder(order, signature);

// 结算
await lumi.requestSettlement(questionId);
await lumi.resolveMarket(questionId);
</script>
```

---

#### ✅ `hooks/useLUMIPolymarket.ts`
**用途**: React Hook，用于Next.js应用

**功能**: 与JavaScript库相同，但使用React Hooks模式

**使用方法**:
```typescript
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';

function MyComponent() {
  const {
    connect,
    createMarket,
    createOrder,
    fillOrder,
    requestSettlement,
    resolveMarket
  } = useLUMIPolymarket();

  const handleBet = async () => {
    await connect();
    const market = await createMarket("标题", "描述");
    // ...
  };

  return <button onClick={handleBet}>下注</button>;
}
```

---

### 2. 示例文件

#### ✅ `public/lumi-integration-example.html`
**用途**: 完整的集成示例页面

**包含功能**:
- ✅ 连接钱包
- ✅ 创建市场
- ✅ 下注交易
- ✅ 结算市场
- ✅ 实时日志

**访问**: `http://localhost:3000/lumi-integration-example.html`

---

#### ✅ `sports-betting.html` (已更新)
**用途**: 体育博彩页面，已集成Polymarket

**集成内容**:
- ✅ 引入 ethers.js 和 LUMI 集成库
- ✅ 添加 `placeBetWithPolymarket()` 函数
- ✅ "Place Bet" 按钮连接到 Polymarket 系统

**如何使用**:
1. 打开页面
2. 选择比赛和赔率
3. 输入下注金额
4. 点击 "Place Bet"
5. 连接 MetaMask
6. 确认交易

---

## 🔧 三大组件配置

### 组件地址 (Polygon Amoy Testnet)

```javascript
const CONFIG = {
  // 1️⃣ UMA 官方预言机
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
  
  // 2️⃣ Polymarket 官方 CTF Exchange
  ctfExchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',
  
  // 3️⃣ Gnosis Conditional Tokens
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  
  // 适配器（连接三者）
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
  
  // 测试代币
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};
```

---

## 📄 如何在其他页面中集成

### 方法 1: HTML 页面集成 (推荐)

#### 步骤 1: 引入库文件

在页面 `<head>` 中添加：

```html
<!-- LUMI Polymarket 集成 -->
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
<script src="/js/lumi-polymarket-integration.js"></script>
```

#### 步骤 2: 初始化和使用

在页面底部的 `<script>` 标签中：

```javascript
// 初始化 LUMI Polymarket
const lumi = new LUMIPolymarket();
let isWalletConnected = false;

// 连接钱包
async function connectWallet() {
    try {
        const result = await lumi.init();
        isWalletConnected = true;
        console.log('✅ 钱包已连接:', result.address);
        return result;
    } catch (error) {
        alert('请安装 MetaMask: ' + error.message);
    }
}

// 下注示例
async function placeBet(matchTitle, outcome, amount) {
    // 确保钱包已连接
    if (!isWalletConnected) {
        await connectWallet();
    }
    
    // 1. 创建市场
    const market = await lumi.createMarket(
        matchTitle,
        `预测 ${matchTitle} 的结果`,
        100
    );
    
    // 2. 创建订单
    const tokenId = outcome === 'YES' ? 1 : 2;
    const { order, signature } = await lumi.createOrder(
        tokenId,
        amount,
        0.6,
        'BUY'
    );
    
    // 3. 执行交易
    const result = await lumi.fillOrder(order, signature);
    
    console.log('✅ 下注成功！', result.transactionHash);
    alert(`下注成功！\n交易: ${result.transactionHash}`);
}

// 为按钮添加事件
document.querySelector('#placeBetBtn').addEventListener('click', async () => {
    await placeBet('Lakers vs Bulls', 'YES', 10);
});
```

---

### 方法 2: Next.js 应用集成

#### 步骤 1: 使用 Hook

```typescript
'use client';

import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';
import { useState } from 'react';

export default function BettingPage() {
  const {
    connect,
    isConnected,
    address,
    createMarket,
    createOrder,
    fillOrder
  } = useLUMIPolymarket();
  
  const [loading, setLoading] = useState(false);

  const handlePlaceBet = async () => {
    try {
      setLoading(true);
      
      // 连接钱包
      if (!isConnected) {
        await connect();
      }
      
      // 创建市场
      const market = await createMarket(
        "Test Market",
        "Test Description",
        100
      );
      
      // 创建和执行订单
      const { order, signature } = await createOrder(1, 10, 0.6, 'BUY');
      const result = await fillOrder(order, signature);
      
      alert('下注成功！');
    } catch (error) {
      console.error(error);
      alert('下注失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>连接钱包</button>
      ) : (
        <div>
          <p>已连接: {address}</p>
          <button onClick={handlePlaceBet} disabled={loading}>
            {loading ? '处理中...' : '下注'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 完整的用户流程

### 流程 1: 用户下注

```
用户打开页面
  ↓
点击"下注"按钮
  ↓
[自动] 弹出 MetaMask 连接请求
  ↓
用户批准连接
  ↓
[自动] 创建预测市场 (Gnosis Conditional Tokens)
  ↓
[自动] 批准 USDC 使用权限
  ↓
用户确认交易
  ↓
[自动] 在 Polymarket CTF Exchange 执行交易
  ↓
用户确认交易
  ↓
✅ 下注成功！获得 Outcome Tokens
```

### 流程 2: 市场结算

```
比赛结束
  ↓
管理员/提案者调用 requestSettlement(questionId)
  ↓
[自动] 调用 UMA 官方预言机
  ↓
数据提供者提交结果
  ↓
等待挑战期 (2小时)
  ↓
无人争议 / 争议已解决
  ↓
调用 resolveMarket(questionId)
  ↓
[自动] Conditional Tokens 结算市场
  ↓
✅ 用户可以赎回获胜代币
```

### 流程 3: 赎回奖金

```
市场已结算
  ↓
用户调用 redeemWinnings(conditionId, outcomeIndex)
  ↓
[自动] Conditional Tokens 销毁获胜代币
  ↓
[自动] 转账 USDC 到用户钱包
  ↓
✅ 赎回成功！
```

---

## 📝 需要在其他页面中集成的文件

### HTML 页面

以下页面建议集成 Polymarket 组件：

1. ✅ `sports-betting.html` - **已完成**
2. ⏳ `blockchain-gambling.html` - 区块链博彩
3. ⏳ `blockchain-lottery.html` - 区块链彩票
4. ⏳ `live-casino.html` - 真人赌场
5. ⏳ `tournaments.html` - 锦标赛
6. ⏳ `promotions.html` - 促销活动
7. ⏳ `个人主页.html` - 个人主页

### Next.js 页面

以下组件建议集成：

1. ⏳ `app/grid-market/page.tsx` - 市场网格
2. ⏳ `app/terminal/page.tsx` - 交易终端
3. ⏳ `app/_dev_only_admin/create-market/page.tsx` - 创建市场
4. ⏳ `components/market-card.tsx` - 市场卡片
5. ⏳ `components/trading-terminal.tsx` - 交易组件

---

## 🚀 快速集成模板

### 模板 1: 简单下注按钮

```html
<button id="quickBetBtn" class="bg-blue-600 px-6 py-2 rounded">
    快速下注 10 USDC
</button>

<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
<script src="/js/lumi-polymarket-integration.js"></script>

<script>
const lumi = new LUMIPolymarket();

document.getElementById('quickBetBtn').addEventListener('click', async () => {
    try {
        await lumi.init();
        
        const market = await lumi.createMarket("快速市场", "测试", 100);
        const { order, signature } = await lumi.createOrder(1, 10, 0.6, 'BUY');
        const result = await lumi.fillOrder(order, signature);
        
        alert('✅ 下注成功！' + result.transactionHash);
    } catch (error) {
        alert('❌ 失败: ' + error.message);
    }
});
</script>
```

### 模板 2: 带余额显示

```html
<div>
    <button id="connectBtn">连接钱包</button>
    <p>余额: <span id="balance">0</span> USDC</p>
    <button id="betBtn">下注</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
<script src="/js/lumi-polymarket-integration.js"></script>

<script>
const lumi = new LUMIPolymarket();
let connected = false;

document.getElementById('connectBtn').addEventListener('click', async () => {
    await lumi.init();
    const balance = await lumi.getBalance(LUMI_CONFIG.contracts.mockUSDC);
    document.getElementById('balance').textContent = balance;
    connected = true;
});

document.getElementById('betBtn').addEventListener('click', async () => {
    if (!connected) {
        alert('请先连接钱包');
        return;
    }
    
    // 下注逻辑...
});
</script>
```

---

## 🎯 API 快速参考

### 初始化

```javascript
const lumi = new LUMIPolymarket();
await lumi.init(); // 连接钱包和初始化合约
```

### 创建市场

```javascript
const result = await lumi.createMarket(
    "市场标题",
    "市场描述",
    100 // 奖励金额 (USDC)
);
// 返回: { questionId, transactionHash, explorerUrl }
```

### 获取市场

```javascript
const market = await lumi.getMarket(questionId);
// 返回: { questionId, conditionId, title, description, ... }
```

### 创建订单

```javascript
const { order, signature } = await lumi.createOrder(
    tokenId,    // 代币ID (1=YES, 2=NO)
    10,         // 金额 (USDC)
    0.6,        // 价格 (0.6 = 60%)
    'BUY'       // 方向 (BUY/SELL)
);
```

### 执行交易

```javascript
const result = await lumi.fillOrder(order, signature);
// 返回: { transactionHash, explorerUrl }
```

### 请求结算

```javascript
const result = await lumi.requestSettlement(questionId);
// 调用 UMA 预言机
```

### 最终结算

```javascript
const result = await lumi.resolveMarket(questionId);
// 在挑战期后调用
```

### 赎回奖金

```javascript
const result = await lumi.redeemWinnings(
    conditionId,
    outcomeIndex // 0=YES, 1=NO
);
```

### 获取余额

```javascript
const ethBalance = await lumi.getBalance();
const usdcBalance = await lumi.getBalance(LUMI_CONFIG.contracts.mockUSDC);
```

---

## ✅ 验证集成

### 测试步骤

1. **打开示例页面**
   ```
   http://localhost:3000/lumi-integration-example.html
   ```

2. **连接钱包**
   - 点击"连接 MetaMask"
   - 切换到 Polygon Amoy 网络

3. **创建市场**
   - 填写标题和描述
   - 点击"创建市场"
   - 在 MetaMask 中确认交易

4. **查看结果**
   - 复制 QuestionID
   - 在区块链浏览器查看交易

### 预期输出

控制台应显示：

```
✅ LUMI Polymarket 集成库已加载
三大官方组件已就绪:
  1️⃣ UMA 官方预言机: 0x2633...464a
  2️⃣ Polymarket CTF Exchange: 0xdFE0...9E40
  3️⃣ Gnosis Conditional Tokens: 0xb171...0950
✅ LUMI Polymarket 已连接: 0x1234...
📝 创建预测市场...
✅ 市场创建成功！QuestionID: 0xabcd...
```

---

## 📚 相关文档

- [如何使用三大官方组件.md](./如何使用三大官方组件.md)
- [三大官方组件使用指南.md](./三大官方组件使用指南.md)
- [UMA协议集成完成.md](./UMA协议集成完成.md)
- [UMA预言机使用说明.md](./UMA预言机使用说明.md)

---

## 🎊 总结

### 已完成

- ✅ 创建通用JavaScript库 (`public/js/lumi-polymarket-integration.js`)
- ✅ 创建React Hook (`hooks/useLUMIPolymarket.ts`)
- ✅ 创建完整示例页面 (`public/lumi-integration-example.html`)
- ✅ 集成到 `sports-betting.html`

### 下一步

1. ⏳ 集成到其他 HTML 页面
2. ⏳ 集成到 Next.js 应用
3. ⏳ 添加错误处理和用户反馈
4. ⏳ 优化交易流程

---

**创建日期**: 2025-10-29  
**状态**: ✅ 核心功能已完成  
**维护者**: LUMI 团队

