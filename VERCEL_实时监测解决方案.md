# 🔧 Vercel 实时监测功能解决方案

## ❌ 为什么部署到 Vercel 后实时监测不可用？

### 核心问题

**Vercel 是 Serverless 架构，有以下限制：**

1. **❌ 不支持 WebSocket 长连接**
   - Vercel Functions 是短暂的，请求结束后立即销毁
   - 无法维持持久的 WebSocket 连接
   - 每个请求都是全新的隔离环境

2. **❌ 无法使用本地 SQLite 数据库**
   - 文件系统是只读的（除了 /tmp）
   - 每次函数调用都是新容器，无法共享数据
   - /tmp 目录在函数执行间会被清空

3. **❌ 无法运行持续的后台监控服务**
   - 没有持续运行的服务器进程
   - 无法运行像 `alert_server.js` 这样的持续监控脚本
   - 所有代码只在接收到 HTTP 请求时执行

### 当前代码的工作方式

**本地开发环境：**
```javascript
✅ WebSocket 实时推送 (ws://localhost:3000/ws/alerts)
✅ SQLite 数据库 (database/alerts.db)
✅ 持续监控服务 (alert_server.js)
→ 毫秒级实时更新
```

**Vercel 生产环境：**
```javascript
⚠️ HTTP 轮询模式 (每10秒一次)
❌ 无 SQLite 数据库
❌ 无监控服务
→ 无实时数据来源
```

---

## ✅ 解决方案

### 方案 1：使用云数据库 + 外部监控服务（推荐）

**架构：**
```
Vercel (前端) + Supabase (数据库) + Railway/Render (监控服务)
```

#### 步骤：

**1. 设置 Supabase 数据库（免费）**

```bash
# 1. 注册 Supabase: https://supabase.com
# 2. 创建新项目
# 3. 在 SQL Editor 中创建表

CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT DEFAULT 'medium',
  details JSONB
);

CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
```

**2. 配置 Vercel 环境变量**

在 Vercel 项目设置中添加：
```
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**3. 部署监控服务到 Railway（免费）**

创建 `monitor-service/index.js`:
```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 每10秒检查一次市场
setInterval(async () => {
      try {
        // 获取 BTC 和 ETH 价格
        const symbols = ['BTCUSDT', 'ETHUSDT'];
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
        );
        
        response.data.forEach(async (ticker) => {
          const priceChange = parseFloat(ticker.priceChangePercent);
          
          // 如果价格变化超过阈值，创建警报
          if (Math.abs(priceChange) > 2) {
            await supabase.from('alerts').insert({
              symbol: ticker.symbol,
              type: 'price_alert',
              message: `${ticker.symbol} 价格变化 ${priceChange.toFixed(2)}%`,
              severity: Math.abs(priceChange) > 5 ? 'critical' : 'high',
              details: {
                price_change: priceChange,
                current_price: ticker.lastPrice
              }
            });
          }
        });
  } catch (error) {
    console.error('监控错误:', error);
  }
}, 10000);

app.listen(3000, () => console.log('监控服务运行中...'));
```

**部署到 Railway：**
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd monitor-service
railway init

# 添加环境变量
railway variables set SUPABASE_URL=...
railway variables set SUPABASE_SERVICE_KEY=...

# 部署
railway up
```

---

### 方案 2：前端直接调用币安 API（最简单）

**不需要后端监控服务，直接从前端获取实时数据**

修改 `app/black-swan/page.tsx`:

```typescript
// 添加实时价格监控
useEffect(() => {
  const monitorPrices = async () => {
    try {
      // 直接调用币安API
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]'
      );
      const data = await response.json();
      
      const newAlerts: RealtimeAlert[] = [];
      
      data.forEach((ticker: any) => {
        const priceChange = parseFloat(ticker.priceChangePercent);
        
        // 如果价格变化显著
        if (Math.abs(priceChange) > 2) {
          newAlerts.push({
            id: `${ticker.symbol}-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('zh-CN'),
            asset: ticker.symbol.replace('USDT', '/USDT'),
            severity: Math.abs(priceChange) > 5 ? 'critical' : 
                     Math.abs(priceChange) > 3 ? 'high' : 'medium',
            message: `24h 价格变化 ${priceChange.toFixed(2)}%`,
            change: priceChange
          });
        }
      });
      
      if (newAlerts.length > 0) {
        setRealtimeData(prev => [...newAlerts, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error('获取价格数据失败:', error);
    }
  };
  
  // 立即执行一次
  monitorPrices();
  
  // 每10秒更新一次
  const interval = setInterval(monitorPrices, 10000);
  
  return () => clearInterval(interval);
}, []);
```

**优点：**
- ✅ 无需额外服务器
- ✅ 完全免费
- ✅ 立即可用
- ✅ 真实的市场数据

**缺点：**
- ⚠️ 受币安API速率限制（但足够用）
- ⚠️ 客户端需要持续轮询

---

### 方案 3：使用 Vercel Cron Jobs（需要 Pro 计划）

如果你有 Vercel Pro 账号，可以使用定时任务：

**1. 修改 `vercel.json`：**

```json
{
  "crons": [
    {
      "path": "/api/monitor/crypto",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

**2. 创建 `app/api/monitor/crypto/route.ts`：**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // 获取币安数据（BTC和ETH）
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]'
    );
    const data = await response.json();
    
    // 写入 Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    for (const ticker of data) {
      const priceChange = parseFloat(ticker.priceChangePercent);
      
      if (Math.abs(priceChange) > 2) {
        await supabase.from('alerts').insert({
          symbol: ticker.symbol,
          type: 'price_alert',
          message: `价格变化 ${priceChange.toFixed(2)}%`,
          severity: Math.abs(priceChange) > 5 ? 'critical' : 'high',
          details: { price_change: priceChange }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const runtime = 'edge';
```

---

### 方案 4：仅展示历史数据（演示用）

如果主要是展示用途，可以：

1. ✅ 保留历史闪崩事件展示
2. ✅ TradingView 图表（已经是实时的）
3. ⚠️ 右侧实时流显示"演示模式"或模拟数据

**添加模拟数据：**

```typescript
// 生成演示警报
useEffect(() => {
  const demoAlerts = [
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      asset: 'BTC/USDT',
      severity: 'high' as const,
      message: '24h 价格下跌 -3.45%',
      change: -3.45
    },
    // ... 更多演示数据
  ];
  
  setRealtimeData(demoAlerts);
}, []);
```

---

## 🎯 推荐选择

### 情况 1：仅用于展示/演示
→ **方案 4（模拟数据）** 或 **方案 2（币安API）**

### 情况 2：实际生产使用
→ **方案 1（Supabase + Railway）**

### 情况 3：有预算
→ **方案 3（Vercel Pro + Cron）**

---

## 🚀 快速实施（方案 2 - 推荐）

我可以立即为你实现方案2，只需修改前端代码，无需任何后端服务：

**优点：**
- ✅ 5分钟内完成
- ✅ 完全免费
- ✅ 显示真实市场数据
- ✅ 无需额外配置

需要我现在就实施吗？

---

## 📊 对比表

| 方案 | 成本 | 实时性 | 复杂度 | 数据持久化 |
|------|------|--------|--------|-----------|
| 方案1 | 免费* | ⭐⭐⭐⭐ | 中等 | ✅ |
| 方案2 | 免费 | ⭐⭐⭐ | 简单 | ❌ |
| 方案3 | $20/月 | ⭐⭐⭐⭐ | 简单 | ✅ |
| 方案4 | 免费 | - | 最简单 | N/A |

*Railway 免费套餐有限制，但足够小项目使用

---

## 📝 总结

**核心问题：** Vercel 的 Serverless 架构不支持 WebSocket 和持久进程

**解决思路：** 
1. 使用云数据库替代 SQLite
2. 使用外部服务或定时任务替代持续监控
3. 或者直接从前端获取实时数据

**最简单的方案：** 前端直接调用币安API（方案2）

