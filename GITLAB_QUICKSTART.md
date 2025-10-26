# ⚡ GitLab + Vercel 实时预警快速指南

## 🎯 GitLab 项目专用

你的项目在 GitLab 上，部署在 Vercel，这个方案完美适配！

## 🚀 快速步骤（5分钟）

### 1️⃣ 创建 Supabase 数据库（2分钟）

参考之前的步骤，在现有 Supabase 项目中创建 `alerts` 表：

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

### 2️⃣ 配置 GitLab CI/CD 变量（1分钟）

1. 进入 GitLab 项目
2. **Settings** → **CI/CD** → **Variables** → **Expand**
3. 点击 **Add variable**，添加两个：

**变量 1：**
- Key: `SUPABASE_URL`
- Value: `https://xxxxx.supabase.co`
- Protected: ✓ (勾选)
- Masked: ✓ (勾选)

**变量 2：**
- Key: `SUPABASE_KEY`
- Value: `eyJhbG...`
- Protected: ✓ (勾选)
- Masked: ✓ (勾选)

### 3️⃣ 创建 Pipeline Schedule（1分钟）

1. **CI/CD** → **Schedules** → **New schedule**
2. 填写：
   - **Description**: `Market Monitor`
   - **Interval Pattern**: `Custom (*/5 * * * *)`  ← 每5分钟
   - **Cron timezone**: `Beijing (GMT+8)` 或你的时区
   - **Target branch**: `main` 或 `master`
   - **Activated**: ✓ (勾选)
3. 点击 **Create pipeline schedule**

### 4️⃣ 推送代码（30秒）

```bash
git add .
git commit -m "Add GitLab CI/CD market monitoring"
git push
```

### 5️⃣ 手动测试（30秒）

1. **CI/CD** → **Schedules**
2. 找到 **Market Monitor**
3. 点击右边的 **Play** 按钮 ▶️
4. 点击 **CI/CD** → **Pipelines** 查看运行状态

## ✅ 验证

等待 Pipeline 完成后：
1. 访问 Supabase Dashboard → Table Editor → alerts
2. 应该能看到数据（如果价格有波动）
3. 访问你的 Vercel 网站：`https://your-app.vercel.app/black-swan`

## 📊 GitLab CI/CD 说明

### 免费额度
- **Free tier**: 400 CI/CD 分钟/月
- 每次运行约 10-20 秒
- 每 5 分钟运行 = 每小时 12 次 = 每天 288 次
- 每月约用：288 × 30 × 0.3分钟 = 2,592 分钟

⚠️ **超出免费额度！**

### 💡 解决方案：降低频率

#### 方案 1：每 10 分钟（推荐）
```
Custom: */10 * * * *
```
每月用量：1,296 分钟 ✅

#### 方案 2：每 15 分钟
```
Custom: */15 * * * *
```
每月用量：864 分钟 ✅

#### 方案 3：每小时
```
Custom: 0 * * * *
```
每月用量：144 分钟 ✅

### 推荐配置：每 10 分钟

这样既能保持相对实时，又在免费额度内！

## 🔧 修改监控频率

1. **CI/CD** → **Schedules**
2. 点击 **Edit** (铅笔图标)
3. 修改 **Interval Pattern**：
   - 每 10 分钟：`*/10 * * * *`
   - 每 15 分钟：`*/15 * * * *`
   - 每小时：`0 * * * *`
4. **Save pipeline schedule**

## 🎉 完成

现在你有：
- ✅ GitLab CI/CD 自动监控
- ✅ Supabase 云数据库
- ✅ Vercel 前端显示
- ✅ 完全在免费额度内（10分钟间隔）

## 📱 查看运行日志

**CI/CD** → **Pipelines** → 点击最新的 Pipeline → 查看 `market-monitor` job

应该看到：
```
🔍 开始市场监控...
⏰ 时间: 2025-10-26T...
📊 监控: BTCUSDT, ETHUSDT
✅ 监控完成
```

## 🐛 故障排查

### Pipeline 不运行？
- 检查 Schedule 是否 **Activated**
- 检查 `.gitlab-ci.yml` 是否在根目录
- 检查变量是否配置正确

### 没有数据？
- 查看 Pipeline 日志
- 检查 Supabase 表是否创建
- 手动运行 Schedule 测试

### Vercel 看不到数据？
- 确认 Vercel 环境变量已配置
- 重新部署 Vercel
- 等待价格波动（>1%）

## 💡 提示

如果觉得 10 分钟还太频繁，可以：
1. 用 15 分钟间隔（更省资源）
2. 用外部 Cron 服务（见方案 B）

---

## 方案 B：外部 Cron 服务（不消耗 GitLab 额度）

如果想要更频繁的监控而不消耗 GitLab 额度：

### 使用 EasyCron（免费）
1. 访问 https://www.easycron.com/
2. 注册免费账号
3. 创建 Cron job：
   - URL: `https://your-vercel-app.vercel.app/api/monitor-trigger`
   - Cron: `*/5 * * * *` (每5分钟)

但这需要创建一个新的 API 路由来触发监控。

**推荐：用 GitLab CI/CD + 10分钟间隔** 最简单！

