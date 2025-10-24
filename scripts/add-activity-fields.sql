-- ==========================================
-- 添加活跃度追踪字段到 markets 表
-- ==========================================

-- 添加活跃度相关字段
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interested_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

-- 创建用户兴趣表
CREATE TABLE IF NOT EXISTS user_interests (
  id SERIAL PRIMARY KEY,
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_interests_unique UNIQUE (market_id, user_address)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_market ON user_interests(market_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_address);

-- 更新 activity_logs 表，添加浏览次数
CREATE INDEX IF NOT EXISTS idx_activity_view ON activity_logs(market_id, action_type) 
WHERE action_type = 'view';

-- 完成
SELECT 'Activity tracking fields added!' as status;

