# 🎯 LUMI 预测市场价格计算机制

## 核心原理

### 价格 = 概率

Polymarket/LUMI 上显示的价格实际上代表事件发生的概率：

- **价格范围**：$0.00 到 $1.00
- **概率范围**：0% 到 100%

### 示例

| 价格 | 概率 | 含义 |
|------|------|------|
| $0.60 | 60% | 市场认为事件有 60% 的可能性发生 |
| $0.30 | 30% | 市场认为事件有 30% 的可能性发生 |
| $0.90 | 90% | 市场认为事件有 90% 的可能性发生 |

---

## 🔑 价格计算规则（核心公式）

### 永恒不变的规则

```
显示价格 = (最高买价 + 最低卖价) ÷ 2
```

或用英文表示：

```
Mid Price = (Best Bid + Best Ask) ÷ 2
```

### 重要特性

- ✅ **无论市场参与人数多少，规则都一样**
- ✅ **这是订单簿的中间价（Mid Price）**
- ✅ **反映市场当前的公允价格**

---

## 📊 市场深度的影响

### 人多（高流动性）

```
最高买价：$0.58
最低卖价：$0.62
价差：$0.04

显示价格 = ($0.58 + $0.62) ÷ 2 = $0.60
```

**特点**：
- ✅ 价差小（Tight Spread）
- ✅ 价格稳定
- ✅ 成交容易

### 人少（低流动性）

```
最高买价：$0.30
最低卖价：$0.80
价差：$0.50

显示价格 = ($0.30 + $0.80) ÷ 2 = $0.55
```

**特点**：
- ⚠️ 价差大（Wide Spread）
- ⚠️ 价格波动
- ⚠️ 成交困难

---

## 🎮 实际交易案例

### 案例 1：正常市场

```
订单簿状态：
卖单（Ask）：
  $0.62 - 100 份额
  $0.63 - 200 份额
  
买单（Bid）：
  $0.58 - 150 份额
  $0.57 - 180 份额

计算：
最高买价（Best Bid）= $0.58
最低卖价（Best Ask）= $0.62
显示价格 = ($0.58 + $0.62) ÷ 2 = $0.60
概率显示 = 60%
```

### 案例 2：大价差市场

```
订单簿状态：
卖单（Ask）：
  $0.80 - 50 份额
  $0.85 - 30 份额
  
买单（Bid）：
  $0.30 - 100 份额
  $0.25 - 80 份额

计算：
最高买价（Best Bid）= $0.30
最低卖价（Best Ask）= $0.80
显示价格 = ($0.30 + $0.80) ÷ 2 = $0.55
概率显示 = 55%

⚠️ 注意：虽然显示 55%，但：
- 你想买入（YES）需要支付 $0.80
- 你想卖出（YES）只能得到 $0.30
- 价差高达 $0.50，非常大！
```

### 案例 3：单边市场

```
情况 A：只有卖单
卖单（Ask）：$0.70
买单（Bid）：无

处理方式：
- 估算买价 = $0.70 - $0.05 = $0.65
- 显示价格 = ($0.65 + $0.70) ÷ 2 = $0.675
- 概率显示 = 67.5%

情况 B：只有买单
买单（Bid）：$0.40
卖单（Ask）：无

处理方式：
- 估算卖价 = $0.40 + $0.05 = $0.45
- 显示价格 = ($0.40 + $0.45) ÷ 2 = $0.425
- 概率显示 = 42.5%
```

---

## 💡 YES 和 NO 的关系

在二元预测市场中：

```
YES 价格 + NO 价格 = $1.00 = 100%
```

### 示例

如果 YES = $0.60（60%）
则 NO = $1.00 - $0.60 = $0.40（40%）

**为什么？**
- 事件要么发生（YES），要么不发生（NO）
- 两种结果的概率之和必须是 100%
- 这确保了市场的数学一致性

---

## 🔧 代码实现

### 前端价格计算（React）

```typescript
interface PriceData {
  yes: number;        // YES 价格（0-1）
  no: number;         // NO 价格（0-1）
  probability: number; // 概率百分比（0-100）
  bestBid: number;    // 最高买价
  bestAsk: number;    // 最低卖价
}

// 从订单簿更新价格
const updatePrices = (orderBook: OrderBook) => {
  let { bestBid, bestAsk } = orderBook;
  
  // 处理单边订单情况
  if (bestBid === 0 && bestAsk > 0) {
    bestBid = Math.max(0.01, bestAsk - 0.05);
  } else if (bestAsk === 0 && bestBid > 0) {
    bestAsk = Math.min(0.99, bestBid + 0.05);
  } else if (bestBid === 0 && bestAsk === 0) {
    // 订单簿为空，使用默认值
    bestBid = 0.49;
    bestAsk = 0.51;
  }
  
  // 核心公式
  const midPrice = (bestBid + bestAsk) / 2;
  
  setPrices({
    yes: midPrice,
    no: 1 - midPrice,              // YES + NO = 1
    probability: midPrice * 100,    // 转换为百分比
    bestBid,
    bestAsk
  });
};
```

### 后端订单簿聚合（SQL）

```sql
-- 获取最高买价
SELECT price, SUM(quantity - filled_quantity) as total_amount
FROM orders
WHERE market_id = ? 
  AND side = 'buy'
  AND status IN ('open', 'partial')
  AND (quantity - filled_quantity) > 0
GROUP BY price
ORDER BY price DESC  -- 最高买价在最前
LIMIT 1;

-- 获取最低卖价
SELECT price, SUM(quantity - filled_quantity) as total_amount
FROM orders
WHERE market_id = ? 
  AND side = 'sell'
  AND status IN ('open', 'partial')
  AND (quantity - filled_quantity) > 0
GROUP BY price
ORDER BY price ASC   -- 最低卖价在最前
LIMIT 1;
```

---

## 📈 价格更新机制

### 实时更新（WebSocket）

```typescript
// 订阅订单簿更新
useEffect(() => {
  if (wsOrderBook) {
    // 每次订单簿更新时重新计算价格
    const midPrice = (wsOrderBook.bestBid + wsOrderBook.bestAsk) / 2;
    updateDisplayPrice(midPrice);
  }
}, [wsOrderBook]);
```

### 触发价格更新的事件

1. ✅ 新订单创建
2. ✅ 订单被取消
3. ✅ 订单被成交（全部或部分）
4. ✅ 订单价格修改

---

## ⚠️ 重要注意事项

### 1. 显示价格 ≠ 实际成交价

- **显示价格**：仅供参考，表示市场中间价
- **买入时**：需要支付最低卖价（Best Ask）或更高
- **卖出时**：只能得到最高买价（Best Bid）或更低

### 2. 价差（Spread）是交易成本

```
价差 = 最低卖价 - 最高买价
交易成本 = 价差 ÷ 2（往返）

例如：
最高买价 = $0.58
最低卖价 = $0.62
价差 = $0.04
单程成本 = $0.02（买入时多付，卖出时少收）
往返成本 = $0.04（完整一个买卖循环）
```

### 3. 极端情况处理

```typescript
// 订单簿完全为空
if (bestBid === 0 && bestAsk === 0) {
  bestBid = 0.49;  // 假设 49%
  bestAsk = 0.51;  // 假设 51%
}

// 只有单边订单
if (bestBid === 0) {
  bestBid = Math.max(0.01, bestAsk - 0.05);
}
if (bestAsk === 0) {
  bestAsk = Math.min(0.99, bestBid + 0.05);
}
```

---

## 🎯 用户体验优化

### 前端显示建议

```typescript
// 1. 显示中间价和价差
<div>
  <span>当前价格: {midPrice.toFixed(2)}</span>
  <span>买价: {bestBid.toFixed(2)}</span>
  <span>卖价: {bestAsk.toFixed(2)}</span>
  <span>价差: {(bestAsk - bestBid).toFixed(2)}</span>
</div>

// 2. 价差警告
{spread > 0.10 && (
  <div className="warning">
    ⚠️ 当前价差较大（{(spread * 100).toFixed(0)}%），交易成本较高
  </div>
)}

// 3. 流动性指示器
{spread < 0.02 && <span>🟢 高流动性</span>}
{spread >= 0.02 && spread < 0.10 && <span>🟡 中等流动性</span>}
{spread >= 0.10 && <span>🔴 低流动性</span>}
```

---

## 📚 相关概念

### 订单簿（Order Book）
记录所有待成交订单的数据结构，包括价格和数量。

### 买价（Bid）
买家愿意支付的价格，从高到低排列。

### 卖价（Ask）
卖家要求的价格，从低到高排列。

### 中间价（Mid Price）
买价和卖价的平均值，代表市场的公允价格。

### 价差（Spread）
最低卖价和最高买价之间的差距，反映市场的流动性。

### 流动性（Liquidity）
市场中可交易的订单数量和深度，流动性越高，价差越小。

---

## ✅ 总结

LUMI 的价格计算机制简单而有效：

1. **价格 = 概率**（0-1 或 0%-100%）
2. **显示价格 = (最高买价 + 最低卖价) ÷ 2**
3. **YES + NO = 100%**
4. **价差反映流动性**

这个机制确保了：
- ✅ 价格真实反映市场预期
- ✅ 透明、公平、可验证
- ✅ 符合金融市场标准
- ✅ 易于理解和使用

---

**文档版本**：1.0
**更新日期**：2025-10-29
**作者**：LUMI Team

