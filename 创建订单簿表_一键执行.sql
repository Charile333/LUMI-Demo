-- ================================================
-- LUMI 订单簿表 - 一键创建
-- 在 Supabase SQL Editor 中执行此脚本
-- ================================================

-- 第1步：创建订单簿表
CREATE TABLE IF NOT EXISTS orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第2步：创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price DECIMAL(18, 6) NOT NULL,
  quantity DECIMAL(18, 6) NOT NULL,
  filled_quantity DECIMAL(18, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第3步：创建市场状态表
CREATE TABLE IF NOT EXISTS market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activating', 'active', 'failed')),
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第4步：创建索引
CREATE INDEX IF NOT EXISTS idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_market_id ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_address ON orders(user_address);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_market_states_market_id ON market_states(market_id);

-- 第5步：启用 Realtime（关键！）
ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;

-- 第6步：添加到 Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE orderbooks;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE market_states;

-- 第7步：创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 第8步：创建触发器
CREATE TRIGGER update_orderbooks_updated_at
  BEFORE UPDATE ON orderbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_states_updated_at
  BEFORE UPDATE ON market_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 第9步：插入测试数据
INSERT INTO orderbooks (market_id, bids, asks, last_price, volume_24h)
VALUES (
  1,
  '[{"price": "0.55", "quantity": "100", "total": "55"}]'::jsonb,
  '[{"price": "0.56", "quantity": "150", "total": "84"}]'::jsonb,
  0.555,
  1000
)
ON CONFLICT (market_id) DO NOTHING;

INSERT INTO market_states (market_id, status, interested_count, activation_threshold, message)
VALUES (1, 'active', 5, 10, '测试市场已激活')
ON CONFLICT (market_id) DO NOTHING;

-- 第10步：验证安装
SELECT 
  'orderbooks' as table_name, 
  count(*) as row_count
FROM orderbooks
UNION ALL
SELECT 
  'orders', 
  count(*)
FROM orders
UNION ALL
SELECT 
  'market_states', 
  count(*)
FROM market_states;

-- ================================================
-- ✅ 完成！
-- ================================================
-- 现在您可以：
-- 1. 在 Table Editor 中看到 3 个新表
-- 2. Realtime 已自动启用
-- 3. 访问 http://localhost:3000/test-realtime 测试
-- ================================================





