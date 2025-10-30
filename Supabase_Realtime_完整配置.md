# ✅ Supabase Realtime 完整配置指南

> 您的代码已经集成好了！只需要在 Supabase 启用即可

---

## 🎯 快速启用（2分钟）

### 第 1 步：启用表的 Realtime

1. 打开 **Supabase Dashboard**: https://supabase.com/dashboard
2. 选择您的项目
3. 左侧菜单 → **Database** → **Replication**
4. 找到以下表，点击右侧开关启用：
   - ✅ **orderbooks** （订单簿）
   - ✅ **orders** （订单）
   - ✅ **market_states** （市场状态）
   - ✅ **markets** （市场列表）

---

### 第 2 步：配置 RLS 策略（如果表启用了 RLS）

在 Supabase SQL Editor 执行：

```sql
-- 允许公开读取订单簿
CREATE POLICY "Allow public read orderbooks" 
ON orderbooks FOR SELECT 
USING (true);

-- 允许公开读取订单
CREATE POLICY "Allow public read orders" 
ON orders FOR SELECT 
USING (true);

-- 允许公开读取市场状态
CREATE POLICY "Allow public read market_states" 
ON market_states FOR SELECT 
USING (true);
```

---

### 第 3 步：测试 Realtime

访问测试页面：
```
http://localhost:3000/test-realtime
```

应该看到：
- 🟢 订单簿 Realtime: 已连接 ✅
- 实时订单簿数据
- 实时市场状态

---

## 💻 使用示例

### 1. 市场详情页（单个市场）

```typescript
// app/market/[marketId]/page.tsx
'use client';

import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';

export default function MarketDetailPage({ params }) {
  const { orderBook, connected } = useOrderBookRealtime(params.marketId);
  
  // 计算实时价格
  const price = orderBook && orderBook.bids[0] && orderBook.asks[0]
    ? (parseFloat(orderBook.bids[0].price) + parseFloat(orderBook.asks[0].price)) / 2
    : 0.5;
  
  const probability = (price * 100).toFixed(1);
  
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>市场详情</h1>
        {connected ? (
          <span className="text-green-500 text-sm">🟢 实时更新</span>
        ) : (
          <span className="text-gray-400 text-sm">⚪ 离线</span>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-3xl font-bold">
          YES: {probability}%
        </div>
        <div className="text-sm text-gray-600 mt-1">
          买价: ${orderBook?.bids[0]?.price || '-'} | 
          卖价: ${orderBook?.asks[0]?.price || '-'}
        </div>
      </div>
    </div>
  );
}
```

---

### 2. 市场列表页（多个市场）

```typescript
// app/markets/page.tsx
'use client';

import { useMultipleOrderBooks } from '@/hooks/useOrderBookRealtime';
import { useMarkets } from '@/hooks/useMarkets';

export default function MarketsPage() {
  const { markets } = useMarkets();
  const marketIds = markets.map(m => m.id);
  
  // ✅ 批量订阅所有市场
  const { orderBooks, connected } = useMultipleOrderBooks(marketIds);
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1>市场列表</h1>
        {connected && (
          <span className="text-green-500 text-sm">🟢 实时价格</span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {markets.map(market => {
          const orderBook = orderBooks.get(market.id);
          
          // 实时价格
          const price = orderBook?.bids[0] && orderBook?.asks[0]
            ? (parseFloat(orderBook.bids[0].price) + parseFloat(orderBook.asks[0].price)) / 2
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
    </div>
  );
}
```

---

## 🔄 完整的数据流程

```
用户下单
  ↓
保存到 Supabase (orders 表)
  ↓
触发器/函数更新 orderbooks 表
  ↓
Supabase Realtime 自动推送 ⚡
  ↓
useOrderBookRealtime Hook 接收
  ↓
React State 更新
  ↓
页面自动重新渲染

总延迟: < 500ms ✅
```

---

## ⚡ 性能优势

| 对比项 | WebSocket 服务器 | Supabase Realtime |
|--------|-----------------|-------------------|
| **部署复杂度** | 需要外部服务器 | 无需部署 |
| **Vercel 兼容** | ❌ 不支持 | ✅ 完美支持 |
| **维护成本** | 需要维护 | 零维护 |
| **费用** | $5/月 | 完全免费 |
| **延迟** | 50-100ms | 200-500ms |
| **稳定性** | 需要监控 | Supabase 保证 |

---

## ✅ 已有的 Hook（直接使用）

### 1. 单个市场订单簿
```typescript
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';

const { orderBook, connected, loading, error, refresh } = useOrderBookRealtime(marketId);
```

### 2. 多个市场订单簿
```typescript
import { useMultipleOrderBooks } from '@/hooks/useOrderBookRealtime';

const { orderBooks, connected, loading } = useMultipleOrderBooks([1, 2, 3]);
```

### 3. 市场状态
```typescript
import { useMarketStateRealtime } from '@/hooks/useMarketStateRealtime';

const { marketState, loading } = useMarketStateRealtime(marketId);
```

---

## 🐛 故障排查

### 1. 连接失败

**检查 Supabase 项目设置**:
- Authentication → URL Configuration
- 确保您的域名在 "Site URL" 中

### 2. 没有收到更新

**检查 Realtime 是否启用**:
- Database → Replication
- 确保表旁边的开关是绿色的

### 3. 权限错误

**检查 RLS 策略**:
```sql
-- 查看当前策略
SELECT * FROM pg_policies WHERE tablename = 'orderbooks';

-- 如果没有策略，添加一个
CREATE POLICY "Allow public read" ON orderbooks FOR SELECT USING (true);
```

---

## 📊 监控 Realtime

### Supabase Dashboard

1. 项目 → **Settings** → **API**
2. 查看 **Realtime** 部分
3. 可以看到：
   - 当前连接数
   - 消息数量
   - 带宽使用

---

## 🎯 下一步

1. ✅ 访问 https://supabase.com 启用 Realtime
2. ✅ 访问 http://localhost:3000/test-realtime 测试
3. ✅ 在实际页面中使用 Hook

---

**立即测试**: http://localhost:3000/test-realtime  
**文档**: `启用Supabase_Realtime.md`



