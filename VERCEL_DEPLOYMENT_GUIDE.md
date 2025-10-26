# 🚀 Vercel 部署指南 - 黑天鹅预警系统

## ⚠️ Vercel 环境限制

Vercel 是**无服务器（Serverless）**平台，有以下限制：

### ❌ 不支持的功能
1. **自定义服务器** - `server-with-websocket.js` 不能使用
2. **持久 WebSocket** - 长连接不支持
3. **后台进程** - 市场监控脚本不能运行
4. **函数执行时间** - 免费版10秒，Pro版60秒

### ✅ 已实现的解决方案

我们已经为 Vercel 部署做了适配：

## 🔧 技术方案

### 1. 轮询替代 WebSocket
**本地开发**：使用 WebSocket 实时推送
**Vercel 生产**：使用轮询（每10秒刷新一次）

```typescript
// 自动检测环境
const isProduction = process.env.NODE_ENV === 'production' 
  && !window.location.hostname.includes('localhost');

if (isProduction) {
  // 使用轮询
  setInterval(fetchAlerts, 10000);
} else {
  // 使用 WebSocket
  connectWebSocket();
}
```

### 2. 新增 API 端点
**`/api/alerts/latest`** - 获取最近5分钟的实时警报

```typescript
GET /api/alerts/latest

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "symbol": "BTCUSDT",
      "message": "BTC 上涨 2.5%",
      "timestamp": "2025-10-26T...",
      "severity": "high"
    }
  ]
}
```

## 📊 工作模式对比

### 本地开发模式
```
Binance WebSocket → 市场监控 → 数据库 → WebSocket → 前端
                                             (实时推送)
```

### Vercel 生产模式
```
数据库 ← 手动添加警报
  ↓
API ← 前端轮询 (每10秒)
  ↓
前端显示
```

## 🎯 Vercel 上能用的功能

### ✅ 完全支持
- ✅ **历史闪崩事件** - 左侧列表正常显示
- ✅ **TradingView 图表** - 实时K线图
- ✅ **数据分析面板** - 所有静态数据
- ✅ **响应式设计** - 移动端适配

### ⚠️ 部分支持
- ⚠️ **实时警报** - 使用轮询（10秒延迟）
- ⚠️ **市场监控** - 需要外部触发

### ❌ 不支持
- ❌ **自动市场监控** - Binance WebSocket 监控
- ❌ **WebSocket 推送** - 长连接

## 🔄 数据更新方案

### 方案1：手动添加警报（演示用）
使用我们提供的脚本手动添加测试警报

### 方案2：外部 Cron Job
使用 GitHub Actions 或其他 Cron 服务定期调用 API

### 方案3：第三方监控服务
集成 CoinGecko、CryptoCompare 等 API

## 📋 部署步骤

### 1. 准备数据库
```bash
# 确保数据库有历史事件
cd LUMI/scripts
node import-historical-crashes.js
```

### 2. 配置 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd LUMI
vercel
```

### 3. 环境变量（如需要）
在 Vercel 控制台设置：
- `NODE_ENV=production`
- 其他必要的环境变量

### 4. 数据库配置
**重要**：Vercel 每次部署都是新环境，需要使用：
- **外部数据库**（Supabase, PlanetScale）
- 或**静态数据**（JSON文件）

## 🌟 推荐替代方案

如果需要完整的实时监控功能，建议使用：

### 1. Railway.app
- ✅ 支持自定义服务器
- ✅ 支持 WebSocket
- ✅ 支持长期运行的进程
- 免费层级：512MB RAM, $5 免费额度

### 2. Render.com
- ✅ 支持 Node.js 服务器
- ✅ 支持 WebSocket
- ✅ 后台服务
- 免费层级：512MB RAM

### 3. DigitalOcean App Platform
- ✅ 完全支持
- ✅ 起价 $5/月

### 4. Fly.io
- ✅ 全功能支持
- ✅ 免费层级可用

## 📦 建议的生产架构

```
┌─────────────────────────┐
│   Vercel (前端 + API)   │
│   - Next.js 页面        │
│   - API Routes          │
│   - 静态资源            │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Railway (监控服务)     │
│  - 市场监控             │
│  - WebSocket 服务       │
│  - 数据库               │
└─────────────────────────┘
```

## 🔍 验证部署

访问你的 Vercel URL，检查：
1. ✅ 左侧历史事件列表是否显示
2. ✅ TradingView 图表是否加载
3. ✅ 右侧实时警报区域（应该显示"轮询模式"）
4. ✅ 控制台是否显示 "🔄 Vercel 环境：使用轮询模式"

## 💡 总结

### Vercel 适合：
- ✅ 静态展示
- ✅ API 端点
- ✅ 历史数据查询
- ✅ 低成本部署

### Vercel 不适合：
- ❌ 实时 WebSocket 推送
- ❌ 后台监控服务
- ❌ 长期运行的进程

### 最佳实践：
使用 **Vercel** 部署前端 + **Railway/Render** 部署监控服务

## 🎉 完成

你的黑天鹅预警系统现在已经兼容 Vercel 部署了！

虽然实时性有10秒延迟，但所有核心功能都能正常工作。

