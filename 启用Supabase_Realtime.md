# ✅ 启用 Supabase Realtime - 2分钟

---

## 📋 第 1 步：启用 Realtime

1. 打开 **Supabase Dashboard**: https://supabase.com/dashboard
2. 选择您的项目
3. 左侧菜单点击 **"Database"**
4. 点击 **"Replication"** 标签
5. 找到 **"orderbooks"** 表
6. 点击右侧的开关，启用 Realtime ✅
7. 对 **"orders"** 表也做同样操作 ✅
8. 对 **"market_states"** 表也做同样操作 ✅

---

## 📋 第 2 步：验证配置

### 检查 Supabase 客户端

确认 `lib/supabase-client.ts` 或类似文件存在并配置正确：

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10  // 可选：限制事件频率
      }
    }
  }
);
```

---

## 🎯 使用示例

### 1. 市场详情页（实时价格）

```typescript
// app/market/[marketId]/page.tsx
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';

export default function MarketDetailPage({ params }) {
  const marketId = params.marketId;
  
  // ✅ 使用 Supabase Realtime
  const { orderBook, connected, loading } = useOrderBookRealtime(marketId);
  
  // 计算价格
  const price = orderBook ? {
    bestBid: orderBook.bids[0]?.price || 0,
    bestAsk: orderBook.asks[0]?.price || 0,
    midPrice: orderBook.bids[0] && orderBook.asks[0]
      ? (orderBook.bids[0].price + orderBook.asks[0].price) / 2
      : 0.5
  } : null;
  
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>市场详情</h1>
        {connected ? (
          <span className="text-green-500">🟢 实时</span>
        ) : (
          <span className="text-gray-400">⚪ 离线</span>
        )}
      </div>
      
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div>
          <p>YES: {(price?.midPrice * 100).toFixed(1)}%</p>
          <p>最佳买价: ${price?.bestBid}</p>
          <p>最佳卖价: ${price?.bestAsk}</p>
        </div>
      )}
    </div>
  );
}
```

---

### 2. 市场列表页（批量实时）

```typescript
// app/markets/[category]/page.tsx
import { useMultipleOrderBooks } from '@/hooks/useOrderBookRealtime';

export default function MarketCategoryPage() {
  const { markets } = useMarketsByCategory(category);
  const marketIds = markets.map(m => m.id);
  
  // ✅ 批量订阅多个市场
  const { orderBooks, connected } = useMultipleOrderBooks(marketIds);
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h1>市场列表</h1>
        {connected && <span className="text-green-500">🟢 实时更新</span>}
      </div>
      
      {markets.map(market => {
        const orderBook = orderBooks.get(market.id);
        const price = orderBook?.bids[0] && orderBook?.asks[0]
          ? (orderBook.bids[0].price + orderBook.asks[0].price) / 2
          : market.probability / 100;
        
        return (
          <MarketCard
            key={market.id}
            market={market}
            price={price}
            realtime={!!orderBook}
          />
        );
      })}
    </div>
  );
}
```

---

## 🔄 数据流程

```
用户下单
  ↓
订单存入 Supabase (orders 表)
  ↓
触发器更新 orderbooks 表
  ↓
Supabase Realtime 自动推送 ✅
  ↓
前端 Hook 接收更新
  ↓
页面显示新价格

延迟: < 500ms ⚡
```

---

## ⚡ 性能对比

| 方案 | 延迟 | Vercel兼容 | 费用 | 维护 |
|------|------|-----------|------|------|
| **Supabase Realtime** | < 500ms | ✅ | 免费 | 无需维护 |
| 外部 WebSocket | < 100ms | ❌ | $5/月 | 需要维护 |
| 轮询 | 5-15秒 | ✅ | 免费 | 无需维护 |

---

## 🎯 立即测试

### 测试代码

在任意页面添加：

```typescript
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';

const TestComponent = () => {
  const { orderBook, connected, loading } = useOrderBookRealtime(1);
  
  return (
    <div className="p-4 bg-gray-100">
      <p>连接状态: {connected ? '🟢 已连接' : '⚪ 未连接'}</p>
      <p>加载状态: {loading ? '加载中...' : '完成'}</p>
      <pre>{JSON.stringify(orderBook, null, 2)}</pre>
    </div>
  );
};
```

---

## ✅ 检查清单

在 Supabase Dashboard 中确认：

- [ ] Database → Replication → orderbooks 表已启用 Realtime
- [ ] Database → Replication → orders 表已启用 Realtime  
- [ ] Database → Replication → market_states 表已启用 Realtime
- [ ] 环境变量 `NEXT_PUBLIC_SUPABASE_URL` 已设置
- [ ] 环境变量 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已设置

---

## 🐛 故障排查

### 问题 1: 订阅失败

检查浏览器控制台，如果看到 CORS 错误：

1. Supabase → Authentication → URL Configuration
2. 添加您的域名到 "Site URL" 和 "Redirect URLs"

### 问题 2: 没有收到更新

1. 确认表的 Realtime 已启用
2. 检查表是否有 RLS (Row Level Security) 策略
3. 如果有 RLS，需要添加策略允许读取

```sql
-- 在 Supabase SQL Editor 执行
ALTER TABLE orderbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON orderbooks FOR SELECT 
USING (true);
```

---

**现在去 Supabase Dashboard 启用 Realtime 吧！** 🚀



