# 🚀 Supabase实时订单簿 - 快速参考

## 📋 立即开始（3步）

### 1️⃣ 在Supabase创建表（5分钟）

```bash
1. 登录 https://supabase.com
2. 打开你的项目
3. 点击 SQL Editor
4. 复制粘贴 scripts/supabase-orderbook-schema.sql
5. 点击 Run
```

### 2️⃣ 配置环境变量（2分钟）

创建 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 3️⃣ 测试（3分钟）

```bash
npm run dev
# 访问: http://localhost:3000/test-orderbook-realtime
```

---

## 📦 已创建的文件

### Hooks
```
hooks/
├── useOrderBookRealtime.ts     # 实时订单簿Hook
└── useMarketStateRealtime.ts   # 市场状态Hook
```

### API路由
```
app/api/
├── orders/create-realtime/route.ts
└── markets/[marketId]/interested-realtime/route.ts
```

### SQL脚本
```
scripts/
└── supabase-orderbook-schema.sql
```

### 配置
```
lib/
└── supabase-client.ts          # 已更新支持SDK
```

---

## 💡 使用示例

### 前端组件

```typescript
'use client';

import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';
import { useMarketStateRealtime } from '@/hooks/useMarketStateRealtime';

export default function MarketPage() {
  const marketId = 1;
  
  // 订阅订单簿
  const { orderBook, connected, loading } = useOrderBookRealtime(marketId);
  
  // 订阅市场状态
  const { marketState } = useMarketStateRealtime(marketId);

  return (
    <div>
      {/* 连接状态 */}
      <div>{connected ? '🟢 实时' : '🔴 离线'}</div>
      
      {/* 订单簿 */}
      <div>
        <h3>买单</h3>
        {orderBook?.bids.map(bid => (
          <div>{bid.price} × {bid.quantity}</div>
        ))}
      </div>
      
      {/* 市场状态 */}
      <div>
        状态: {marketState?.status}
        感兴趣: {marketState?.interestedCount}
      </div>
    </div>
  );
}
```

### 创建订单

```javascript
// 浏览器控制台或前端代码
fetch('/api/orders/create-realtime', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    marketId: 1,
    userAddress: '0x123...',
    side: 'buy',      // 或 'sell'
    price: 0.55,
    quantity: 100
  })
})
.then(res => res.json())
.then(data => console.log('✅', data));
```

### 表达兴趣

```javascript
fetch('/api/markets/1/interested-realtime', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log('✅', data));
```

---

## 🗄️ 数据库表结构

### orderbooks（订单簿）
```sql
{
  id: bigint
  market_id: integer
  bids: jsonb          -- [{price, quantity, total}]
  asks: jsonb          -- [{price, quantity, total}]
  last_price: decimal
  volume_24h: decimal
  updated_at: timestamp
}
```

### orders（订单）
```sql
{
  id: bigint
  market_id: integer
  user_address: text
  side: 'buy' | 'sell'
  price: decimal
  quantity: decimal
  filled_quantity: decimal
  status: 'open' | 'partial' | 'filled' | 'cancelled'
  created_at: timestamp
  updated_at: timestamp
}
```

### market_states（市场状态）
```sql
{
  id: bigint
  market_id: integer
  status: 'pending' | 'activating' | 'active' | 'failed'
  interested_count: integer
  activation_threshold: integer
  message: text
  updated_at: timestamp
}
```

---

## 🔧 常用操作

### 查询订单簿

```typescript
const { data } = await supabase
  .from('orderbooks')
  .select('*')
  .eq('market_id', 1)
  .single();
```

### 查询用户订单

```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_address', '0x123...')
  .eq('status', 'open');
```

### 取消订单

```typescript
const { error } = await supabase
  .from('orders')
  .update({ status: 'cancelled' })
  .eq('id', orderId);
```

### 清理旧订单

```sql
-- 在Supabase SQL Editor中执行
SELECT cleanup_old_orders();
```

---

## 📊 实时工作原理

```
用户创建订单
    ↓
API: /api/orders/create-realtime
    ↓
INSERT INTO orders (...)
    ↓
UPDATE orderbooks (聚合计算)
    ↓
PostgreSQL NOTIFY (自动)
    ↓
Supabase Realtime (自动推送)
    ↓
所有订阅的客户端立即收到更新 ⚡
```

**延迟：< 500ms**

---

## 🎯 关键API

### Hook API

```typescript
// 订单簿Hook
const {
  orderBook,     // 订单簿数据
  connected,     // 是否连接
  loading,       // 是否加载中
  error,         // 错误信息
  refresh        // 手动刷新
} = useOrderBookRealtime(marketId);

// 市场状态Hook
const {
  marketState,   // 市场状态
  loading,       // 是否加载中
  error,         // 错误信息
  refresh        // 手动刷新
} = useMarketStateRealtime(marketId);
```

### 批量订阅

```typescript
// 批量订单簿
const { orderBooks, loading, connected } = 
  useMultipleOrderBooks([1, 2, 3]);

// 批量市场状态
const { marketStates, loading } = 
  useMultipleMarketStates([1, 2, 3]);
```

---

## 🐛 常见问题

### Q: 显示"🔴 离线"

**A:** 检查：
1. Supabase URL和Key是否正确
2. 表是否启用实时功能 (`ALTER TABLE ... REPLICA IDENTITY FULL`)
3. 网络是否正常

### Q: 订单创建成功但不更新

**A:** 
1. 检查浏览器控制台错误
2. 确认`orderbooks`表有数据
3. 刷新页面重新订阅

### Q: Vercel上不工作

**A:** 
1. 确认环境变量已配置
2. 检查Vercel部署日志
3. 确认`SUPABASE_SERVICE_ROLE_KEY`已设置

---

## 💰 费用

**Supabase免费额度：**
- ✅ 500MB 数据库
- ✅ 2GB 带宽/月
- ✅ 50万次实时消息/月
- ✅ 无限API请求

**对于中小型应用完全够用！**

---

## 🔍 调试命令

### 浏览器控制台

```javascript
// 查看订阅状态
console.log('Supabase channels:', supabase.getChannels());

// 手动订阅
const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orderbooks'
  }, payload => console.log('Update:', payload))
  .subscribe(status => console.log('Status:', status));
```

### Supabase SQL Editor

```sql
-- 查看订单簿
SELECT * FROM orderbooks WHERE market_id = 1;

-- 查看订单
SELECT * FROM orders WHERE market_id = 1 ORDER BY created_at DESC LIMIT 10;

-- 查看市场状态
SELECT * FROM market_states WHERE market_id = 1;

-- 查看订单统计
SELECT 
  market_id,
  side,
  status,
  COUNT(*) as count,
  SUM(quantity) as total_quantity
FROM orders
GROUP BY market_id, side, status;
```

---

## 📚 相关文档

- 📖 `Supabase实时订单簿实施指南.md` - 完整实施步骤
- 🧪 `Supabase实时订单簿-测试指南.md` - 测试和验证
- 💡 `LUMI市场Vercel部署分析.md` - 问题分析
- 🚀 `Supabase实时订单簿实施指南.md` - 技术详解

---

## ✨ 核心优势

| 特性 | 原WebSocket | Supabase |
|------|-------------|----------|
| Vercel兼容 | ❌ | ✅ |
| 数据持久化 | ❌ | ✅ |
| 延迟 | 50ms | 300ms |
| 维护成本 | 高 | 零 |
| 扩展性 | 手动 | 自动 |
| 成本 | 服务器费用 | 免费 |

---

## 🎉 就这样！

现在你的LUMI市场拥有：
- ✅ 真正的实时订单簿
- ✅ Vercel完美运行
- ✅ 零维护成本
- ✅ 专业级可靠性

开始交易吧！🚀




















