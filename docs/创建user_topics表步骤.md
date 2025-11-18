# 创建 user_topics 表步骤

## 问题

错误信息：
```
Could not find the table 'public.user_topics' in the schema cache
errorCode: "PGRST205"
```

**原因**：`user_topics` 表在 Supabase 数据库中不存在。

---

## 解决方案

### 方法 1：在 Supabase Dashboard 中运行 SQL（推荐）

1. **登录 Supabase Dashboard**
   - 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 选择您的项目

2. **打开 SQL Editor**
   - 点击左侧菜单的 "SQL Editor"
   - 点击 "New query"

3. **运行以下 SQL**

```sql
-- 创建用户话题表
CREATE TABLE IF NOT EXISTS user_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_by VARCHAR(255) NOT NULL DEFAULT 'anonymous',
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建话题投票表
CREATE TABLE IF NOT EXISTS topic_votes (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES user_topics(id) ON DELETE CASCADE,
  user_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_address)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_topics_votes ON user_topics(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_topics_created_at ON user_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_votes_topic_id ON topic_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_votes_user_address ON topic_votes(user_address);

-- 添加注释
COMMENT ON TABLE user_topics IS '用户创建的话题表';
COMMENT ON TABLE topic_votes IS '话题投票记录表';
```

4. **点击 "Run" 按钮执行 SQL**

5. **验证表是否创建成功**
   - 点击左侧菜单的 "Table Editor"
   - 应该能看到 `user_topics` 和 `topic_votes` 表

---

### 方法 2：使用项目中的 SQL 文件

项目中已有创建表的 SQL 脚本：

**文件位置**：
- `database/create-user-topics-table.sql`
- `scripts/create-topics-tables.sql`

**步骤**：
1. 打开 SQL 文件
2. 复制所有内容
3. 在 Supabase SQL Editor 中粘贴并运行

---

## 验证表是否创建成功

### 方法 1：在 Supabase Dashboard 中查看

1. 登录 Supabase Dashboard
2. 点击左侧菜单的 "Table Editor"
3. 查看是否有 `user_topics` 表

### 方法 2：运行 SQL 查询

在 Supabase SQL Editor 中运行：

```sql
-- 检查表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_topics'
);
```

如果返回 `true`，说明表已创建成功。

---

## 表结构说明

### user_topics 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，自动递增 |
| `title` | VARCHAR(100) | 话题标题（唯一） |
| `description` | TEXT | 话题描述 |
| `created_by` | VARCHAR(255) | 创建者地址 |
| `votes` | INTEGER | 投票数 |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 |

### topic_votes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，自动递增 |
| `topic_id` | INTEGER | 话题 ID（外键） |
| `user_address` | VARCHAR(255) | 投票者地址 |
| `created_at` | TIMESTAMP | 投票时间 |

**约束**：
- `(topic_id, user_address)` 唯一约束，确保每个用户对每个话题只能投一次票

---

## 创建表后

创建表后，请：

1. **刷新浏览器页面**
2. **再次尝试创建话题**
3. **应该可以正常创建了**

---

## 如果仍有问题

如果创建表后仍然有问题，请：

1. **检查 Supabase 连接**
   - 确认 Vercel 环境变量配置正确
   - 确认 Supabase 项目正常运行

2. **检查表权限**
   - 确认 Service Role Key 有权限访问表
   - 在 Supabase Dashboard → Settings → API 中检查权限

3. **查看详细错误**
   - 查看 Vercel 函数日志
   - 查看浏览器控制台日志

---

## 相关文件

- `database/create-user-topics-table.sql` - 数据库表创建脚本
- `scripts/create-topics-tables.sql` - 备用创建脚本
- `app/api/topics/route.ts` - 话题 API 端点

