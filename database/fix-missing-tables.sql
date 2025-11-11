-- 🔧 修复缺失的数据库表和字段
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- ==========================================
-- 1. 创建 orderbooks 表
-- ==========================================
CREATE TABLE IF NOT EXISTS orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX IF NOT EXISTS idx_orderbooks_updated_at ON orderbooks(updated_at DESC);

SELECT '✅ 步骤 1/4: orderbooks 表已创建' as status;

-- ==========================================
-- 2. 为 markets 表添加 current_price 字段
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'current_price'
  ) THEN
    ALTER TABLE markets ADD COLUMN current_price DECIMAL(18, 6) DEFAULT 0.5;
    RAISE NOTICE '✅ current_price 字段已添加';
  ELSE
    RAISE NOTICE 'ℹ️ current_price 字段已存在';
  END IF;
END $$;

SELECT '✅ 步骤 2/4: current_price 字段已添加' as status;

-- ==========================================
-- 3. 为现有市场创建订单簿记录
-- ==========================================
INSERT INTO orderbooks (market_id, bids, asks, last_price, volume_24h)
SELECT 
  id, 
  '[]'::jsonb, 
  '[]'::jsonb, 
  0.5, 
  0
FROM markets
WHERE id NOT IN (SELECT market_id FROM orderbooks)
ON CONFLICT (market_id) DO NOTHING;

SELECT '✅ 步骤 3/4: 订单簿记录已创建' as status;

-- ==========================================
-- 4. 创建 RPC 函数
-- ==========================================
CREATE OR REPLACE FUNCTION get_price_change_24h(market_id_param INTEGER)
RETURNS TABLE (
  market_id INTEGER,
  price_change DECIMAL,
  price_change_percent DECIMAL
) AS $$
BEGIN
  -- 简化版本：返回固定值
  -- 后续可以根据实际需求实现价格历史追踪
  RETURN QUERY
  SELECT 
    market_id_param as market_id,
    0.0::DECIMAL as price_change,
    0.0::DECIMAL as price_change_percent;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ 步骤 4/4: RPC 函数已创建' as status;

-- ==========================================
-- 5. 验证
-- ==========================================
SELECT 
  '✅ 所有修复完成！' as status,
  (SELECT COUNT(*) FROM orderbooks) as orderbooks_count,
  (SELECT COUNT(*) FROM markets WHERE current_price IS NOT NULL) as markets_with_price;

-- 显示创建的订单簿
SELECT 
  ob.market_id,
  m.title as market_title,
  ob.last_price,
  ob.updated_at
FROM orderbooks ob
JOIN markets m ON ob.market_id = m.id
ORDER BY ob.market_id;














