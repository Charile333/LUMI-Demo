# 🧹 话题自动清理功能

## 📋 功能说明

自动清理低活跃度话题，保持话题列表的高质量。

### 清理规则

**话题满足以下条件时会被自动删除：**
- ⏰ 创建时间 > 3天
- 👎 投票数 < 3票

**示例：**
```
话题 A：创建于4天前，只有2票 → ❌ 删除
话题 B：创建于5天前，有5票   → ✅ 保留
话题 C：创建于1天前，只有0票 → ✅ 保留（还未到3天）
```

## 🚀 使用方法

### 方法1：手动运行清理

```bash
# 在项目目录运行
npm run topic-cleanup
```

**输出示例：**
```
🧹 开始清理低活跃度话题...

📊 发现 3 个低活跃度话题:

1. [ID:5] 这个话题没人关注
   📅 创建于 4 天前
   👍 投票数: 1

2. [ID:8] 测试话题
   📅 创建于 5 天前
   👍 投票数: 0

🗑️  已清理 3 个低活跃度话题

📊 清理后统计:
   总话题数: 12
   总投票数: 156
   平均投票: 13.00

✅ 清理完成!
```

### 方法2：通过 API 触发

```bash
# GET 请求
curl http://localhost:3000/api/topics/cleanup

# 或在浏览器访问
http://localhost:3000/api/topics/cleanup
```

**返回示例：**
```json
{
  "success": true,
  "message": "清理完成，删除了 3 个话题",
  "deleted": 3,
  "topics": [
    { "id": 5, "title": "这个话题没人关注", "votes": 1 }
  ],
  "stats": {
    "remainingTopics": "12",
    "totalVotes": "156"
  }
}
```

## ⏰ 自动定时清理（Vercel Cron）

### 步骤1：配置 vercel.json

在项目根目录的 `vercel.json` 中添加：

```json
{
  "crons": [
    {
      "path": "/api/topics/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**时间说明：**
- `0 2 * * *` = 每天凌晨 2:00 运行
- 可以修改为其他时间，例如：
  - `0 */6 * * *` = 每6小时运行一次
  - `0 0 * * 0` = 每周日凌晨运行

### 步骤2：添加安全 Token（推荐）

在 Vercel 环境变量中添加：

```
CRON_SECRET=your_random_secret_token_here_123456
```

这样只有携带正确 token 的请求才能触发清理：

```bash
curl -H "Authorization: Bearer your_random_secret_token_here_123456" \
  https://your-app.vercel.app/api/topics/cleanup
```

### 步骤3：部署

```bash
git add .
git commit -m "添加话题自动清理功能"
git push origin main
```

Vercel 会自动识别 cron 配置并开始定时运行。

## 📊 监控清理情况

### 查看清理日志

在 Vercel Dashboard：
1. 进入项目
2. Functions → Logs
3. 搜索 `/api/topics/cleanup`

### 手动检查待清理话题

在 Supabase SQL Editor 运行：

```sql
-- 查看即将被清理的话题
SELECT 
  id,
  title,
  votes,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_old
FROM user_topics
WHERE 
  created_at < NOW() - INTERVAL '3 days'
  AND votes < 3
ORDER BY created_at ASC;
```

## ⚙️ 自定义清理规则

### 修改清理阈值

编辑 `scripts/clean-inactive-topics.ts`：

```typescript
// 在文件顶部修改这些值
const INACTIVE_DAYS = 3;      // 改为 7 = 7天后清理
const MIN_VOTES = 3;          // 改为 5 = 至少需要5票才保留
```

### 添加更多清理条件

例如，保护特定用户创建的话题：

```typescript
const result = await db.query(`
  SELECT * FROM user_topics
  WHERE 
    created_at < NOW() - INTERVAL '${INACTIVE_DAYS} days'
    AND votes < ${MIN_VOTES}
    AND created_by != 'admin'  -- 👈 新增：不删除管理员的话题
`);
```

## 🔔 清理通知（可选）

### 发送邮件通知

在清理后发送统计报告：

```typescript
// 在 clean-inactive-topics.ts 中添加
import { sendEmail } from '../lib/email';

// 清理完成后
await sendEmail({
  to: 'admin@example.com',
  subject: '话题清理报告',
  body: `已清理 ${deletedTopics.length} 个低活跃度话题`
});
```

### Webhook 通知

发送到 Slack/Discord：

```typescript
await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `🧹 清理了 ${deletedTopics.length} 个话题`
  })
});
```

## 🧪 测试清理功能

### 创建测试数据

```sql
-- 插入一个旧话题（用于测试）
INSERT INTO user_topics (title, description, votes, created_at)
VALUES ('测试话题', '这个话题会被清理', 1, NOW() - INTERVAL '5 days');
```

### 运行清理

```bash
npm run topic-cleanup
```

### 验证删除

```sql
SELECT * FROM user_topics WHERE title = '测试话题';
-- 应该返回空结果
```

## 📈 最佳实践

1. **先测试再部署**
   - 本地运行几次确认无误
   - 查看清理日志

2. **合理设置阈值**
   - 太短：删除太快，用户体验差
   - 太长：垃圾话题堆积
   - 建议：3-7天，3-5票

3. **定期监控**
   - 每周查看清理日志
   - 调整规则确保合理

4. **保留重要话题**
   - 可以添加"置顶"标记
   - 管理员话题不删除

## 🛡️ 安全建议

1. **使用 CRON_SECRET**
   - 防止未授权访问
   - Token 至少 32 位随机字符

2. **限制清理频率**
   - 每天1-2次即可
   - 避免过于频繁

3. **备份重要数据**
   - Supabase 自动备份
   - 定期下载备份

## ❓ 常见问题

**Q: 误删重要话题怎么办？**
A: Supabase 有自动备份，可以恢复。建议提高投票阈值。

**Q: 能否恢复已删除话题？**
A: 不能自动恢复，但可以从数据库备份中恢复。

**Q: 清理会影响性能吗？**
A: 不会，清理是异步执行，不影响用户访问。

**Q: 如何暂停自动清理？**
A: 在 vercel.json 中删除或注释掉 cron 配置。

## 📝 更新日志

- **v1.0** - 基础清理功能
  - 3天 + 3票规则
  - 手动和自动清理
  - API 端点

---

**清理让话题列表保持高质量！** 🎉

