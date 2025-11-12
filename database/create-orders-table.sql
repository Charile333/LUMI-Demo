-- 🗄️ 创建 orders 表（订单系统）
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- 创建 orders 表
CREATE TABLE IF NOT EXISTS orders (
  -- 主键
  id SERIAL PRIMARY KEY,
  
  -- 订单标识
  order_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- 市场信息
  market_id INT NOT NULL,
  question_id VARCHAR(200),
  condition_id VARCHAR(200),
  
  -- 用户信息
  user_address VARCHAR(42) NOT NULL,
  
  -- 订单详情
  side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
  outcome INT NOT NULL CHECK (outcome IN (0, 1)),
  price DECIMAL(10, 4) NOT NULL CHECK (price >= 0 AND price <= 1),
  quantity DECIMAL(18, 8) NOT NULL CHECK (quantity > 0),
  filled_quantity DECIMAL(18, 8) DEFAULT 0 CHECK (filled_quantity >= 0),
  
  -- 订单状态
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled', 'expired')),
  
  -- 签名和安全
  signature TEXT,
  ctf_signature TEXT,
  salt VARCHAR(100),
  nonce BIGINT,
  expiration BIGINT,
  ctf_order_data JSONB,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_orders_market_side 
ON orders(market_id, side, status);

CREATE INDEX IF NOT EXISTS idx_orders_user 
ON orders(user_address, status);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_market_outcome 
ON orders(market_id, outcome, status);

-- 创建函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 验证表创建成功
SELECT 
  'orders 表已创建' as message,
  COUNT(*) as record_count 
FROM orders;

-- 显示表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

















