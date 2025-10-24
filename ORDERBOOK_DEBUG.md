# 📊 订单簿调试指南

## 问题：下单后在订单簿看不到订单

### ✅ 已修复的问题

1. **API返回格式** - 修复了API和组件之间的数据格式不匹配
2. **订单计数** - 添加了 `order_count` 字段显示每个价格层级的订单数
3. **数据结构** - 统一了订单簿数据结构

---

## 🔍 调试步骤

### 1. 检查订单是否创建成功

打开浏览器控制台 (F12)，查看网络请求：

```
POST /api/orders/create
Response:
{
  "success": true,
  "order": {
    "id": 123,
    "orderId": "order-xxx",
    "status": "open",
    "filledAmount": "0",
    "remainingAmount": "10"
  },
  "trades": [],
  "message": "订单已提交到订单簿"
}
```

如果看到 `success: true`，说明订单创建成功了。

---

### 2. 检查数据库中的订单

在数据库中运行查询：

```sql
-- 查看所有订单
SELECT 
  id, order_id, market_id, side, outcome, 
  price, amount, remaining_amount, status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- 查看特定市场的订单
SELECT 
  id, order_id, side, outcome, 
  price, remaining_amount, status
FROM orders
WHERE market_id = YOUR_MARKET_ID
  AND status IN ('open', 'partial')
  AND remaining_amount > 0
ORDER BY created_at DESC;
```

---

### 3. 检查订单簿API

在浏览器中访问或在控制台运行：

```javascript
// 检查YES订单簿
fetch('/api/orders/book?marketId=1&outcome=1')
  .then(r => r.json())
  .then(d => console.log('YES订单簿:', d));

// 检查NO订单簿
fetch('/api/orders/book?marketId=1&outcome=0')
  .then(r => r.json())
  .then(d => console.log('NO订单簿:', d));
```

期望返回：
```json
{
  "success": true,
  "orderBook": {
    "bids": [
      {
        "price": "0.67",
        "total_amount": "10",
        "order_count": 1
      }
    ],
    "asks": [],
    "spread": null,
    "updatedAt": 1234567890
  }
}
```

---

### 4. 常见问题排查

#### 问题A: 订单创建成功但看不到

**可能原因：**
1. ✅ 你买的是 YES，但在看 NO 的订单簿（或相反）
2. ✅ 订单已过期（检查 `expiration` 字段）
3. ✅ 订单状态不是 `open` 或 `partial`
4. ✅ `remaining_amount` 已经是 0（完全成交了）

**解决方法：**
- 在订单簿组件中切换 YES/NO 按钮
- 检查订单的 outcome 字段 (1=YES, 0=NO)
- 刷新页面

#### 问题B: API返回空数组

**可能原因：**
```sql
-- 检查这些条件
WHERE market_id = $1           -- 市场ID是否正确
  AND outcome = $2             -- outcome是否正确 (0或1)
  AND side = 'buy'             -- 只显示买单
  AND status IN ('open', 'partial')  -- 状态是否正确
  AND remaining_amount > 0     -- 剩余数量 > 0
  AND expiration > NOW()       -- 未过期
```

**解决方法：**
```sql
-- 查看所有订单（不加过滤）
SELECT * FROM orders 
WHERE market_id = YOUR_MARKET_ID
ORDER BY created_at DESC;
```

#### 问题C: 控制台错误

查看浏览器控制台 (F12) 的错误信息：

```
❌ 获取订单簿失败
❌ 签名验证失败
❌ 数据库查询错误
```

---

## 🎯 快速测试

### 测试脚本

在浏览器控制台运行：

```javascript
// 1. 检查市场存在
fetch('/api/markets/1')
  .then(r => r.json())
  .then(d => console.log('市场:', d));

// 2. 查看订单簿
fetch('/api/orders/book?marketId=1&outcome=1')
  .then(r => r.json())
  .then(d => console.log('订单簿:', d));

// 3. 查看我的订单（需要连接钱包）
fetch('/api/orders/my')
  .then(r => r.json())
  .then(d => console.log('我的订单:', d));
```

---

## 📝 订单生命周期

```
1. 用户下单
   ↓
2. QuickTradeModal 签名
   ↓
3. POST /api/orders/create
   ↓
4. matchingEngine.submitOrder()
   ↓
5. 保存到数据库 (status: open)
   ↓
6. 尝试匹配现有订单
   ↓
7a. 完全成交 → status: filled
7b. 部分成交 → status: partial
7c. 未成交 → status: open
   ↓
8. 显示在订单簿中
```

---

## 🔧 修复命令

### 如果订单簿一直显示"加载中"

```javascript
// 强制刷新
window.location.reload();

// 清除缓存
localStorage.clear();
```

### 如果订单簿显示"暂无订单数据"

1. 打开浏览器控制台 (F12)
2. 查看 Network 标签
3. 找到 `/api/orders/book` 请求
4. 查看返回的数据

---

## 📊 订单簿组件功能

### 自动刷新
- 每5秒自动刷新一次
- 显示最新的订单数据

### YES/NO切换
- 点击顶部的 YES/NO 按钮
- 切换查看不同outcome的订单簿

### 数据显示
- **卖单 (ASK)**: 红色，从低到高显示
- **买单 (BID)**: 绿色，从高到低显示
- **价差**: 蓝色，显示最佳买卖价差

---

## 🚨 紧急调试

如果完全看不到订单，运行这个完整检查：

```javascript
const DEBUG = async () => {
  const marketId = 1; // 改成你的市场ID
  
  console.log('=== 开始调试 ===');
  
  // 1. 检查市场
  const market = await fetch(`/api/markets/${marketId}`)
    .then(r => r.json());
  console.log('1. 市场:', market);
  
  // 2. 检查YES订单簿
  const yesBook = await fetch(`/api/orders/book?marketId=${marketId}&outcome=1`)
    .then(r => r.json());
  console.log('2. YES订单簿:', yesBook);
  
  // 3. 检查NO订单簿
  const noBook = await fetch(`/api/orders/book?marketId=${marketId}&outcome=0`)
    .then(r => r.json());
  console.log('3. NO订单簿:', noBook);
  
  console.log('=== 调试完成 ===');
  
  // 分析
  if (yesBook.orderBook?.bids?.length > 0 || yesBook.orderBook?.asks?.length > 0) {
    console.log('✅ YES订单簿有数据');
  } else {
    console.log('❌ YES订单簿为空');
  }
  
  if (noBook.orderBook?.bids?.length > 0 || noBook.orderBook?.asks?.length > 0) {
    console.log('✅ NO订单簿有数据');
  } else {
    console.log('❌ NO订单簿为空');
  }
};

DEBUG();
```

---

## ✉️ 需要帮助？

如果以上步骤都无法解决问题，请提供以下信息：

1. 浏览器控制台的完整错误日志
2. `/api/orders/book` 的返回数据
3. 订单创建时的响应
4. 数据库中的订单记录截图

---

## 📋 检查清单

- [ ] 订单创建成功 (API返回 success: true)
- [ ] 数据库中有订单记录
- [ ] 订单状态是 open 或 partial
- [ ] remaining_amount > 0
- [ ] 订单未过期 (expiration > 当前时间)
- [ ] 在正确的 outcome 标签中查看 (YES=1, NO=0)
- [ ] 页面已刷新
- [ ] 控制台没有错误
- [ ] API返回有数据

如果所有项都打勾，但还是看不到订单，请联系开发者。

