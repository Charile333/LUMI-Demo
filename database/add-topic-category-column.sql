-- 为 user_topics 表添加分类字段
-- 如果字段已存在则跳过

-- 添加分类字段
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_topics' AND column_name = 'category'
  ) THEN
    ALTER TABLE user_topics ADD COLUMN category VARCHAR(50) DEFAULT 'automotive';
  END IF;
END $$;

-- 创建分类索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_topics_category ON user_topics(category);

-- 更新现有记录的默认分类（如果为空）
UPDATE user_topics SET category = 'automotive' WHERE category IS NULL;

-- 添加注释
COMMENT ON COLUMN user_topics.category IS '话题分类（automotive, tech-ai, entertainment, sports-gaming, economy-social, emerging）';

