# ✅ Polymarket 风格系统验证清单

## 🎯 使用本清单验证所有功能是否正常工作

---

## 📋 功能一：团队后台批量创建

### 1.1 数据库设置 ✅

```bash
# 检查数据库是否已设置
psql $DATABASE_URL -c "\dt"

# 应该看到以下表：
# - markets
# - orders
# - trades
# - settlements
# - balances
# - users
# - activity_logs
# - user_interests
```

**预期结果**：所有表都已创建 ✅

### 1.2 创建单个市场 ✅

```bash
# 1. 访问管理后台
http://localhost:3000/admin/create-market

# 2. 填写表单
标题: "测试市场 1"
描述: "这是一个测试市场"
分类: emerging

# 3. 提交
```

**预期结果**：
- ✅ 弹出成功提示
- ✅ 表单重置
- ✅ 数据库中有新记录

**验证**：
```bash
psql $DATABASE_URL -c "SELECT id, title, status, blockchain_status FROM markets ORDER BY id DESC LIMIT 1;"
```

### 1.3 批量创建市场 ✅

```bash
# 使用 API
curl -X POST http://localhost:3000/api/admin/markets/batch-create \
  -H "Content-Type: application/json" \
  -d '{
    "markets": [
      {"title": "批量测试 1", "description": "测试 1"},
      {"title": "批量测试 2", "description": "测试 2"},
      {"title": "批量测试 3", "description": "测试 3"}
    ]
  }'
```

**预期结果**：
```json
{
  "success": true,
  "count": 3,
  "message": "✅ 成功创建 3 个市场"
}
```

**验证**：
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM markets;"
```

---

## 📊 功能二：只为活跃市场付费

### 2.1 浏览追踪 ✅

```bash
# 模拟 10 次浏览
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/markets/1/view \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xUser$i\"}"
done
```

**预期结果**：每次调用返回 `{"success": true}`

**验证**：
```bash
psql $DATABASE_URL -c "SELECT id, title, views, activity_score FROM markets WHERE id = 1;"
```

应该看到：
- views: 10
- activity_score: > 0

### 2.2 感兴趣追踪 ✅

```bash
# 模拟 5 个用户标记感兴趣
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/markets/1/interested \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xTestUser$i\"}"
done
```

**预期结果**：每次调用返回 `{"success": true, "message": "✅ 已标记感兴趣"}`

**验证**：
```bash
psql $DATABASE_URL -c "SELECT id, title, interested_users, activity_score FROM markets WHERE id = 1;"
```

应该看到：
- interested_users: 5
- activity_score: 增加了

### 2.3 活跃度评分计算 ✅

```bash
# 查看活跃度评分
psql $DATABASE_URL -c "
SELECT 
  id, 
  title, 
  views, 
  interested_users, 
  activity_score,
  CASE 
    WHEN activity_score >= 80 THEN '极高'
    WHEN activity_score >= 60 THEN '高'
    WHEN activity_score >= 40 THEN '中等'
    WHEN activity_score >= 20 THEN '低'
    ELSE '极低'
  END as level
FROM markets
ORDER BY activity_score DESC;
"
```

**预期结果**：看到不同市场的评分分布

---

## 🚀 功能三：按需激活

### 3.1 查看待激活市场 ✅

```bash
psql $DATABASE_URL -c "
SELECT id, title, activity_score, views, interested_users, blockchain_status
FROM markets
WHERE blockchain_status = 'not_created'
  AND (activity_score >= 60 OR views >= 100 OR interested_users >= 10 OR priority_level = 'hot')
ORDER BY activity_score DESC;
"
```

**预期结果**：显示符合激活条件的市场

### 3.2 手动激活市场 ✅

**前提**：确保已配置 `PLATFORM_WALLET_PRIVATE_KEY` 和有足够的 USDC

```bash
# 激活市场 ID 1
curl -X POST http://localhost:3000/api/admin/markets/1/activate
```

**预期结果**：
```json
{
  "success": true,
  "message": "✅ 市场激活成功",
  "conditionId": "0xea6d...",
  "txHash": "0x1234..."
}
```

**验证**：
```bash
psql $DATABASE_URL -c "
SELECT id, title, blockchain_status, condition_id, activated_at 
FROM markets 
WHERE id = 1;
"
```

应该看到：
- blockchain_status: 'created'
- condition_id: 非空
- activated_at: 时间戳

### 3.3 定时任务激活 ✅

```bash
# 运行定时任务
npm run activate-markets
```

**预期输出**：
```
🔄 开始扫描待激活市场...
📊 找到 2 个待激活市场

激活市场: 测试市场 1
   活跃度: 65 | 浏览: 120 | 感兴趣: 15
✅ 激活成功!
```

**验证**：
```bash
psql $DATABASE_URL -c "
SELECT COUNT(*) as activated_count
FROM markets
WHERE blockchain_status = 'created';
"
```

---

## ⚡ 功能四：链下订单匹配

### 4.1 EIP-712 签名验证 ✅

**前端代码测试**（需要在浏览器控制台运行）：

```typescript
import { signOrder, generateOrderId, generateSalt } from '@/lib/clob/signing';

// 1. 连接钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
const address = await signer.getAddress();

// 2. 创建订单
const order = {
  orderId: generateOrderId(),
  maker: address,
  marketId: 1,
  outcome: 1,
  side: 'buy',
  price: '0.65',
  amount: '10',
  expiration: Math.floor(Date.now() / 1000) + 86400,
  nonce: Date.now(),
  salt: generateSalt()
};

// 3. 签名
const signature = await signOrder(order, signer);
console.log('Signature:', signature);
```

**预期结果**：返回一个 0x 开头的签名字符串

### 4.2 创建订单 ✅

```bash
# 使用上一步的签名订单
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-...",
    "maker": "0x...",
    "marketId": 1,
    "outcome": 1,
    "side": "buy",
    "price": "0.65",
    "amount": "10",
    "expiration": 1234567890,
    "nonce": 123456,
    "salt": "0x...",
    "signature": "0x..."
  }'
```

**预期结果**：
```json
{
  "success": true,
  "message": "订单已提交到订单簿",
  "order": {
    "id": 1,
    "status": "open",
    "filledAmount": "0",
    "remainingAmount": "10"
  }
}
```

**验证**：
```bash
psql $DATABASE_URL -c "SELECT * FROM orders WHERE order_id = 'order-...';"
```

### 4.3 订单匹配 ✅

```bash
# 创建相反方向的订单
# 订单 A: 买 10 @ 0.65
# 订单 B: 卖 10 @ 0.65
# 应该自动匹配

# 检查成交记录
psql $DATABASE_URL -c "
SELECT t.id, t.trade_id, t.price, t.amount, t.settled
FROM trades t
WHERE t.market_id = 1
ORDER BY t.created_at DESC;
"
```

**预期结果**：看到新的成交记录

### 4.4 订单簿查询 ✅

```bash
curl "http://localhost:3000/api/orders/book?marketId=1&outcome=1"
```

**预期结果**：
```json
{
  "success": true,
  "bids": [
    {"price": "0.65", "amount": "100"}
  ],
  "asks": [
    {"price": "0.67", "amount": "50"}
  ],
  "spread": "0.02"
}
```

### 4.5 取消订单 ✅

```bash
curl -X POST http://localhost:3000/api/orders/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-...",
    "userAddress": "0x..."
  }'
```

**预期结果**：
```json
{
  "success": true,
  "message": "订单已取消"
}
```

### 4.6 批量结算 ✅

```bash
# 运行批量结算任务
npm run settle-trades
```

**预期输出**：
```
💰 开始批量结算交易...
📊 找到 5 笔待结算交易
📦 创建结算批次: batch-1729756800000
✅ 批量结算完成
```

**验证**：
```bash
psql $DATABASE_URL -c "
SELECT 
  COUNT(*) as total_trades,
  SUM(CASE WHEN settled THEN 1 ELSE 0 END) as settled_trades
FROM trades;
"
```

### 4.7 清理过期订单 ✅

```bash
# 运行清理任务
npm run clean-orders
```

**预期输出**：
```
🧹 开始清理过期订单...
📊 找到 3 个过期订单
✅ 已标记 3 个订单为过期
```

---

## 🔧 定时任务验证

### 启动 Cron 调度器 ✅

```bash
# 启动定时任务
npm run cron
```

**预期输出**：
```
🚀 启动 Cron 调度器...

✅ Cron 调度器已启动

任务列表:
  1. 市场激活 - 每小时 (0 * * * *)
  2. 清理订单 - 每 30 分钟 (*/30 * * * *)
  3. 批量结算 - 每 5 分钟 (*/5 * * * *)

按 Ctrl+C 停止调度器
```

**验证**：等待任务自动运行，查看输出日志

---

## 📊 系统监控验证

### 市场统计 ✅

```bash
psql $DATABASE_URL -c "
SELECT 
  blockchain_status,
  COUNT(*) as count,
  ROUND(AVG(activity_score), 2) as avg_score
FROM markets
GROUP BY blockchain_status;
"
```

**预期输出**：
```
 blockchain_status | count | avg_score 
-------------------+-------+-----------
 not_created       |    80 |     25.50
 created           |    20 |     72.30
```

### 订单统计 ✅

```bash
psql $DATABASE_URL -c "
SELECT 
  status,
  COUNT(*) as count,
  SUM(remaining_amount::numeric) as total_amount
FROM orders
GROUP BY status;
"
```

### 成交统计 ✅

```bash
psql $DATABASE_URL -c "
SELECT 
  DATE(created_at) as date,
  COUNT(*) as trade_count,
  SUM(amount::numeric * price::numeric) as total_volume
FROM trades
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
"
```

---

## 🎯 完整流程验证

### 端到端测试 ✅

```bash
# 1. 创建市场
curl -X POST http://localhost:3000/api/admin/markets/create \
  -H "Content-Type: application/json" \
  -d '{"title":"完整测试市场","description":"端到端测试","mainCategory":"emerging"}'

# 记录返回的 market ID (假设是 100)

# 2. 模拟用户活跃
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/markets/100/view \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xUser$i\"}"
done

for i in {1..15}; do
  curl -X POST http://localhost:3000/api/markets/100/interested \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xUser$i\"}"
done

# 3. 检查活跃度
psql $DATABASE_URL -c "SELECT id, title, views, interested_users, activity_score FROM markets WHERE id = 100;"

# 4. 激活市场
curl -X POST http://localhost:3000/api/admin/markets/100/activate

# 5. 验证激活成功
psql $DATABASE_URL -c "SELECT id, blockchain_status, condition_id FROM markets WHERE id = 100;"

# 6. 提交订单（需要在前端用钱包签名）

# 7. 批量结算
npm run settle-trades

# 8. 验证完整流程
psql $DATABASE_URL -c "
SELECT 
  m.id,
  m.title,
  m.views,
  m.interested_users,
  m.activity_score,
  m.blockchain_status,
  COUNT(o.id) as order_count,
  COUNT(t.id) as trade_count
FROM markets m
LEFT JOIN orders o ON m.id = o.market_id
LEFT JOIN trades t ON m.id = t.market_id
WHERE m.id = 100
GROUP BY m.id;
"
```

**预期结果**：
- ✅ 市场已创建
- ✅ 活跃度评分增加
- ✅ 市场已激活（blockchain_status = 'created'）
- ✅ 有订单记录
- ✅ 有成交记录

---

## 🎉 验证通过标准

### 必须通过的检查项

- [ ] 数据库所有表已创建
- [ ] 可以创建单个市场
- [ ] 可以批量创建市场
- [ ] 浏览追踪正常工作
- [ ] 感兴趣追踪正常工作
- [ ] 活跃度评分正确计算
- [ ] 手动激活市场成功
- [ ] 定时任务正常运行
- [ ] 订单签名验证通过
- [ ] 订单创建成功
- [ ] 订单自动匹配工作
- [ ] 订单簿查询正常
- [ ] 取消订单功能正常
- [ ] 批量结算任务运行成功
- [ ] 清理过期订单正常
- [ ] 端到端流程完整

### 性能要求

- [ ] 市场创建 < 100ms
- [ ] 订单提交 < 100ms
- [ ] 订单匹配 < 500ms
- [ ] API 响应 < 1s

---

## 🐛 常见问题排查

### 数据库连接失败
```bash
# 测试连接
psql $DATABASE_URL -c "SELECT NOW();"
```

### 平台钱包余额不足
```bash
# 检查余额
cast balance $NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS --rpc-url $NEXT_PUBLIC_RPC_URL
```

### 签名验证失败
- 检查 Domain 和 Types 是否一致
- 验证 chainId 是否正确（80002）

---

## ✅ 验证完成

**如果所有检查项都通过，恭喜！您的系统已经完全就绪！** 🎉

---

**创建时间**: 2025-10-24  
**版本**: v1.0

