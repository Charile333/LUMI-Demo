-- ================================================
-- LUMI市场订单簿数据库表结构
-- 在Supabase SQL Editor中执行此脚本
-- ================================================

-- 1. 订单簿表（存储聚合后的买卖盘数据）
CREATE TABLE IF NOT EXISTS orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每个市场只有一个订单簿
  CONSTRAINT unique_market_orderbook UNIQUE (market_id)
);

-- 2. 订单表（存储所有订单记录）
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

-- 3. 市场状态表（存储市场激活状态）
CREATE TABLE IF NOT EXISTS market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activating', 'active', 'failed')),
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 创建索引以提高查询性能
-- ================================================

-- 订单簿索引
CREATE INDEX IF NOT EXISTS idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX IF NOT EXISTS idx_orderbooks_updated_at ON orderbooks(updated_at DESC);

-- 订单索引
CREATE INDEX IF NOT EXISTS idx_orders_market_id ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_address ON orders(user_address);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 市场状态索引
CREATE INDEX IF NOT EXISTS idx_market_states_market_id ON market_states(market_id);
CREATE INDEX IF NOT EXISTS idx_market_states_status ON market_states(status);

-- ================================================
-- 启用实时功能（关键！）
-- ================================================

ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;

-- ================================================
-- 创建自动更新时间戳的函数
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器到各表
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

-- ================================================
-- 添加表注释
-- ================================================

COMMENT ON TABLE orderbooks IS '实时订单簿数据 - 存储每个市场的聚合买卖盘';
COMMENT ON COLUMN orderbooks.bids IS '买单列表 - 格式: [{price, quantity, total}]';
COMMENT ON COLUMN orderbooks.asks IS '卖单列表 - 格式: [{price, quantity, total}]';
COMMENT ON COLUMN orderbooks.last_price IS '最新成交价格';
COMMENT ON COLUMN orderbooks.volume_24h IS '24小时交易量';

COMMENT ON TABLE orders IS '订单记录表 - 存储所有订单';
COMMENT ON COLUMN orders.side IS '订单方向: buy(买入) 或 sell(卖出)';
COMMENT ON COLUMN orders.status IS '订单状态: open(开放), partial(部分成交), filled(完全成交), cancelled(已取消)';

COMMENT ON TABLE market_states IS '市场状态表 - 跟踪市场激活进度';
COMMENT ON COLUMN market_states.status IS '市场状态: pending(等待), activating(激活中), active(已激活), failed(失败)';
COMMENT ON COLUMN market_states.interested_count IS '感兴趣人数';
COMMENT ON COLUMN market_states.activation_threshold IS '激活所需人数阈值';

-- ================================================
-- 创建清理函数（可选 - 用于定期清理旧数据）
-- ================================================

CREATE OR REPLACE FUNCTION cleanup_old_orders()
RETURNS void AS $$
BEGIN
  -- 删除7天前已完成或已取消的订单
  DELETE FROM orders 
  WHERE status IN ('filled', 'cancelled') 
  AND updated_at < NOW() - INTERVAL '7 days';
  
  RAISE NOTICE '已清理旧订单数据';
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 插入测试数据（可选 - 用于测试）
-- ================================================

-- 为市场ID=1创建初始订单簿
INSERT INTO orderbooks (market_id, bids, asks, last_price, volume_24h)
VALUES (
  1, 
  '[{"price": 0.55, "quantity": 100, "total": 55}, {"price": 0.54, "quantity": 200, "total": 108}]',
  '[{"price": 0.56, "quantity": 150, "total": 84}, {"price": 0.57, "quantity": 100, "total": 57}]',
  0.555,
  1000
)
ON CONFLICT (market_id) DO NOTHING;

-- 为市场ID=1创建初始状态
INSERT INTO market_states (market_id, status, interested_count, activation_threshold)
VALUES (1, 'pending', 0, 10)
ON CONFLICT (market_id) DO NOTHING;

-- ================================================
-- 完成！
-- ================================================

-- 验证表是否创建成功
SELECT 
  'orderbooks' as table_name, 
  count(*) as row_count 
FROM orderbooks
UNION ALL
SELECT 
  'orders' as table_name, 
  count(*) as row_count 
FROM orders
UNION ALL
SELECT 
  'market_states' as table_name, 
  count(*) as row_count 
FROM market_states;

-- 输出成功消息
DO $$
BEGIN
  RAISE NOTICE '✅ 订单簿数据库表创建成功！';
  RAISE NOTICE '✅ 实时功能已启用！';
  RAISE NOTICE '✅ 可以开始使用订单簿功能了！';
END $$;

