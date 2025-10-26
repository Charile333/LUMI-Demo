# 🦢 黑天鹅实时预警系统 - 完整指南

## 📊 系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                    本地开发环境                                  │
├─────────────────────────────────────────────────────────────────┤
│  npm run dev                                                     │
│    ↓                                                             │
│  自定义服务器 (server-with-websocket.js)                        │
│    ├─ Next.js 应用                                              │
│    ├─ WebSocket 服务 (/ws/alerts)                               │
│    └─ 市场监控 (Binance WebSocket)                              │
│         ↓                                                        │
│  本地数据库 (SQLite)                                             │
│    ↓                                                             │
│  WebSocket 实时推送 → 前端显示                                   │
│                                                                  │
│  ✅ 毫秒级延迟                                                   │
│  ✅ 完整功能                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Vercel 生产环境                               │
├─────────────────────────────────────────────────────────────────┤
│  Vercel Serverless Functions                                    │
│    ├─ Next.js 页面                                              │
│    ├─ API Routes                                                │
│    └─ ❌ 不支持：自定义服务器、WebSocket、长期进程              │
│                                                                  │
│  GitHub Actions (Cron: 每5分钟)                                │
│    ├─ 监控 Binance API                                          │
│    ├─ 检测价格异常 (>1%)                                        │
│    └─ 写入 Supabase 数据库                                      │
│         ↓                                                        │
│  Supabase 云数据库 (PostgreSQL)                                 │
│    ├─ alerts 表                                                 │
│    └─ 持久化存储                                                 │
│         ↓                                                        │
│  前端轮询 (每10秒)                                               │
│    └─ /api/alerts/latest                                        │
│         ↓                                                        │
│  显示实时警报                                                    │
│                                                                  │
│  ⚠️ 10秒延迟（轮询间隔）+ 5分钟延迟（监控间隔）                 │
│  ✅ 完全免费                                                     │
│  ✅ 全球部署                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 快速开始

### 本地开发
```bash
cd LUMI
npm install
npm run dev
```
访问：http://localhost:3000/black-swan

### Vercel 部署
**5分钟快速设置**：参考 `QUICKSTART_REALTIME.md`

**完整部署指南**：参考 `DEPLOY_WITH_GITHUB_ACTIONS.md`

## 📚 文档索引

| 文档 | 用途 | 适合人群 |
|------|------|----------|
| `QUICKSTART_REALTIME.md` | 5分钟快速启动 | 所有人 |
| `DEPLOY_WITH_GITHUB_ACTIONS.md` | 完整部署指南 | 技术人员 |
| `SUPABASE_SETUP.md` | Supabase 详细设置 | 需要数据库配置 |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Vercel 平台说明 | 了解限制 |
| `VERCEL_REALTIME_ALERTS.md` | 实时预警机制 | 了解原理 |
| `MARKET_MONITOR_GUIDE.md` | 本地监控说明 | 本地开发 |

## 🔑 关键文件

### GitHub Actions
- `.github/workflows/market-monitor.yml` - 定时任务配置
- `.github/scripts/monitor-market.js` - 监控脚本

### API 端点
- `app/api/alerts/latest/route.ts` - 获取最新警报
- `app/api/alerts/route.ts` - 获取所有警报
- `app/api/alerts/stats/route.ts` - 统计信息
- `app/api/alerts/real-crash-events/route.ts` - 历史事件

### 核心组件
- `app/black-swan/page.tsx` - 主页面
- `lib/supabase-client.ts` - Supabase 客户端
- `lib/market-monitor.js` - 本地市场监控
- `server-with-websocket.js` - 自定义服务器

### 脚本工具
- `scripts/import-historical-crashes.js` - 导入到本地 SQLite
- `scripts/import-historical-to-supabase.js` - 导入到 Supabase

## 🌐 环境变量

### 本地开发
不需要额外配置，使用本地 SQLite。

### Vercel 生产
在 Vercel Dashboard 配置：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### GitHub Actions
在 GitHub Secrets 配置：
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbG...
```

## 📊 数据流对比

| 环节 | 本地开发 | Vercel 生产 |
|------|----------|-------------|
| 数据源 | Binance WebSocket | GitHub Actions |
| 监控频率 | 实时 | 每5分钟 |
| 数据库 | SQLite | Supabase |
| 推送方式 | WebSocket | HTTP 轮询 |
| 前端刷新 | 实时 | 每10秒 |
| 总延迟 | <1秒 | 5-15分钟 |
| 成本 | 免费 | 免费 |

## 🔧 功能状态

### ✅ 完全支持（所有环境）
- 历史闪崩事件列表（21个）
- TradingView 实时图表
- 数据分析面板
- 响应式设计
- 黑天鹅事件详情

### ✅ 本地开发支持
- 自动市场监控
- WebSocket 实时推送
- 毫秒级延迟

### ⚠️ Vercel 部分支持
- 实时警报（10秒轮询延迟）
- 市场监控（GitHub Actions，5分钟延迟）

## 💰 成本分析

### 完全免费方案
| 服务 | 免费额度 | 实际用量 | 成本 |
|------|----------|----------|------|
| Vercel | Hobby 计划 | 1个项目 | $0 |
| Supabase | 500MB 数据库 | <1MB | $0 |
| GitHub Actions | 2000分钟/月 | <100分钟 | $0 |
| Binance API | 1200次/分钟 | 12次/小时 | $0 |

**总计：$0/月** ✅

## 🚀 性能指标

### 本地开发
- 警报生成：<100ms
- WebSocket 延迟：<50ms
- 页面加载：<2s
- 实时性：⭐⭐⭐⭐⭐

### Vercel 生产
- API 响应：<200ms
- 轮询间隔：10s
- 监控间隔：5min
- 实时性：⭐⭐⭐（够用）

## 🎓 学习路径

### 新手上手
1. 阅读 `QUICKSTART_REALTIME.md`
2. 创建 Supabase 项目
3. 配置 GitHub Actions
4. 部署到 Vercel

### 深入理解
1. 阅读 `DEPLOY_WITH_GITHUB_ACTIONS.md`
2. 研究监控脚本
3. 自定义监控参数
4. 添加更多币种

### 高级定制
1. 修改 `.github/scripts/monitor-market.js`
2. 调整阈值和频率
3. 添加自定义通知
4. 集成其他数据源

## 🐛 常见问题

### Q: Vercel 上看不到实时数据？
A: 检查：
1. Supabase 数据库是否有数据
2. Vercel 环境变量是否配置
3. GitHub Actions 是否运行成功

### Q: GitHub Actions 不运行？
A: 检查：
1. Actions 是否启用
2. Secrets 是否配置
3. Cron 语法是否正确

### Q: 想要更实时的数据？
A: 可以：
1. 调整 GitHub Actions 为每分钟运行
2. 调整前端轮询为每秒
3. 或使用 Railway.app 等平台部署完整服务

## 🎉 总结

这个系统提供了两种模式：

**本地开发**：完整的实时监控体验
**Vercel 生产**：免费的准实时监控（5-15分钟延迟）

对于大多数展示和学习用途，Vercel 方案已经足够好了！

如果需要生产级的实时性，建议使用 Railway 或其他支持 WebSocket 的平台。

