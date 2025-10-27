-- ================================================
-- LUMI市场订单簿数据库表结构 - 简化版
-- 在Supabase SQL Editor中执行此脚本
-- ================================================

-- 第1步：创建订单簿表
CREATE TABLE IF NOT EXISTS orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_market_orderbook UNIQUE (market_id)
);

-- 第2步：创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  side TEXT NOT NULL,
  price DECIMAL(18, 6) NOT NULL,
  quantity DECIMAL(18, 6) NOT NULL,
  filled_quantity DECIMAL(18, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_side CHECK (side IN ('buy', 'sell')),
  CONSTRAINT check_status CHECK (status IN ('open', 'partial', 'filled', 'cancelled'))
);

-- 第3步：创建市场状态表
CREATE TABLE IF NOT EXISTS market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_market_status CHECK (status IN ('pending', 'activating', 'active', 'failed'))
);

-- 第4步：创建索引
CREATE INDEX IF NOT EXISTS idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_market_id ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_address ON orders(user_address);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_market_states_market_id ON market_states(market_id);

-- 第5步：启用实时功能（最重要！）
ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;

-- 第6步：创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 第7步：应用触发器
DROP TRIGGER IF EXISTS update_orderbooks_updated_at ON orderbooks;
CREATE TRIGGER update_orderbooks_updated_at
  BEFORE UPDATE ON orderbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_states_updated_at ON market_states;
CREATE TRIGGER update_market_states_updated_at
  BEFORE UPDATE ON market_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 第8步：插入测试数据
INSERT INTO orderbooks (market_id, bids, asks, last_price, volume_24h)
VALUES (
  1, 
  '[{"price": 0.55, "quantity": 100, "total": 55}]'::jsonb,
  '[{"price": 0.56, "quantity": 150, "total": 84}]'::jsonb,
  0.555,
  1000
)
ON CONFLICT (market_id) DO NOTHING;

INSERT INTO market_states (market_id, status, interested_count, activation_threshold)
VALUES (1, 'pending', 0, 10)
ON CONFLICT (market_id) DO NOTHING;

-- 完成！验证
SELECT 'orderbooks' as table_name, count(*) as row_count FROM orderbooks
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'market_states', count(*) FROM market_states;

-- 显示成功消息
DO $$
BEGIN
  RAISE NOTICE '✅ 订单簿数据库表创建成功！';
  RAISE NOTICE '✅ 实时功能已启用！';
  RAISE NOTICE '✅ 测试数据已插入！';
  RAISE NOTICE '📊 表清单：orderbooks, orders, market_states';
END $$;





