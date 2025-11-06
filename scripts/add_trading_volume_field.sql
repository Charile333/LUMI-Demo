-- 添加交易量字段到 markets 表

-- 1. 添加 trading_volume 字段
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS trading_volume DECIMAL(18, 2) DEFAULT 0;

-- 2. 添加 activated_at 字段（记录激活时间）
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

-- 3. 为 trading_volume 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_markets_trading_volume 
ON markets(trading_volume);

-- 4. 为 activated_at 添加索引
CREATE INDEX IF NOT EXISTS idx_markets_activated_at 
ON markets(activated_at);

-- 5. 添加注释
COMMENT ON COLUMN markets.trading_volume IS '市场累计交易量（美元）';
COMMENT ON COLUMN markets.activated_at IS '市场激活时间';

-- 6. 查看结果
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'markets'
AND column_name IN ('trading_volume', 'activated_at');

