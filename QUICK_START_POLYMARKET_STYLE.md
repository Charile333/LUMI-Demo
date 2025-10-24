# 🚀 Polymarket 风格系统 - 快速开始

## 📋 前提条件

- Node.js 18+
- PostgreSQL 14+ 或 Supabase
- 平台钱包（用于自动激活市场）

---

## ⚡ 5 分钟快速开始

### 1. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑配置（最少需要这些）
DATABASE_URL=postgresql://user:password@localhost:5432/market_clob
PLATFORM_WALLET_PRIVATE_KEY=0x...
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

### 2. 初始化数据库

```bash
# 方法 1：使用脚本
npm run db:setup
npm run db:migrate

# 方法 2：手动执行
psql $DATABASE_URL -f scripts/supabase-step2-tables.sql
psql $DATABASE_URL -f scripts/add-activity-fields.sql
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动服务

```bash
# 终端 1：启动 Next.js
npm run dev

# 终端 2：启动定时任务
npm run cron
```

### 5. 创建第一个市场

```bash
# 访问管理后台
http://localhost:3000/admin/create-market

# 填写表单并提交
# ✅ 市场立即创建，成本 $0
```

---

## 📊 完整使用流程

### 场景 1：创建并激活市场

```bash
# 步骤 1：创建市场（免费）
http://localhost:3000/admin/create-market
→ 填写表单 → 提交
→ ✅ 市场创建成功（数据库）

# 步骤 2：模拟用户活跃
# 浏览市场 10 次
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/markets/1/view \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xUser$i\"}"
done

# 10 个用户标记感兴趣
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/markets/1/interested \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\":\"0xUser$i\"}"
done

# 步骤 3：检查活跃度评分
psql $DATABASE_URL -c "
SELECT id, title, views, interested_users, activity_score, blockchain_status
FROM markets
WHERE id = 1;
"

# 步骤 4：激活市场
# 方法 A：自动（定时任务会扫描）
npm run activate-markets

# 方法 B：手动
curl -X POST http://localhost:3000/api/admin/markets/1/activate

# 步骤 5：验证激活成功
psql $DATABASE_URL -c "
SELECT id, title, blockchain_status, condition_id
FROM markets
WHERE id = 1;
"
# 应该看到 blockchain_status = 'created'
```

---

### 场景 2：链下订单匹配

#### 前端代码示例

```typescript
// components/TradingForm.tsx

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { signOrder, generateOrderId, generateSalt } from '@/lib/clob/signing';

export function TradingForm({ marketId }: { marketId: number }) {
  const { signer, address } = useWallet();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('0.65');
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 构造订单
      const order = {
        orderId: generateOrderId(),
        maker: address,
        marketId: marketId,
        outcome: 1, // 1=YES, 0=NO
        side: side,
        price: price,
        amount: amount,
        expiration: Math.floor(Date.now() / 1000) + 86400, // 24小时
        nonce: Date.now(),
        salt: generateSalt()
      };

      // 2. 签名订单（EIP-712）
      const signature = await signOrder(order, signer);
      const signedOrder = { ...order, signature };

      // 3. 提交订单
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedOrder)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        
        // 显示成交信息
        if (data.trades.length > 0) {
          console.log('成交记录:', data.trades);
        }
      } else {
        alert('❌ ' + data.error);
      }

    } catch (error) {
      console.error('交易失败:', error);
      alert('❌ 交易失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>方向</label>
        <select value={side} onChange={e => setSide(e.target.value as any)}>
          <option value="buy">买入 YES</option>
          <option value="sell">卖出 YES</option>
        </select>
      </div>

      <div>
        <label>价格</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
      </div>

      <div>
        <label>数量</label>
        <input
          type="number"
          step="1"
          min="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '提交订单'}
      </button>
    </form>
  );
}
```

---

### 场景 3：查看订单簿

```bash
# 获取订单簿
curl "http://localhost:3000/api/orders/book?marketId=1&outcome=1"

# 返回示例：
{
  "success": true,
  "marketId": 1,
  "outcome": 1,
  "bids": [
    { "price": "0.65", "amount": "100" },
    { "price": "0.63", "amount": "50" }
  ],
  "asks": [
    { "price": "0.67", "amount": "80" },
    { "price": "0.70", "amount": "120" }
  ],
  "spread": "0.02",
  "timestamp": 1729756800000
}
```

---

## 🔧 定时任务

### 市场激活任务（每小时）

```bash
# 手动运行
npm run activate-markets

# 查看日志
tail -f logs/activate-markets.log
```

### 批量结算任务（每 5 分钟）

```bash
# 手动运行
npm run settle-trades

# 查看待结算交易
psql $DATABASE_URL -c "
SELECT COUNT(*) as pending_trades
FROM trades
WHERE settled = false;
"
```

### 清理过期订单（每 30 分钟）

```bash
# 手动运行
npm run clean-orders

# 查看过期订单
psql $DATABASE_URL -c "
SELECT COUNT(*) as expired_orders
FROM orders
WHERE status = 'expired';
"
```

---

## 📊 监控命令

### 查看系统状态

```bash
# 市场统计
psql $DATABASE_URL -c "
SELECT 
  blockchain_status,
  COUNT(*) as count,
  AVG(activity_score) as avg_score
FROM markets
GROUP BY blockchain_status;
"

# 订单统计
psql $DATABASE_URL -c "
SELECT 
  status,
  COUNT(*) as count,
  SUM(remaining_amount::numeric) as total_amount
FROM orders
GROUP BY status;
"

# 成交统计
psql $DATABASE_URL -c "
SELECT 
  DATE(created_at) as date,
  COUNT(*) as trade_count,
  SUM(amount::numeric) as total_volume
FROM trades
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
"
```

---

## 🎯 常用 API

### 管理员 API

```bash
# 创建市场
POST /api/admin/markets/create
Body: {
  "title": "市场标题",
  "description": "市场描述",
  "mainCategory": "automotive",
  "priorityLevel": "recommended",
  "rewardAmount": "10"
}

# 批量创建市场
POST /api/admin/markets/batch-create
Body: {
  "markets": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ]
}

# 激活市场
POST /api/admin/markets/{id}/activate
```

### 用户行为 API

```bash
# 记录浏览
POST /api/markets/{id}/view
Body: { "userAddress": "0x..." }

# 标记感兴趣
POST /api/markets/{id}/interested
Body: { "userAddress": "0x..." }

# 取消感兴趣
DELETE /api/markets/{id}/interested
Body: { "userAddress": "0x..." }
```

### 订单 API

```bash
# 创建订单
POST /api/orders/create
Body: {
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
}

# 获取订单簿
GET /api/orders/book?marketId=1&outcome=1

# 取消订单
POST /api/orders/cancel
Body: {
  "orderId": "order-...",
  "userAddress": "0x..."
}
```

---

## 🔍 故障排查

### 问题：数据库连接失败

```bash
# 测试连接
psql $DATABASE_URL -c "SELECT NOW();"

# 检查环境变量
echo $DATABASE_URL
```

### 问题：平台钱包余额不足

```bash
# 检查 POL 余额（用于 Gas）
cast balance $NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS --rpc-url $NEXT_PUBLIC_RPC_URL

# 检查 USDC 余额（用于奖励）
cast call $NEXT_PUBLIC_USDC_ADDRESS "balanceOf(address)(uint256)" $NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS --rpc-url $NEXT_PUBLIC_RPC_URL
```

### 问题：市场激活失败

```bash
# 查看失败的市场
psql $DATABASE_URL -c "
SELECT id, title, blockchain_status
FROM markets
WHERE blockchain_status = 'failed';
"

# 重试激活
curl -X POST http://localhost:3000/api/admin/markets/{id}/activate
```

---

## 🎉 完成！

您的 Polymarket 风格系统已经就绪：

✅ 免费创建市场
✅ 智能活跃度评估
✅ 自动按需激活
✅ 链下快速匹配
✅ 批量链上结算

**成本节省**: 80-90% 🎊

---

## 📚 更多资源

- 完整实施指南: `POLYMARKET_IMPLEMENTATION_GUIDE.md`
- API 文档: `API_DOCS.md`
- 数据库架构: `scripts/supabase-step2-tables.sql`
- 环境配置: `.env.example`

---

**创建时间**: 2025-10-24
**版本**: v1.0

