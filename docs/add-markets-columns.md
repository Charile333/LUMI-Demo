# 📊 添加 Markets 表新列说明

## 🎯 问题描述

新页面（如 `app/markets/optimized/page.tsx`）无法获取数据，因为 Supabase 数据库的 `markets` 表缺少以下列：

- `activity_score` - 活跃度分数（用于排序）
- `interested_users` - 感兴趣的用户数
- `views` - 浏览次数
- `activated_at` - 激活时间
- `priority_level` - 优先级（可能已存在，但需要确认）
- `question_id` - 问题ID（可能已存在，但需要确认）

## ✅ 解决方案

### 方法 1: 在 Supabase Dashboard 中执行 SQL（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query**
5. 复制并粘贴以下 SQL 脚本内容：

```sql
-- 添加活跃度追踪字段
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interested_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_score DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

-- 确保 priority_level 字段存在
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'recommended';

-- 确保 question_id 字段存在
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS question_id TEXT;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_markets_activity_score ON markets(activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_markets_interested_users ON markets(interested_users DESC);
CREATE INDEX IF NOT EXISTS idx_markets_views ON markets(views DESC);
CREATE INDEX IF NOT EXISTS idx_markets_priority_level ON markets(priority_level);
```

6. 点击 **Run** 执行脚本
7. 等待执行完成，应该看到 "✅ Markets 表新列添加完成！"

### 方法 2: 使用本地 SQL 文件

如果你有本地数据库连接，可以执行项目中的 SQL 文件：

```bash
# 使用 psql（需要设置 DATABASE_URL 环境变量）
psql $DATABASE_URL -f database/add-markets-activity-columns.sql

# 或者使用 Supabase CLI
supabase db execute -f database/add-markets-activity-columns.sql
```

## 🔍 验证

执行完成后，可以在 Supabase Dashboard 的 **Table Editor** 中查看 `markets` 表，确认以下列已添加：

- ✅ `views` (INTEGER, 默认值: 0)
- ✅ `interested_users` (INTEGER, 默认值: 0)
- ✅ `activity_score` (DECIMAL, 默认值: 0)
- ✅ `activated_at` (TIMESTAMP, 可为空)
- ✅ `priority_level` (TEXT, 默认值: 'recommended')
- ✅ `question_id` (TEXT, 可为空)

## 📝 相关文件

- SQL 脚本: `database/add-markets-activity-columns.sql`
- 新页面: `app/markets/optimized/page.tsx`
- Hook: `lib/hooks/useMarketsByCategory.ts`

## ⚠️ 注意事项

1. **数据安全**: 使用 `IF NOT EXISTS` 确保不会重复添加已存在的列
2. **默认值**: 新添加的列都有默认值，不会影响现有数据
3. **索引**: 为常用查询字段创建了索引，提高查询性能
4. **兼容性**: 如果某些列已存在，SQL 会跳过，不会报错

## 🚀 执行后

执行完成后，新页面应该能够正常获取和显示数据了。如果还有问题，请检查：

1. 浏览器控制台是否有错误
2. Supabase 连接是否正常
3. 环境变量是否正确配置


