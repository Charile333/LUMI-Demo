-- ================================================
-- LUMI订单簿 - 完全清理并重新安装
-- 这个脚本会删除所有旧表并重新创建
-- ================================================

-- ⚠️ 警告：这会删除所有相关数据！
-- 如果是第一次安装或者遇到问题，请执行此脚本

-- 第1步：清理旧的表和函数
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS orderbooks CASCADE;
DROP TABLE IF EXISTS market_states CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_orders() CASCADE;

-- 显示清理完成
DO $$ BEGIN RAISE NOTICE '🧹 旧表已清理完成'; END $$;

-- ================================================
-- 第2步：创建新表
-- ================================================

-- 订单簿表
CREATE TABLE orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
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

-- 市场状态表
CREATE TABLE market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activating', 'active', 'failed')),
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN RAISE NOTICE '✅ 表创建成功'; END $$;

-- ================================================
-- 第3步：创建索引
-- ================================================

CREATE INDEX idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX idx_orders_market_id ON orders(market_id);
CREATE INDEX idx_orders_user_address ON orders(user_address);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_market_states_market_id ON market_states(market_id);

DO $$ BEGIN RAISE NOTICE '✅ 索引创建成功'; END $$;

-- ================================================
-- 第4步：启用实时功能（关键！）
-- ================================================

ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;

DO $$ BEGIN RAISE NOTICE '✅ 实时功能已启用'; END $$;

-- ================================================
-- 第5步：创建自动更新时间戳的函数和触发器
-- ================================================

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

DO $$ BEGIN RAISE NOTICE '✅ 触发器创建成功'; END $$;

-- ================================================
-- 第6步：插入测试数据
-- ================================================

INSERT INTO orderbooks (market_id, bids, asks, last_price, volume_24h)
VALUES (
  1,
  '[{"price": 0.55, "quantity": 100, "total": 55}]'::jsonb,
  '[{"price": 0.56, "quantity": 150, "total": 84}]'::jsonb,
  0.555,
  1000
);

INSERT INTO market_states (market_id, status, interested_count, activation_threshold)
VALUES (1, 'pending', 0, 10);

DO $$ BEGIN RAISE NOTICE '✅ 测试数据插入成功'; END $$;

-- ================================================
-- 第7步：验证安装
-- ================================================

SELECT 
  'orderbooks' as table_name, 
  count(*) as row_count,
  '订单簿表' as description
FROM orderbooks
UNION ALL
SELECT 
  'orders', 
  count(*),
  '订单记录表'
FROM orders
UNION ALL
SELECT 
  'market_states', 
  count(*),
  '市场状态表'
FROM market_states;

-- ================================================
-- 完成提示
-- ================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉 安装完成！🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 3个表已创建：orderbooks, orders, market_states';
  RAISE NOTICE '✅ 实时功能已启用';
  RAISE NOTICE '✅ 测试数据已插入';
  RAISE NOTICE '';
  RAISE NOTICE '📝 下一步：';
  RAISE NOTICE '1. 在 Table Editor 中查看表';
  RAISE NOTICE '2. 配置 .env.local 环境变量';
  RAISE NOTICE '3. 运行 npm run dev 测试';
  RAISE NOTICE '';
END $$;




















