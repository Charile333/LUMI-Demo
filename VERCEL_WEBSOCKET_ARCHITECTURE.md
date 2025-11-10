# 🚀 Vercel 部署 WebSocket 架构说明

## 📋 核心问题

**问题**：Vercel 不支持 WebSocket，为什么代码中使用了 WebSocket 实时同步？

**答案**：我们使用的是 **Supabase Realtime**，这是一个托管的 WebSocket 服务，**完美兼容 Vercel**！

## 🎯 架构对比

### ❌ 不兼容 Vercel 的架构（我们没有使用）

```
浏览器 (客户端)
    ↓ WebSocket 连接
Vercel Serverless Function (Node.js WebSocket 服务器) ❌ 不支持！
    ↓
PostgreSQL 数据库
```

**为什么不行**：
- Vercel Serverless Functions 不支持长连接
- 函数最多执行 10-60 秒
- 函数执行完就会关闭连接

### ✅ 兼容 Vercel 的架构（我们使用的）

```
浏览器 (客户端)
    ↓ Supabase Client SDK
    ↓ WebSocket 直连（不经过 Vercel！）
Supabase Realtime 服务器 (托管在 Supabase)
    ↓
PostgreSQL (Supabase)
```

**为什么可行**：
- ✅ WebSocket 服务器运行在 Supabase（不在 Vercel）
- ✅ 浏览器直接连接到 Supabase Realtime
- ✅ Vercel 只负责提供静态页面和 API 路由
- ✅ 完全无需 Vercel 处理 WebSocket 长连接

## 🔍 代码证明

### hooks/useOrderBookRealtime.ts

```typescript
/**
 * 实时订单簿Hook - 使用Supabase Realtime
 * 替代原有的WebSocket方案，完美兼容Vercel  ← 注意这行！
 */

// 1. 导入 Supabase 客户端（托管服务）
import { getSupabase } from '@/lib/supabase-client';
const supabase = getSupabase();

// 2. 创建 Realtime 订阅（直连到 Supabase）
const newChannel = supabase
  .channel(channelName)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orderbooks',
    filter: `market_id=eq.${marketId}`
  }, (payload) => {
    // 实时接收更新
    console.log('📊 订单簿实时更新:', payload);
  })
  .subscribe();
```

### 连接流程

```typescript
// 浏览器中运行（客户端代码）
const supabase = createClient(
  'https://your-project.supabase.co',  // ← Supabase 服务器地址
  'your-anon-key'
);

// WebSocket 连接直接建立到 Supabase
// wss://your-project.supabase.co/realtime/v1/websocket
```

## 📊 完整数据流

### 部署在 Vercel 的组件

```
Vercel Edge Network
├── Next.js 静态页面 ✅
│   └── React 组件 (客户端代码)
│
└── API Routes (Serverless Functions) ✅
    ├── /api/orders/create
    ├── /api/orders/book
    └── /api/markets/...
```

**特点**：
- ✅ 无状态 Serverless Functions
- ✅ 短期运行（每次请求 < 10秒）
- ✅ 无需长连接

### 托管在 Supabase 的服务

```
Supabase Infrastructure
├── PostgreSQL Database ✅
├── Realtime Server (WebSocket) ✅
├── Authentication ✅
└── Storage ✅
```

**特点**：
- ✅ 24/7 运行
- ✅ 支持长连接 WebSocket
- ✅ 自动扩展

## 🔄 实时更新流程

### 1. 用户创建订单

```
浏览器
  ↓ HTTP POST
Vercel API Route (/api/orders/create)
  ↓ SQL INSERT
Supabase PostgreSQL
  ↓ 触发
PostgreSQL Triggers
  ↓ 通知
Supabase Realtime
  ↓ WebSocket 推送
所有订阅的浏览器客户端
```

### 2. 订单簿更新

```typescript
// 步骤 1：用户提交订单（经过 Vercel）
await fetch('/api/orders/create', {
  method: 'POST',
  body: JSON.stringify(order)
});

// 步骤 2：API 写入数据库
await supabase
  .from('orders')
  .insert(orderData);

// 步骤 3：数据库触发器更新订单簿
// (在 Supabase PostgreSQL 中自动执行)

// 步骤 4：Supabase Realtime 推送更新
// (通过 WebSocket，不经过 Vercel)

// 步骤 5：浏览器接收更新（直连 Supabase）
supabase
  .channel('orderbook:123')
  .on('postgres_changes', ..., (payload) => {
    // 🔥 实时收到更新！
    updateUI(payload.new);
  });
```

## 🎯 Vercel 部署配置

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "DATABASE_URL": "@database_url"
  }
}
```

**关键点**：
- ✅ 不需要配置 WebSocket
- ✅ 不需要持久化连接
- ✅ Serverless Functions 只处理短期请求

### 环境变量

```bash
# Vercel 环境变量配置

# Supabase 公开配置（客户端使用）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# 后端数据库连接（Serverless Functions 使用）
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# 服务端密钥（特权操作使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 🔒 安全性

### 1. Row Level Security (RLS)

```sql
-- 用户只能看到自己的订单
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT USING (
    user_address = auth.jwt()->>'wallet_address'
    OR auth.role() = 'service_role'
  );
```

### 2. Realtime 订阅权限

```typescript
// 订单簿是公开的（只读）
supabase
  .channel('orderbook:123')
  .on('postgres_changes', {
    schema: 'public',
    table: 'orderbooks' // ✅ 公开订阅
  }, callback);

// 用户订单是私有的（需要 RLS）
supabase
  .channel('user_orders')
  .on('postgres_changes', {
    schema: 'public',
    table: 'orders' // ✅ RLS 自动过滤
  }, callback);
```

## 📈 性能优势

### 传统 WebSocket（需要自托管）

```
❌ 需要维护 WebSocket 服务器
❌ 需要处理连接管理、重连、心跳
❌ 需要处理横向扩展
❌ 需要处理负载均衡
❌ 不兼容 Vercel Serverless
```

### Supabase Realtime（托管服务）

```
✅ 完全托管，无需维护
✅ 自动处理连接管理
✅ 自动扩展
✅ 全球 CDN
✅ 完美兼容 Vercel
✅ 内置权限控制 (RLS)
```

## 🚀 部署步骤

### 1. 准备 Supabase 项目

```bash
1. 创建 Supabase 项目
2. 执行数据库迁移脚本
3. 启用 Realtime 功能
4. 配置 RLS 策略
```

### 2. 部署到 Vercel

```bash
# 连接 GitHub 仓库
vercel --prod

# 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DATABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 部署
vercel --prod
```

### 3. 验证 Realtime 连接

```bash
# 访问部署的网站
# 打开浏览器控制台，应该看到：
✅ 成功订阅实时订单簿
📡 订阅状态 [orderbook:1]: SUBSCRIBED
```

## 🐛 故障排查

### WebSocket 连接失败

**检查项**：
1. ✅ Supabase URL 是否正确
2. ✅ Supabase Anon Key 是否正确
3. ✅ Supabase 项目是否处于活跃状态
4. ✅ 浏览器是否阻止了 WebSocket
5. ✅ 防火墙是否允许 WebSocket

### Vercel 函数超时

**原因**：不是 WebSocket 的问题，是数据库查询慢

**解决**：
- 优化数据库查询
- 添加索引
- 使用查询超时控制

## 💡 最佳实践

### 1. 客户端代码（运行在浏览器）

```typescript
'use client'; // Next.js 客户端组件

import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';

export function MarketCard() {
  // ✅ 浏览器直连 Supabase Realtime
  const { orderBook, connected } = useOrderBookRealtime(marketId);
  
  return (
    <div>
      {connected ? '🟢 实时连接' : '🔴 离线'}
      价格: ${orderBook?.lastPrice}
    </div>
  );
}
```

### 2. 服务端代码（Vercel Serverless）

```typescript
// app/api/orders/create/route.ts

import { db } from '@/lib/db';

export async function POST(request: Request) {
  // ✅ 短期 HTTP 请求，无需 WebSocket
  const order = await request.json();
  
  // 写入数据库
  await db.query('INSERT INTO orders ...');
  
  // Supabase Realtime 会自动推送更新到订阅的客户端
  
  return Response.json({ success: true });
}
```

## 📚 相关资源

- [Supabase Realtime 文档](https://supabase.com/docs/guides/realtime)
- [Vercel Serverless Functions 限制](https://vercel.com/docs/functions/serverless-functions/runtimes)
- [Next.js 部署到 Vercel](https://nextjs.org/docs/deployment)

## ✅ 总结

**问题**：Vercel 不支持 WebSocket

**解决方案**：
1. ✅ 使用 Supabase Realtime（托管 WebSocket 服务）
2. ✅ 浏览器直连 Supabase（不经过 Vercel）
3. ✅ Vercel 只处理无状态 API 请求
4. ✅ 完美兼容，零配置

**架构优势**：
- 🚀 实时更新（<100ms 延迟）
- 🎯 完全托管，无需维护
- 💰 按使用付费，无固定成本
- 🔒 内置安全性（RLS）
- 🌍 全球分布
- ✅ 100% 兼容 Vercel

---

**总结**：我们用的是 Supabase 的托管 WebSocket 服务，完全不需要 Vercel 支持 WebSocket！🎉

