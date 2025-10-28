# 🚀 Supabase实时订单簿实施指南

## 📋 方案概述

**核心思路：**
1. ✅ 订单簿数据存储到Supabase PostgreSQL
2. ✅ 利用Supabase Realtime（基于PostgreSQL的LISTEN/NOTIFY）
3. ✅ 数据库更新时自动推送到所有客户端
4. ✅ 完美兼容Vercel，真正实时（< 1秒延迟）

---

## 🎯 第一步：注册和配置Supabase

### 1. 注册Supabase账号

访问：https://supabase.com

**免费额度：**
- ✅ 500MB 数据库存储
- ✅ 2GB 带宽/月
- ✅ 50万次实时消息/月
- ✅ 无限API请求

### 2. 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - Name: `lumi-market`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域（如 `Singapore`）
3. 等待2-3分钟项目初始化完成

### 3. 获取项目凭证

在项目设置中找到：
- **Project URL**: `https://xxx.supabase.co`
- **anon/public key**: `eyJhbG...` （公开密钥）
- **service_role key**: `eyJhbG...` （服务端密钥，保密）

---

## 🗄️ 第二步：设计数据库表结构

### 1. 订单簿表（orderbooks）

在Supabase SQL Editor中执行：

```sql
-- 创建订单簿表
CREATE TABLE orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引优化
  CONSTRAINT unique_market_orderbook UNIQUE (market_id)
);

-- 创建索引加速查询
CREATE INDEX idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX idx_orderbooks_updated_at ON orderbooks(updated_at DESC);

-- 启用实时功能（关键！）
ALTER TABLE orderbooks REPLICA IDENTITY FULL;

-- 添加注释
COMMENT ON TABLE orderbooks IS '实时订单簿数据';
COMMENT ON COLUMN orderbooks.bids IS '买单列表 [{price, quantity, total}]';
COMMENT ON COLUMN orderbooks.asks IS '卖单列表 [{price, quantity, total}]';
```

### 2. 订单表（orders）

```sql
-- 创建订单表
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price DECIMAL(18, 6) NOT NULL,
  quantity DECIMAL(18, 6) NOT NULL,
  filled_quantity DECIMAL(18, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_orders_market_id ON orders(market_id);
CREATE INDEX idx_orders_user_address ON orders(user_address);
CREATE INDEX idx_orders_status ON orders(status);

-- 启用实时
ALTER TABLE orders REPLICA IDENTITY FULL;
```

### 3. 市场状态表（market_states）

```sql
-- 创建市场状态表
CREATE TABLE market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activating', 'active', 'failed')),
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用实时
ALTER TABLE market_states REPLICA IDENTITY FULL;

COMMENT ON TABLE market_states IS '市场激活状态';
```

### 4. 自动更新时间戳函数

```sql
-- 创建自动更新updated_at的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到各表
CREATE TRIGGER update_orderbooks_updated_at
  BEFORE UPDATE ON orderbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_states_updated_at
  BEFORE UPDATE ON market_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 第三步：安装和配置

### 1. 安装Supabase客户端

```bash
cd e:\project\demo\LUMI
npm install @supabase/supabase-js
```

### 2. 配置环境变量

创建或更新 `.env.local`：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# 服务端使用（用于API路由）
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 3. 创建Supabase客户端工具

创建 `lib/supabase-client.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

// 前端客户端（使用public key）
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 服务端客户端（使用service role key，仅在API路由中使用）
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

---

## 📱 第四步：前端实时订阅

### 1. 创建实时订单簿Hook

创建 `hooks/useOrderBookRealtime.ts`：

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OrderBookData {
  bids: Array<{ price: number; quantity: number; total: number }>;
  asks: Array<{ price: number; quantity: number; total: number }>;
  lastPrice?: number;
  volume24h?: number;
}

interface UseOrderBookRealtimeResult {
  orderBook: OrderBookData | null;
  connected: boolean;
  error: string | null;
  loading: boolean;
}

export function useOrderBookRealtime(marketId: number): UseOrderBookRealtimeResult {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // 获取初始数据
  const fetchInitialData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orderbooks')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有数据，创建空订单簿
          console.log('订单簿不存在，将在首次订单时创建');
          setOrderBook({
            bids: [],
            asks: [],
            lastPrice: undefined,
            volume24h: 0
          });
        } else {
          throw error;
        }
      } else if (data) {
        setOrderBook({
          bids: data.bids || [],
          asks: data.asks || [],
          lastPrice: data.last_price ? parseFloat(data.last_price) : undefined,
          volume24h: data.volume_24h ? parseFloat(data.volume_24h) : 0
        });
      }

      setLoading(false);
    } catch (err: any) {
      console.error('获取订单簿失败:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    // 首次加载数据
    fetchInitialData();

    // 创建实时订阅
    const newChannel = supabase
      .channel(`orderbook:${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有事件（INSERT, UPDATE, DELETE）
          schema: 'public',
          table: 'orderbooks',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          console.log('📊 订单簿实时更新:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new;
            setOrderBook({
              bids: newData.bids || [],
              asks: newData.asks || [],
              lastPrice: newData.last_price ? parseFloat(newData.last_price) : undefined,
              volume24h: newData.volume_24h ? parseFloat(newData.volume_24h) : 0
            });
          } else if (payload.eventType === 'DELETE') {
            // 订单簿被删除
            setOrderBook({
              bids: [],
              asks: [],
              lastPrice: undefined,
              volume24h: 0
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 订阅状态:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          setError(null);
        } else if (status === 'CLOSED') {
          setConnected(false);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
          setError('订阅失败');
        }
      });

    setChannel(newChannel);

    // 清理
    return () => {
      console.log('🔌 取消订阅订单簿');
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [marketId, fetchInitialData]);

  return {
    orderBook,
    connected,
    error,
    loading
  };
}
```

### 2. 创建市场状态实时Hook

创建 `hooks/useMarketStateRealtime.ts`：

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

interface MarketState {
  marketId: number;
  status: 'pending' | 'activating' | 'active' | 'failed';
  interestedCount: number;
  activationThreshold: number;
  message?: string;
}

export function useMarketStateRealtime(marketId: number) {
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInitialState = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('market_states')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 创建初始状态
          const { data: newData } = await supabase
            .from('market_states')
            .insert({
              market_id: marketId,
              status: 'pending',
              interested_count: 0
            })
            .select()
            .single();

          if (newData) {
            setMarketState({
              marketId: newData.market_id,
              status: newData.status,
              interestedCount: newData.interested_count,
              activationThreshold: newData.activation_threshold,
              message: newData.message
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setMarketState({
          marketId: data.market_id,
          status: data.status,
          interestedCount: data.interested_count,
          activationThreshold: data.activation_threshold,
          message: data.message
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('获取市场状态失败:', err);
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchInitialState();

    // 订阅实时更新
    const channel = supabase
      .channel(`market_state:${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_states',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          console.log('🚀 市场状态更新:', payload);
          
          if (payload.new) {
            const data = payload.new;
            setMarketState({
              marketId: data.market_id,
              status: data.status,
              interestedCount: data.interested_count,
              activationThreshold: data.activation_threshold,
              message: data.message
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId, fetchInitialState]);

  return { marketState, loading };
}
```

---

## 🔌 第五步：后端API更新

### 1. 创建订单API

创建 `app/api/orders/create/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, userAddress, side, price, quantity } = body;

    // 1. 创建订单
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        market_id: marketId,
        user_address: userAddress,
        side: side, // 'buy' or 'sell'
        price: price,
        quantity: quantity,
        status: 'open'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. 重新计算订单簿
    const { data: allOrders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('market_id', marketId)
      .eq('status', 'open');

    // 聚合买单
    const bidsMap = new Map<number, number>();
    // 聚合卖单
    const asksMap = new Map<number, number>();

    allOrders?.forEach(order => {
      const price = parseFloat(order.price);
      const qty = parseFloat(order.quantity) - parseFloat(order.filled_quantity);

      if (order.side === 'buy') {
        bidsMap.set(price, (bidsMap.get(price) || 0) + qty);
      } else {
        asksMap.set(price, (asksMap.get(price) || 0) + qty);
      }
    });

    // 转换为数组并排序
    const bids = Array.from(bidsMap.entries())
      .map(([price, quantity]) => ({
        price,
        quantity,
        total: price * quantity
      }))
      .sort((a, b) => b.price - a.price) // 买单降序
      .slice(0, 20); // 只保留前20档

    const asks = Array.from(asksMap.entries())
      .map(([price, quantity]) => ({
        price,
        quantity,
        total: price * quantity
      }))
      .sort((a, b) => a.price - b.price) // 卖单升序
      .slice(0, 20);

    // 3. 更新订单簿（会自动触发实时推送！）
    const { error: updateError } = await supabaseAdmin
      .from('orderbooks')
      .upsert({
        market_id: marketId,
        bids: bids,
        asks: asks,
        last_price: price, // 最新价格
      }, {
        onConflict: 'market_id'
      });

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: {
        order,
        orderBook: { bids, asks }
      }
    });

  } catch (error: any) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
```

### 2. 表达兴趣API

创建 `app/api/markets/[marketId]/interested/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);

    // 1. 获取当前状态
    const { data: currentState } = await supabaseAdmin
      .from('market_states')
      .select('*')
      .eq('market_id', marketId)
      .single();

    const newCount = (currentState?.interested_count || 0) + 1;
    const threshold = currentState?.activation_threshold || 10;

    // 2. 更新兴趣计数
    const { error } = await supabaseAdmin
      .from('market_states')
      .upsert({
        market_id: marketId,
        interested_count: newCount,
        status: newCount >= threshold ? 'activating' : 'pending',
        message: newCount >= threshold 
          ? '正在激活市场...' 
          : `还需要 ${threshold - newCount} 人感兴趣`
      }, {
        onConflict: 'market_id'
      });

    if (error) throw error;

    // 3. 如果达到阈值，启动激活流程
    if (newCount >= threshold && currentState?.status !== 'active') {
      // 这里可以调用区块链合约激活市场
      // 模拟激活延迟
      setTimeout(async () => {
        await supabaseAdmin
          .from('market_states')
          .update({
            status: 'active',
            message: '市场已激活！'
          })
          .eq('market_id', marketId);
      }, 3000);
    }

    return NextResponse.json({
      success: true,
      data: {
        interestedCount: newCount,
        threshold,
        status: newCount >= threshold ? 'activating' : 'pending'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
```

---

## 🎨 第六步：更新前端组件

### 1. 更新市场详情页

修改 `app/market/[marketId]/page.tsx`：

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';
import { useMarketStateRealtime } from '@/hooks/useMarketStateRealtime';

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = parseInt(params.marketId as string);
  
  // 使用实时hooks
  const { orderBook, connected, loading } = useOrderBookRealtime(marketId);
  const { marketState } = useMarketStateRealtime(marketId);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      {/* 连接状态指示器 */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs">{connected ? '实时连接' : '已断开'}</span>
      </div>

      {/* 市场状态 */}
      {marketState && (
        <div className="mb-4">
          <div>状态: {marketState.status}</div>
          <div>感兴趣: {marketState.interestedCount}/{marketState.activationThreshold}</div>
          {marketState.message && <div>{marketState.message}</div>}
        </div>
      )}

      {/* 订单簿 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 买单 */}
        <div>
          <h3>买单 (Bids)</h3>
          {orderBook?.bids.map((bid, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-green-500">${bid.price}</span>
              <span>{bid.quantity}</span>
              <span>${bid.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* 卖单 */}
        <div>
          <h3>卖单 (Asks)</h3>
          {orderBook?.asks.map((ask, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-red-500">${ask.price}</span>
              <span>{ask.quantity}</span>
              <span>${ask.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ 第七步：测试

### 1. 本地测试

```bash
npm run dev
```

访问：http://localhost:3000/market/1

### 2. 测试实时更新

打开两个浏览器窗口：

**窗口1：** 查看订单簿  
**窗口2：** 创建订单

```javascript
// 在浏览器控制台执行
fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    marketId: 1,
    userAddress: '0x123...',
    side: 'buy',
    price: 0.55,
    quantity: 100
  })
})
```

**预期结果：** 窗口1的订单簿应该在1秒内自动更新！✅

---

## 🚀 第八步：部署到Vercel

### 1. 设置Vercel环境变量

在Vercel项目设置中添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 2. 部署

```bash
git add .
git commit -m "feat: 集成Supabase实时订单簿"
git push
```

### 3. 验证

访问生产环境URL，测试实时功能是否正常。

---

## 📊 数据流示意图

```
┌──────────────┐
│  用户A创建订单  │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ API: /api/orders/create │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  更新Supabase数据库    │  ← 插入order记录
│  - orders表          │  ← 更新orderbooks表
└──────┬───────────────┘
       │
       ↓ 自动触发 (PostgreSQL NOTIFY)
       │
┌──────────────────────┐
│ Supabase Realtime    │
│ 推送到所有订阅客户端    │
└──────┬───────────────┘
       │
       ├─→ 用户A的浏览器 (订单簿更新)
       ├─→ 用户B的浏览器 (订单簿更新)
       └─→ 用户C的浏览器 (订单簿更新)
```

**延迟：< 500ms** ⚡

---

## 🎯 优势总结

### vs 原有WebSocket方案

| 特性 | WebSocket (原方案) | Supabase Realtime |
|------|-------------------|-------------------|
| Vercel兼容 | ❌ 不兼容 | ✅ 完全兼容 |
| 数据持久化 | ❌ 内存 | ✅ 数据库 |
| 延迟 | ~50ms | ~300ms |
| 扩展性 | ⚠️ 需手动管理 | ✅ 自动扩展 |
| 成本 | 需服务器 | 免费额度充足 |
| 可靠性 | ⚠️ 需自己维护 | ✅ 专业服务 |

---

## 💡 常见问题

### Q1: 订单簿数据一直存在数据库会不会太多？

**A:** 可以定期清理：

```sql
-- 创建清理函数
CREATE OR REPLACE FUNCTION cleanup_old_orders()
RETURNS void AS $$
BEGIN
  DELETE FROM orders 
  WHERE status IN ('filled', 'cancelled') 
  AND updated_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 设置定时任务（在Supabase Dashboard的Database > Extensions启用pg_cron）
SELECT cron.schedule(
  'cleanup-orders',
  '0 2 * * *', -- 每天凌晨2点
  'SELECT cleanup_old_orders()'
);
```

### Q2: 免费额度够用吗？

**A:** 对于中小型应用完全够用：
- 500MB 数据库 ≈ 数百万条订单记录
- 50万次实时消息/月 ≈ 每秒19次更新

### Q3: 如何监控使用量？

**A:** 在Supabase Dashboard查看：
- Database → Usage
- Realtime → Usage
- 接近限制会收到邮件提醒

---

## 🎉 完成！

现在你的LUMI市场：
- ✅ 在Vercel上完美运行
- ✅ 真正的实时更新（< 1秒）
- ✅ 数据持久化存储
- ✅ 完全免费（免费额度）
- ✅ 自动扩展，无需维护

需要我帮你实施吗？我可以立即开始创建这些文件！🚀









