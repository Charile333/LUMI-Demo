# 🦢 黑天鹅实时预警系统 - GitLab 版

## 📊 系统架构

```
GitLab CI/CD (每10-15分钟)
    ↓
监控 Binance API (BTC/ETH)
    ↓
检测价格异常 (>1%)
    ↓
写入 Supabase 云数据库
    ↓
Vercel 前端轮询 (每10秒)
    ↓
显示实时警报 ✅
```

## 🚀 快速开始

### 1. 创建 Supabase 数据表

在你现有的 Supabase 项目中运行：

```sql
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  symbol TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert" ON alerts
  FOR INSERT WITH CHECK (true);
```

### 2. 配置 GitLab CI/CD 变量

**GitLab 项目** → **Settings** → **CI/CD** → **Variables**

添加两个变量：
- `SUPABASE_URL` = 你的 Supabase URL
- `SUPABASE_KEY` = 你的 Supabase anon key

### 3. 推送代码

```bash
git add .
git commit -m "Add GitLab CI/CD market monitoring"
git push
```

### 4. 创建定时任务

推送后，**CI/CD** → **Schedules** → **New schedule**

- Description: `Market Monitor`
- Interval Pattern: **Custom** → `*/15 * * * *` (每15分钟，推荐)
- Target branch: `main` 或 `master`
- Activated: ✓

### 5. 手动测试

**CI/CD** → **Schedules** → 点击 **Play ▶️**

查看日志：**CI/CD** → **Pipelines** → 最新的 Pipeline

## 📁 关键文件

| 文件 | 说明 |
|------|------|
| `.gitlab-ci.yml` | GitLab CI/CD 配置 |
| `scripts/monitor-market.js` | 市场监控脚本 |
| `lib/supabase-client.ts` | Supabase 客户端 |
| `app/api/alerts/latest/route.ts` | 获取最新警报 API |
| `app/black-swan/page.tsx` | 黑天鹅预警页面 |

## ⚙️ 监控频率建议

GitLab 免费版：**400 分钟/月**

| 频率 | 每月用量 | 推荐 |
|------|----------|------|
| 每 5 分钟 | 2,592 分钟 | ❌ 超额 |
| 每 10 分钟 | 1,296 分钟 | ⚠️ 可能超 |
| **每 15 分钟** | **864 分钟** | ✅ 推荐 |
| 每 30 分钟 | 432 分钟 | ✅ 安全 |

## 🔧 调整监控频率

**CI/CD** → **Schedules** → **Edit**

修改 **Interval Pattern**：
- 每 15 分钟：`*/15 * * * *`
- 每 30 分钟：`*/30 * * * *`
- 每小时：`0 * * * *`

## 🌐 环境说明

### 本地开发
```bash
cd LUMI
npm run dev
```

- ✅ 自动启动市场监控
- ✅ WebSocket 实时推送
- ✅ 使用本地 SQLite 数据库
- ✅ 毫秒级延迟

### Vercel 生产环境

- ✅ GitLab CI/CD 监控（15分钟间隔）
- ✅ Supabase 云数据库
- ✅ 前端轮询（10秒间隔）
- ⚠️ 总延迟：15-25分钟

## 📊 数据流对比

| 环节 | 本地开发 | Vercel 生产 |
|------|----------|-------------|
| 监控频率 | 实时 | 每15分钟 |
| 数据库 | SQLite | Supabase |
| 推送方式 | WebSocket | HTTP 轮询 |
| 总延迟 | <1秒 | 15-25分钟 |
| 成本 | 免费 | 免费 |

## ✨ 功能特点

- ✅ **完全免费** - GitLab CI + Supabase + Vercel
- ✅ **自动监控** - 每15分钟检测 BTC/ETH
- ✅ **云端存储** - Supabase 永久存储
- ✅ **全球访问** - Vercel CDN
- ✅ **历史数据** - 21个历史闪崩事件
- ✅ **TradingView 图表** - 实时K线图

## 📱 验证部署

访问：`https://your-app.vercel.app/black-swan`

打开浏览器控制台应该看到：
```
🔄 Vercel 环境：使用轮询模式获取实时警报
```

## 🐛 故障排查

### Pipeline 不运行？
- 检查 Schedule 是否 **Activated**
- 检查 `.gitlab-ci.yml` 是否在根目录
- 查看 **CI/CD** → **Pipelines** 的错误日志

### 没有数据？
- 检查 GitLab Variables 是否配置
- 查看 Pipeline 日志
- 检查 Supabase 表是否创建
- 等待价格波动（>1%）

### Vercel 看不到数据？
- 检查 Vercel 环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 重新部署 Vercel
- 检查浏览器控制台

## 📚 相关文档

- `GITLAB_QUICKSTART.md` - 详细的 GitLab 设置指南
- `SUPABASE_SETUP.md` - Supabase 数据库设置
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel 部署说明

## 💰 成本分析

| 服务 | 免费额度 | 实际用量 | 成本 |
|------|----------|----------|------|
| GitLab CI | 400分钟/月 | ~850分钟 | $0 (15分钟间隔) |
| Supabase | 500MB | <1MB | $0 |
| Vercel | Hobby计划 | 1项目 | $0 |
| Binance API | 1200次/分钟 | 4次/小时 | $0 |

**总计：$0/月** ✅

## 🎉 总结

这个系统为 GitLab + Vercel 项目提供了一个**完全免费**的准实时预警方案。

虽然有 15-25 分钟的延迟，但对于展示、学习和大多数非关键场景已经足够了！

如果需要真正的实时性（秒级），建议使用支持 WebSocket 的平台（如 Railway）。

