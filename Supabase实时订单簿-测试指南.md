# 🧪 Supabase实时订单簿 - 测试指南

## ✅ 已完成的工作

### 1. 安装和配置
- ✅ 安装 `@supabase/supabase-js`
- ✅ 更新 `lib/supabase-client.ts`
- ✅ 创建数据库表SQL脚本

### 2. 实时Hooks
- ✅ `hooks/useOrderBookRealtime.ts` - 订单簿实时Hook
- ✅ `hooks/useMarketStateRealtime.ts` - 市场状态实时Hook

### 3. API路由
- ✅ `app/api/orders/create-realtime/route.ts` - 创建订单
- ✅ `app/api/markets/[marketId]/interested-realtime/route.ts` - 表达兴趣

### 4. 数据库表
- ✅ `orderbooks` - 订单簿表
- ✅ `orders` - 订单记录表
- ✅ `market_states` - 市场状态表

---

## 📝 第一步：在Supabase中创建表

### 1. 登录Supabase

访问：https://supabase.com  
登录你的账号

### 2. 打开SQL Editor

在你的项目中：
1. 点击左侧菜单 "SQL Editor"
2. 点击 "New query"

### 3. 执行SQL脚本

复制 `scripts/supabase-orderbook-schema.sql` 的内容  
粘贴到SQL Editor  
点击 "Run" 按钮

**预期输出：**
```
✅ 订单簿数据库表创建成功！
✅ 实时功能已启用！
✅ 可以开始使用订单簿功能了！
```

### 4. 验证表创建

在左侧菜单点击 "Table Editor"，应该看到：
- ✅ orderbooks (1 row)
- ✅ orders (0 rows)
- ✅ market_states (1 row)

---

## 🔧 第二步：配置环境变量

### 1. 获取Supabase凭证

在Supabase项目中：
1. 点击左侧菜单 "Settings" (齿轮图标)
2. 点击 "API"
3. 找到以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbG...`
   - **service_role key**: `eyJhbG...` (点击眼睛图标显示)

### 2. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# 服务端密钥（用于API路由）
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

**⚠️ 重要：** `service_role key` 有完全权限，不要泄露！

### 3. 更新Vercel环境变量

在Vercel项目设置中添加同样的环境变量：
1. 进入项目 Settings → Environment Variables
2. 添加上述3个变量
3. 选择 Production, Preview, Development 环境
4. 保存

---

## 🧪 第三步：本地测试

### 1. 启动开发服务器

```bash
cd e:\project\demo\LUMI
npm run dev
```

### 2. 测试订单簿实时更新

#### 方法1：使用浏览器控制台

1. 打开浏览器，访问：`http://localhost:3000`

2. 打开浏览器开发者工具 (F12)

3. 切换到 Console 标签

4. 执行以下代码创建测试订单：

```javascript
// 创建买单
fetch('/api/orders/create-realtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    marketId: 1,
    userAddress: '0x1234567890abcdef',
    side: 'buy',
    price: 0.55,
    quantity: 100
  })
})
.then(res => res.json())
.then(data => console.log('✅ 订单创建成功:', data))
.catch(err => console.error('❌ 创建失败:', err));
```

```javascript
// 创建卖单
fetch('/api/orders/create-realtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    marketId: 1,
    userAddress: '0x1234567890abcdef',
    side: 'sell',
    price: 0.57,
    quantity: 150
  })
})
.then(res => res.json())
.then(data => console.log('✅ 订单创建成功:', data));
```

#### 方法2：创建测试页面

创建 `app/test-orderbook-realtime/page.tsx`：

```typescript
'use client';

import { useState } from 'react';
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';
import { useMarketStateRealtime } from '@/hooks/useMarketStateRealtime';

export default function TestOrderBookPage() {
  const [marketId, setMarketId] = useState(1);
  const { orderBook, connected, loading } = useOrderBookRealtime(marketId);
  const { marketState } = useMarketStateRealtime(marketId);
  const [creating, setCreating] = useState(false);

  // 创建测试订单
  const createTestOrder = async (side: 'buy' | 'sell') => {
    setCreating(true);
    try {
      const price = side === 'buy' ? 0.55 : 0.57;
      const quantity = Math.floor(Math.random() * 200) + 50;

      const response = await fetch('/api/orders/create-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId,
          userAddress: `0x${Math.random().toString(16).slice(2, 10)}`,
          side,
          price,
          quantity
        })
      });

      const result = await response.json();
      console.log('订单创建结果:', result);
      alert(result.success ? '✅ 订单创建成功！' : '❌ 创建失败: ' + result.error);
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('❌ 创建订单失败');
    } finally {
      setCreating(false);
    }
  };

  // 表达兴趣
  const expressInterest = async () => {
    try {
      const response = await fetch(`/api/markets/${marketId}/interested-realtime`, {
        method: 'POST'
      });

      const result = await response.json();
      console.log('表达兴趣结果:', result);
      alert(result.success ? '✅ 已记录兴趣！' : '❌ 失败: ' + result.error);
    } catch (error) {
      console.error('表达兴趣失败:', error);
    }
  };

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">📊 实时订单簿测试</h1>

      {/* 连接状态 */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{connected ? '🟢 实时连接' : '🔴 已断开'}</span>
        </div>
        <span className="text-gray-400">Market ID: {marketId}</span>
      </div>

      {/* 市场状态 */}
      {marketState && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">市场状态</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>状态: <span className="text-yellow-400">{marketState.status}</span></div>
            <div>感兴趣: <span className="text-cyan-400">{marketState.interestedCount}/{marketState.activationThreshold}</span></div>
            {marketState.message && <div className="col-span-2 text-gray-300">消息: {marketState.message}</div>}
          </div>
          <button
            onClick={expressInterest}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            表达兴趣 (+1)
          </button>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => createTestOrder('buy')}
          disabled={creating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
        >
          创建买单 (Buy)
        </button>
        <button
          onClick={() => createTestOrder('sell')}
          disabled={creating}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold disabled:opacity-50"
        >
          创建卖单 (Sell)
        </button>
      </div>

      {/* 订单簿 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 买单 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4 text-green-400">买单 (Bids)</h2>
          {orderBook && orderBook.bids.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2">
                <div>价格</div>
                <div>数量</div>
                <div>总额</div>
              </div>
              {orderBook.bids.map((bid, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-green-400 font-mono">${bid.price.toFixed(2)}</div>
                  <div className="font-mono">{bid.quantity.toFixed(2)}</div>
                  <div className="font-mono text-gray-300">${bid.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">暂无买单</div>
          )}
        </div>

        {/* 卖单 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4 text-red-400">卖单 (Asks)</h2>
          {orderBook && orderBook.asks.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2">
                <div>价格</div>
                <div>数量</div>
                <div>总额</div>
              </div>
              {orderBook.asks.map((ask, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-red-400 font-mono">${ask.price.toFixed(2)}</div>
                  <div className="font-mono">{ask.quantity.toFixed(2)}</div>
                  <div className="font-mono text-gray-300">${ask.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">暂无卖单</div>
          )}
        </div>
      </div>

      {/* 最新价格 */}
      {orderBook?.lastPrice && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
          <div className="text-gray-400 text-sm mb-1">最新成交价</div>
          <div className="text-3xl font-bold text-yellow-400">${orderBook.lastPrice.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
```

3. 访问测试页面：`http://localhost:3000/test-orderbook-realtime`

4. 点击按钮创建订单，观察订单簿实时更新！

### 3. 测试多窗口同步

1. 打开两个浏览器窗口，都访问测试页面
2. 在窗口1点击"创建买单"
3. **观察窗口2的订单簿是否自动更新** ✨

**预期结果：**
- ✅ 窗口2在1秒内自动更新
- ✅ 控制台显示 "📊 订单簿实时更新"
- ✅ 买单列表增加一条记录

---

## 🚀 第四步：部署到Vercel

### 1. 提交代码

```bash
git add .
git commit -m "feat: 集成Supabase实时订单簿系统"
git push
```

### 2. 配置Vercel环境变量

确保在Vercel项目设置中已添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. 等待自动部署

Vercel会自动部署，等待完成

### 4. 测试生产环境

访问：`https://your-app.vercel.app/test-orderbook-realtime`

重复上述测试步骤，确认在Vercel上也能正常工作

---

## ✅ 验收标准

### 基本功能
- [ ] 表创建成功（在Supabase Table Editor中可见）
- [ ] 本地开发服务器启动成功
- [ ] 测试页面加载成功
- [ ] 显示"🟢 实时连接"状态

### 实时功能
- [ ] 创建订单后订单簿立即更新（< 1秒）
- [ ] 多窗口同步更新
- [ ] 控制台显示实时更新日志
- [ ] Vercel生产环境也能正常工作

### 市场状态
- [ ] 表达兴趣功能正常
- [ ] 达到阈值时状态变为"activating"
- [ ] 3秒后状态变为"active"
- [ ] 状态更新实时推送到所有客户端

---

## 🐛 故障排除

### 问题1：连接显示"🔴 已断开"

**可能原因：**
- Supabase URL或Key配置错误
- 表未启用实时功能

**解决方法：**
```sql
-- 在Supabase SQL Editor中重新执行
ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;
```

### 问题2：订单创建成功但订单簿不更新

**检查：**
1. 打开浏览器控制台，查看是否有错误
2. 检查Supabase日志（Logs → Database）
3. 确认`orderbooks`表有数据

**解决方法：**
```javascript
// 在控制台执行，手动触发刷新
window.location.reload();
```

### 问题3：Vercel上不工作

**检查：**
1. 环境变量是否正确配置
2. `SUPABASE_SERVICE_ROLE_KEY`是否设置
3. Vercel日志是否有错误

---

## 📊 监控和调试

### Supabase Dashboard

**查看实时连接：**
1. Supabase Dashboard → Reports
2. 查看 Real-time connections 图表

**查看数据库使用量：**
1. Settings → Usage
2. 查看Database、Real-time使用情况

### 浏览器控制台

**查看实时日志：**
```
📡 订阅实时订单簿: orderbook:1
✅ 成功订阅实时订单簿
📊 订单簿实时更新: {eventType: "UPDATE", new: {...}}
```

---

## 🎉 完成！

如果所有测试都通过，恭喜你！🎊

你的LUMI市场现在：
- ✅ 使用Supabase实时订单簿
- ✅ 在Vercel上完美运行
- ✅ 真正的实时更新（< 1秒）
- ✅ 数据持久化存储
- ✅ 完全免费（免费额度）

---

## 📝 下一步

### 可选优化

1. **添加订单撮合逻辑**
   - 当买卖价格匹配时自动成交

2. **添加价格图表**
   - 使用TradingView轻量级图表

3. **添加用户订单管理**
   - 查看/取消自己的订单

4. **添加实时通知**
   - 订单成交时浏览器通知

需要我帮你实现这些功能吗？
















