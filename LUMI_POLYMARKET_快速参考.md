# 🎯 LUMI Polymarket 快速参考卡

> 2分钟快速上手三大官方组件

---

## 📦 引入库 (HTML页面)

```html
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
<script src="/js/lumi-polymarket-integration.js"></script>
```

---

## 🚀 基础使用

### 1. 初始化

```javascript
const lumi = new LUMIPolymarket();
await lumi.init(); // 自动连接MetaMask
```

### 2. 创建市场

```javascript
const market = await lumi.createMarket(
    "比赛标题",
    "比赛描述",
    100  // 奖励金额 (USDC)
);
console.log('QuestionID:', market.questionId);
```

### 3. 下注

```javascript
// 创建订单
const { order, signature } = await lumi.createOrder(
    1,      // 1=YES, 2=NO
    10,     // 10 USDC
    0.6,    // 60%价格
    'BUY'
);

// 执行交易
const result = await lumi.fillOrder(order, signature);
alert('成功！' + result.transactionHash);
```

### 4. 结算

```javascript
// 请求UMA预言机
await lumi.requestSettlement(questionId);

// 等待2小时挑战期后
await lumi.resolveMarket(questionId);
```

### 5. 赎回

```javascript
await lumi.redeemWinnings(
    conditionId,
    0  // 0=YES, 1=NO
);
```

---

## 🎮 React Hook 版本

```typescript
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';

function MyComponent() {
  const {
    connect,
    isConnected,
    createMarket,
    fillOrder
  } = useLUMIPolymarket();

  return (
    <button onClick={connect}>
      {isConnected ? '已连接' : '连接钱包'}
    </button>
  );
}
```

---

## 🔗 三大组件地址

```javascript
UMA 预言机:        0x263351499f82C107e540B01F0Ca959843e22464a
CTF Exchange:     0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40
Conditional Tokens: 0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
```

---

## 📊 完整示例

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
    <script src="/js/lumi-polymarket-integration.js"></script>
</head>
<body>
    <button id="betBtn">下注</button>

    <script>
        const lumi = new LUMIPolymarket();
        
        document.getElementById('betBtn').addEventListener('click', async () => {
            try {
                // 连接钱包
                await lumi.init();
                
                // 创建市场
                const market = await lumi.createMarket(
                    "Lakers vs Bulls",
                    "谁会赢？",
                    100
                );
                
                // 下注
                const { order, signature } = await lumi.createOrder(1, 10, 0.6, 'BUY');
                const result = await lumi.fillOrder(order, signature);
                
                alert('✅ 成功！' + result.transactionHash);
            } catch (error) {
                alert('❌ 失败: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

---

## 🧪 测试页面

打开浏览器访问:
```
http://localhost:3000/lumi-integration-example.html
```

---

## 📚 完整文档

- [LUMI_POLYMARKET_集成指南.md](./LUMI_POLYMARKET_集成指南.md)
- [LUMI_三大组件_完整集成方案.md](./LUMI_三大组件_完整集成方案.md)

---

## ⚡ 批量集成所有页面

```bash
node scripts/add-polymarket-to-all-pages.js
```

---

**🎉 就这么简单！开始使用 Polymarket 官方组件吧！**

