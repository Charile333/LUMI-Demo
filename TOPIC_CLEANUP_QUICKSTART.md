# ⚡ 话题自动清理 - 快速开始

## 🎯 功能说明

**自动清理规则：**
- 创建 > 3天
- 投票 < 3票
- → 自动删除

## 🚀 5分钟配置

### 1️⃣ 手动测试（1分钟）

```bash
# 在 LUMI 目录运行
npm run topic-cleanup
```

看到输出说明配置成功！

### 2️⃣ 启用自动清理（已配置）

**vercel.json** 已配置：
```json
{
  "crons": [
    {
      "path": "/api/topics/cleanup",
      "schedule": "0 2 * * *"  ← 每天凌晨2点运行
    }
  ]
}
```

### 3️⃣ 添加安全保护（可选但推荐）

在 Vercel 环境变量添加：
```
CRON_SECRET=your_random_secret_here_abc123xyz
```

### 4️⃣ 部署

```bash
git add .
git commit -m "启用话题自动清理"
git push
```

完成！✅

## 🧪 测试清理功能

### 创建测试话题

在 Supabase SQL Editor 运行：

```sql
-- 插入一个4天前的低投票话题
INSERT INTO user_topics (title, description, votes, created_at)
VALUES ('测试话题-会被删除', '这是测试', 1, NOW() - INTERVAL '4 days');
```

### 运行清理

```bash
npm run topic-cleanup
```

### 验证结果

```sql
-- 测试话题应该被删除了
SELECT * FROM user_topics WHERE title LIKE '测试话题%';
```

## 📊 查看即将被清理的话题

```sql
SELECT 
  id,
  title,
  votes,
  EXTRACT(DAY FROM (NOW() - created_at))::INTEGER as days_old
FROM user_topics
WHERE 
  created_at < NOW() - INTERVAL '3 days'
  AND votes < 3
ORDER BY created_at ASC;
```

## ⚙️ 修改清理规则

编辑 `scripts/clean-inactive-topics.ts`：

```typescript
const INACTIVE_DAYS = 3;  // 改为 7 = 一周后清理
const MIN_VOTES = 3;      // 改为 5 = 需要5票才保留
```

## 🔔 通过 API 手动触发

```bash
# 本地
curl http://localhost:3000/api/topics/cleanup

# 生产环境
curl https://your-app.vercel.app/api/topics/cleanup
```

## 📈 监控（Vercel Dashboard）

1. 进入项目
2. Functions → Logs
3. 搜索 `cleanup`

## 常用命令

```bash
# 手动清理
npm run topic-cleanup

# 查看即将被清理的话题数量
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_topics WHERE created_at < NOW() - INTERVAL '3 days' AND votes < 3"

# 查看所有话题统计
psql $DATABASE_URL -c "SELECT COUNT(*) as total, AVG(votes) as avg_votes FROM user_topics"
```

## ⏰ Cron 时间配置

```
0 2 * * *   = 每天凌晨2点
0 */6 * * * = 每6小时
0 0 * * 0   = 每周日凌晨
0 0 1 * *   = 每月1号凌晨
```

---

**完成配置后，话题列表将自动保持高质量！** 🎉

详细文档：[docs/TOPIC_CLEANUP_GUIDE.md](docs/TOPIC_CLEANUP_GUIDE.md)

