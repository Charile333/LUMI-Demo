-- 创建用户话题表
-- 如果表不存在则创建

CREATE TABLE IF NOT EXISTS user_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_by VARCHAR(255) NOT NULL DEFAULT 'anonymous',
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_topics_votes ON user_topics(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_topics_created_at ON user_topics(created_at DESC);

-- 创建话题投票表
CREATE TABLE IF NOT EXISTS topic_votes (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES user_topics(id) ON DELETE CASCADE,
  user_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_address)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_topic_votes_topic_id ON topic_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_votes_user_address ON topic_votes(user_address);

-- 添加注释
COMMENT ON TABLE user_topics IS '用户创建的话题表';
COMMENT ON TABLE topic_votes IS '话题投票记录表';

