# ⚡ 5分钟快速启动 - 实时预警系统

## 🎯 目标

让你的 Vercel 部署在 5 分钟内拥有真正的实时数据！

## 📝 准备工作

- [ ] GitHub 账号
- [ ] Vercel 账号（已部署 LUMI 项目）
- [ ] 5 分钟时间

## 🚀 快速步骤

### 1️⃣ 创建 Supabase（2分钟）

1. 访问 https://supabase.com/
2. 点击 **Start your project**
3. 用 GitHub 登录
4. 点击 **New project**：
   - Name: `lumi-alerts`
   - Password: 随便生成一个
   - Region: **Singapore** (最快)
5. 点击 **Create new project**
6. 等待创建（喝口水☕）

### 2️⃣ 创建数据表（1分钟）

1. 左侧点击 **SQL Editor**
2. 点击 **New query**
3. 复制粘贴：

```sql
CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  symbol TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_type ON alerts(type);
```

4. 点击 **Run**
5. 看到 "Success" ✅

### 3️⃣ 获取 API 密钥（30秒）

1. 左侧点击 **Settings** → **API**
2. 复制两个值：
   - **URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbG...`（很长的一串）

### 4️⃣ 配置 GitHub（1分钟）

1. 进入你的 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加：
   - Name: `SUPABASE_URL`
   - Value: 粘贴你的 URL
4. 再添加一个：
   - Name: `SUPABASE_KEY`
   - Value: 粘贴你的 anon public key

### 5️⃣ 配置 Vercel（1分钟）

1. Vercel Dashboard → 你的项目
2. **Settings** → **Environment Variables**
3. 添加两个变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 key
4. 选择：**Production, Preview, Development**
5. 点击 **Save**

### 6️⃣ 推送代码（30秒）

```bash
git add .
git commit -m "Add GitHub Actions monitoring"
git push
```

### 7️⃣ 测试（30秒）

1. GitHub → **Actions** 标签
2. 找到 **Market Monitor**
3. 点击 **Run workflow** → **Run workflow**
4. 等待完成（绿色✓）

## ✅ 验证

访问：`https://your-app.vercel.app/black-swan`

打开浏览器控制台（F12），应该看到：
```
🔄 Vercel 环境：使用轮询模式获取实时警报
```

如果在 5 分钟内 BTC/ETH 价格有波动，右侧会显示警报！

## 🎉 完成！

现在你有：
- ✅ 每 5 分钟自动监控市场
- ✅ 价格异常自动记录
- ✅ Vercel 前端实时显示
- ✅ 完全免费

## 📊 查看数据

### Supabase Dashboard
1. Table Editor → alerts
2. 可以看到所有警报记录

### GitHub Actions
1. Actions → Market Monitor
2. 可以看到每次运行日志

## 🔧 可选：导入历史数据

如果想要左侧显示历史事件：

```bash
export SUPABASE_URL=你的URL
export SUPABASE_KEY=你的KEY
cd LUMI/scripts
node import-historical-to-supabase.js
```

## ⚙️ 调整监控频率

编辑 `.github/workflows/market-monitor.yml`:

```yaml
schedule:
  - cron: '*/1 * * * *'  # 每1分钟（更频繁）
```

然后 push 即可。

## 🐛 问题排查

### Actions 不运行？
- 确认 GitHub → Settings → Actions → "Allow all actions"

### 看不到数据？
- 检查 Supabase Table Editor 是否有数据
- 检查 GitHub Actions 日志是否有错误
- 检查 Vercel 环境变量是否正确

### 前端报错？
- 重新部署 Vercel
- 清除浏览器缓存

## 💡 提示

- GitHub Actions 免费版：2000 分钟/月
- 每次运行约 10 秒
- 每 5 分钟运行一次
- 一个月用不到 100 分钟 ✅

## 📚 深入了解

详细文档：
- `DEPLOY_WITH_GITHUB_ACTIONS.md` - 完整部署指南
- `SUPABASE_SETUP.md` - Supabase 详细设置

