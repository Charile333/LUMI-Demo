# 🚀 完整部署指南 - GitHub Actions 实时监控

## 📋 概览

这个方案让你的 Vercel 部署拥有**真正的实时数据**：

```
GitHub Actions (每5分钟)
    ↓
监控 Binance API
    ↓
检测价格异常
    ↓
写入 Supabase 云数据库
    ↓
Vercel 前端轮询读取
    ↓
显示实时警报 ✅
```

## 🎯 部署步骤

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com/
2. 用 GitHub 登录
3. 创建新项目：
   - 名称：`lumi-alerts`
   - 密码：生成并保存
   - 区域：选择最近的
4. 等待创建完成

### 步骤 2：创建数据表

在 Supabase Dashboard → Table Editor：

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

-- 创建索引提升查询性能
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_type ON alerts(type);
```

或使用 UI 创建（参考 `SUPABASE_SETUP.md`）

### 步骤 3：导入历史数据到 Supabase

```bash
# 在本地运行
cd LUMI/scripts
node import-historical-to-supabase.js
```

需要先创建这个脚本（见下方）

### 步骤 4：配置 GitHub Secrets

在你的 GitHub 仓库：

1. Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加：

```
SUPABASE_URL = https://xxx.supabase.co
SUPABASE_KEY = eyJhbG...
```

### 步骤 5：配置 Vercel 环境变量

在 Vercel Dashboard:

1. 项目 Settings → Environment Variables
2. 添加（注意前缀）：

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
```

3. 应用到：Production, Preview, Development

### 步骤 6：提交代码

```bash
git add .
git commit -m "Add GitHub Actions market monitoring"
git push
```

### 步骤 7：启用 GitHub Actions

1. 进入 GitHub 仓库 → Actions
2. 如果看到提示，点击 "I understand my workflows, go ahead and enable them"
3. 找到 "Market Monitor" workflow
4. 点击 "Enable workflow"

### 步骤 8：手动触发测试

1. Actions → Market Monitor
2. 点击 "Run workflow" → "Run workflow"
3. 等待完成
4. 查看日志确认成功

### 步骤 9：验证

访问你的 Vercel URL：
```
https://your-app.vercel.app/black-swan
```

打开浏览器控制台，应该看到：
```
🔄 Vercel 环境：使用轮询模式获取实时警报
✅ 数据来自: supabase
```

## 📊 运行机制

### GitHub Actions Cron
```yaml
schedule:
  - cron: '*/5 * * * *'  # 每5分钟
```

### 监控流程
```
1. GitHub Actions 触发
2. 调用 Binance API 获取 BTC/ETH 价格
3. 与上次价格比较
4. 如果变化 > 1%，写入 Supabase
5. 等待下一次触发（5分钟后）
```

### 前端轮询
```
1. 页面加载
2. 每10秒调用 /api/alerts/latest
3. API 从 Supabase 读取最近5分钟数据
4. 前端显示
5. 重复
```

## 🔧 自定义配置

### 调整监控频率

编辑 `.github/workflows/market-monitor.yml`:
```yaml
schedule:
  - cron: '*/1 * * * *'  # 每1分钟（更频繁）
  - cron: '0 * * * *'    # 每小时（较少）
```

### 调整阈值

编辑 `.github/scripts/monitor-market.js`:
```javascript
const THRESHOLD = 0.02; // 2% 阈值
```

### 添加更多币种

编辑 `.github/scripts/monitor-market.js`:
```javascript
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
```

## 📈 成本

| 服务 | 成本 | 限制 |
|------|------|------|
| Vercel | 免费 | Hobby 计划 |
| Supabase | 免费 | 500MB 数据库，无限 API |
| GitHub Actions | 免费 | 2000 分钟/月 |
| Binance API | 免费 | 1200 请求/分钟 |

**总成本：$0/月** ✅

## ⚠️ 注意事项

### GitHub Actions 限制
- 每个 workflow 最多运行 6 小时
- 每个 job 最多运行 6 小时
- 但我们的脚本只运行几秒钟，完全没问题

### Supabase 免费层
- 500MB 存储（足够存储数百万条警报）
- 无限 API 请求
- 2GB 带宽/月

### 数据保留
警报会永久存储，如果需要清理旧数据：

```sql
-- 删除30天前的数据
DELETE FROM alerts 
WHERE timestamp < NOW() - INTERVAL '30 days' 
  AND type != 'historical_crash';
```

## 🎉 完成

现在你有了：
- ✅ 真正的实时市场监控
- ✅ 云数据库永久存储
- ✅ 完全免费的解决方案
- ✅ 全球访问（Vercel CDN）

## 📱 下一步

1. 监控 GitHub Actions 运行情况
2. 检查 Supabase 数据是否写入
3. 访问 Vercel 查看实时警报
4. 享受你的实时黑天鹅预警系统！

## 🐛 故障排查

### Actions 没有运行？
- 检查是否启用了 Actions
- 查看 Actions 标签页的日志
- 确认 cron 语法正确

### 没有数据写入？
- 检查 GitHub Secrets 是否设置
- 查看 Actions 日志中的错误
- 测试 Supabase 连接

### 前端看不到数据？
- 检查 Vercel 环境变量
- 查看浏览器控制台
- 确认数据库中有数据

## 📞 获取帮助

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 查看 Supabase Dashboard → Logs
3. 查看浏览器控制台
4. 检查 Vercel 函数日志

