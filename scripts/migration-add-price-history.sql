-- =========================================
-- 方案A: 数据库优化迁移脚本
-- 功能: 添加价格历史表和参与人数缓存
-- =========================================

-- 1️⃣ 创建市场价格历史表
CREATE TABLE IF NOT EXISTS market_price_history (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  
  -- 价格数据
  price DECIMAL(10, 4) NOT NULL,           -- 市场价格（0-1之间）
  best_bid DECIMAL(10, 4),                 -- 最高买价
  best_ask DECIMAL(10, 4),                 -- 最低卖价
  
  -- 交易数据
  volume_24h DECIMAL(18, 2) DEFAULT 0,     -- 24小时交易量
  participants_count INTEGER DEFAULT 0,     -- 当时的参与人数
  
  -- 时间戳
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 索引优化
  CONSTRAINT price_range_check CHECK (price >= 0 AND price <= 1)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_price_history_market_time 
  ON market_price_history(market_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_time 
  ON market_price_history(recorded_at DESC);

-- 2️⃣ 在 markets 表添加缓存字段
DO $$ 
BEGIN
  -- 添加参与人数缓存字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'participants_count'
  ) THEN
    ALTER TABLE markets ADD COLUMN participants_count INTEGER DEFAULT 0;
  END IF;

  -- 添加当前价格字段（用于快速访问）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'current_price'
  ) THEN
    ALTER TABLE markets ADD COLUMN current_price DECIMAL(10, 4) DEFAULT 0.5;
  END IF;

  -- 添加24小时价格变化百分比
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'price_change_24h'
  ) THEN
    ALTER TABLE markets ADD COLUMN price_change_24h DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- 添加最后更新时间
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'stats_updated_at'
  ) THEN
    ALTER TABLE markets ADD COLUMN stats_updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_markets_current_price ON markets(current_price);
CREATE INDEX IF NOT EXISTS idx_markets_participants ON markets(participants_count DESC);

-- 3️⃣ 创建函数：更新参与人数
CREATE OR REPLACE FUNCTION update_market_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 当订单状态变为 completed 时，更新市场的参与人数
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
    
    UPDATE markets 
    SET 
      participants_count = (
        SELECT COUNT(DISTINCT user_address) 
        FROM orders 
        WHERE market_id = NEW.market_id 
        AND status = 'completed'
      ),
      stats_updated_at = NOW()
    WHERE id = NEW.market_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ 创建触发器：自动更新参与人数
DROP TRIGGER IF EXISTS trigger_update_participants ON orders;

CREATE TRIGGER trigger_update_participants
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_market_participants_count();

-- 5️⃣ 创建函数：记录价格历史（手动调用或通过定时任务）
CREATE OR REPLACE FUNCTION record_market_price_history(
  p_market_id INTEGER,
  p_price DECIMAL(10, 4),
  p_best_bid DECIMAL(10, 4),
  p_best_ask DECIMAL(10, 4),
  p_volume_24h DECIMAL(18, 2)
)
RETURNS VOID AS $$
BEGIN
  -- 插入历史记录
  INSERT INTO market_price_history (
    market_id, 
    price, 
    best_bid, 
    best_ask, 
    volume_24h,
    participants_count
  )
  VALUES (
    p_market_id,
    p_price,
    p_best_bid,
    p_best_ask,
    p_volume_24h,
    (SELECT participants_count FROM markets WHERE id = p_market_id)
  );
  
  -- 更新 markets 表的当前价格
  UPDATE markets 
  SET 
    current_price = p_price,
    stats_updated_at = NOW()
  WHERE id = p_market_id;
END;
$$ LANGUAGE plpgsql;

-- 6️⃣ 创建函数：获取24小时价格变化
CREATE OR REPLACE FUNCTION get_price_change_24h(p_market_id INTEGER)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  current_price_val DECIMAL(10, 4);
  price_24h_ago DECIMAL(10, 4);
  price_change DECIMAL(10, 2);
BEGIN
  -- 获取当前价格
  SELECT current_price INTO current_price_val
  FROM markets
  WHERE id = p_market_id;
  
  -- 如果没有当前价格，返回0
  IF current_price_val IS NULL THEN
    RETURN 0;
  END IF;
  
  -- 获取24小时前的价格（最接近的记录）
  SELECT price INTO price_24h_ago
  FROM market_price_history
  WHERE market_id = p_market_id
    AND recorded_at <= NOW() - INTERVAL '24 hours'
  ORDER BY recorded_at DESC
  LIMIT 1;
  
  -- 如果没有24小时前的数据，返回0
  IF price_24h_ago IS NULL OR price_24h_ago = 0 THEN
    RETURN 0;
  END IF;
  
  -- 计算百分比变化
  price_change := ((current_price_val - price_24h_ago) / price_24h_ago) * 100;
  
  RETURN ROUND(price_change, 2);
END;
$$ LANGUAGE plpgsql;

-- 7️⃣ 创建函数：批量获取市场统计数据
CREATE OR REPLACE FUNCTION get_markets_stats_batch(market_ids INTEGER[])
RETURNS TABLE (
  market_id INTEGER,
  current_price DECIMAL(10, 4),
  price_change_24h DECIMAL(10, 2),
  volume_24h DECIMAL(18, 2),
  participants_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id AS market_id,
    m.current_price,
    get_price_change_24h(m.id) AS price_change_24h,
    COALESCE(m.volume, 0) AS volume_24h,
    COALESCE(m.participants_count, 0) AS participants_count
  FROM markets m
  WHERE m.id = ANY(market_ids);
END;
$$ LANGUAGE plpgsql;

-- 8️⃣ 初始化现有市场的参与人数
UPDATE markets m
SET participants_count = (
  SELECT COUNT(DISTINCT o.user_address)
  FROM orders o
  WHERE o.market_id = m.id 
  AND o.status = 'completed'
)
WHERE m.participants_count = 0 OR m.participants_count IS NULL;

-- 9️⃣ 创建清理旧数据的函数（可选，保留90天数据）
CREATE OR REPLACE FUNCTION cleanup_old_price_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM market_price_history
  WHERE recorded_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 🎉 迁移完成
DO $$
BEGIN
  RAISE NOTICE '✅ 方案A数据库迁移完成！';
  RAISE NOTICE '📊 已创建: market_price_history 表';
  RAISE NOTICE '📊 已添加: participants_count, current_price 字段';
  RAISE NOTICE '⚡ 已创建: 自动更新触发器和函数';
  RAISE NOTICE '🔧 下一步: 运行定时任务记录价格历史';
END $$;

