-- 用户话题表
CREATE TABLE IF NOT EXISTS user_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  votes INTEGER DEFAULT 0,
  created_by VARCHAR(100) DEFAULT 'anonymous',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 话题投票记录表
CREATE TABLE IF NOT EXISTS topic_votes (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES user_topics(id) ON DELETE CASCADE,
  user_address VARCHAR(100) NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(topic_id, user_address)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_topics_votes ON user_topics(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_topics_created_at ON user_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_votes_topic_id ON topic_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_votes_user_address ON topic_votes(user_address);

-- 添加注释
COMMENT ON TABLE user_topics IS '用户提交的话题表';
COMMENT ON TABLE topic_votes IS '话题投票记录表';
COMMENT ON COLUMN user_topics.title IS '话题标题（唯一）';
COMMENT ON COLUMN user_topics.description IS '话题描述';
COMMENT ON COLUMN user_topics.votes IS '投票数';
COMMENT ON COLUMN user_topics.created_by IS '创建者地址';

