-- ==========================================
-- 为 markets 表添加新页面所需的列
-- 用于解决新页面获取不到数据的问题
-- ==========================================

-- 1. 添加活跃度追踪字段（如果不存在）
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interested_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_score DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

-- 2. 确保 priority_level 字段存在（如果不存在）
-- 注意：如果字段已存在，不会修改默认值，保持原有设置
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'recommended';

-- 3. 确保 question_id 字段存在（如果不存在）
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS question_id TEXT;

-- 4. 为 activity_score 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_markets_activity_score ON markets(activity_score DESC);

-- 5. 为 interested_users 创建索引
CREATE INDEX IF NOT EXISTS idx_markets_interested_users ON markets(interested_users DESC);

-- 6. 为 views 创建索引
CREATE INDEX IF NOT EXISTS idx_markets_views ON markets(views DESC);

-- 7. 为 priority_level 创建索引
CREATE INDEX IF NOT EXISTS idx_markets_priority_level ON markets(priority_level);

-- 8. 验证字段是否添加成功
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'markets'
  AND column_name IN (
    'views',
    'interested_users',
    'activity_score',
    'activated_at',
    'priority_level',
    'question_id'
  )
ORDER BY column_name;

-- 完成提示
SELECT '✅ Markets 表新列添加完成！' as status;

