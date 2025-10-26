# ⚡ Vercel 实时预警功能说明

## 🎯 快速理解

你在 Vercel 上部署后，实时预警功能已经自动适配：

### 本地开发 (npm run dev)
```
✅ WebSocket 实时推送
✅ 自动市场监控 (Binance)
✅ 毫秒级延迟
```

### Vercel 生产环境
```
✅ HTTP 轮询模式
⚠️ 10秒刷新间隔
❌ 无自动市场监控
```

## 🔄 Vercel 上的工作方式

### 1. 自动模式切换
代码会自动检测环境：
```typescript
// 在 Vercel 上自动使用轮询
const isProduction = window.location.hostname !== 'localhost';
```

### 2. 轮询获取警报
每10秒调用一次：
```
GET /api/alerts/latest
→ 返回最近5分钟的警报
```

### 3. 前端显示
警报会显示在右侧实时流中（有10秒延迟）

## 📊 数据来源

### Vercel 上的数据从哪来？

**选项1：预置历史数据**
```bash
# 部署前导入历史事件
cd LUMI/scripts
node import-historical-crashes.js
```

**选项2：手动添加测试数据**
使用 Supabase 或其他数据库服务

**选项3：外部 API 集成**
集成 CoinGecko、CryptoCompare 等

## 🛠️ 添加实时数据的方法

### 方法1：使用外部数据库

**推荐：Supabase（免费）**

1. 创建 Supabase 项目
2. 更新数据库连接
3. 使用 Supabase API 添加警报

```typescript
// 修改 /api/alerts/latest/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export async function GET() {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .order('id', { ascending: false })
    .limit(20)
  
  return NextResponse.json({ success: true, data })
}
```

### 方法2：GitHub Actions Cron

创建 `.github/workflows/market-monitor.yml`:
```yaml
name: Market Monitor
on:
  schedule:
    - cron: '*/5 * * * *'  # 每5分钟

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check BTC Price
        run: |
          # 调用 Binance API
          # 如果有异常，调用你的 Vercel API 添加警报
```

### 方法3：Vercel Cron Jobs (Pro)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/monitor/btc",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

然后创建 `/api/monitor/btc/route.ts`:
```typescript
export async function GET() {
  // 1. 获取 BTC 价格
  const price = await fetchBinancePrice('BTCUSDT')
  
  // 2. 检测异常
  if (/* 异常条件 */) {
    // 3. 写入数据库
    await insertAlert({...})
  }
  
  return NextResponse.json({ success: true })
}
```

## 🎯 最简单的方案（推荐）

### 只展示历史数据

如果你主要是展示系统，不需要实时监控：

1. ✅ 左侧显示21个历史闪崩事件（已有）
2. ✅ TradingView 实时图表（已有）
3. ⚠️ 右侧实时流显示"等待市场数据"

这样已经是一个完整的展示系统了！

### 添加测试数据（演示用）

```bash
# 本地运行，生成测试警报
cd LUMI/scripts
node generate-demo-alerts.js  # 需要创建这个脚本

# 然后推送数据库到 Vercel
```

## 🔍 检查 Vercel 部署

### 打开浏览器控制台
访问 `https://your-app.vercel.app/black-swan`

应该看到：
```
✅ 加载闪崩事件失败: ...  (如果没有历史数据)
✅ 🔄 Vercel 环境：使用轮询模式获取实时警报
✅ 获取最新警报失败: ... (如果数据库为空)
```

这些都是**正常的**！说明轮询模式已启用。

## 💡 推荐配置

### 生产环境最佳实践

**方案A：纯展示**
```
Vercel + 预置历史数据
→ 适合：产品演示、作品集
```

**方案B：轻度实时**
```
Vercel + Supabase + GitHub Actions
→ 适合：低流量应用
```

**方案C：完全实时**
```
Vercel (前端) + Railway (监控服务)
→ 适合：生产应用
```

## 📋 检查清单

部署到 Vercel 后检查：

- [ ] 左侧历史事件列表显示正常
- [ ] TradingView 图表加载
- [ ] 右侧实时流显示（可能为空）
- [ ] 控制台显示轮询模式
- [ ] 没有 WebSocket 连接错误
- [ ] 页面响应正常

## 🎉 总结

**Vercel 上已经可以用！**

虽然不是完全实时（有10秒延迟），但：
- ✅ 历史数据完整
- ✅ 图表实时
- ✅ 界面完美
- ✅ 成本为零

如果需要真正的实时监控，参考 `VERCEL_DEPLOYMENT_GUIDE.md` 中的完整方案。

