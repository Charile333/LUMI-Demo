-- 创建预测市场数据表
CREATE TABLE IF NOT EXISTS markets (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  categoryType TEXT NOT NULL,
  probability DECIMAL(5,2) DEFAULT 50.0,
  volume TEXT DEFAULT '$0',
  volumeNum DECIMAL DEFAULT 0,
  participants INTEGER DEFAULT 0,
  endDate TEXT NOT NULL,
  trend TEXT DEFAULT 'up',
  change TEXT DEFAULT '+0%',
  description TEXT NOT NULL,
  resolutionCriteria TEXT[] DEFAULT '{}',
  relatedMarkets TEXT[] DEFAULT '{}',
  isActive BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'custom',
  priorityLevel TEXT DEFAULT 'normal',
  customWeight INTEGER DEFAULT 50,
  isHomepage BOOLEAN DEFAULT false,
  isHot BOOLEAN DEFAULT false,
  isTrending BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_markets_categoryType ON markets(categoryType);
CREATE INDEX IF NOT EXISTS idx_markets_isActive ON markets(isActive);
CREATE INDEX IF NOT EXISTS idx_markets_createdAt ON markets(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_markets_source ON markets(source);
CREATE INDEX IF NOT EXISTS idx_markets_priorityLevel ON markets(priorityLevel);

-- 添加注释
COMMENT ON TABLE markets IS '预测市场数据表';
COMMENT ON COLUMN markets.categoryType IS '市场分类：automotive, tech-ai, sports-gaming 等';
COMMENT ON COLUMN markets.isActive IS '是否在前端显示';
COMMENT ON COLUMN markets.source IS '数据来源：custom（自定义）, polymarket, kalshi 等';
COMMENT ON COLUMN markets.priorityLevel IS '优先级：pinned（置顶）, featured（精选）, recommended（推荐）, normal（普通）';










