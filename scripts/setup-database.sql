-- 🗄️ Market CLOB 数据库初始化脚本
-- PostgreSQL 15+

-- ==========================================
-- 1. 市场表 (markets)
-- ==========================================
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  
  -- 链上标识
  question_id TEXT UNIQUE NOT NULL,
  condition_id TEXT,
  
  -- 基本信息
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- 分类
  main_category TEXT NOT NULL DEFAULT 'emerging',
  sub_category TEXT,
  tags TEXT[],
  
  -- 时间
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  resolution_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 状态
  status TEXT DEFAULT 'draft', -- draft, pending, active, resolved, cancelled
  blockchain_status TEXT DEFAULT 'not_created', -- not_created, creating, created, failed
  
  -- 链上数据
  adapter_address TEXT,
  ctf_address TEXT,
  oracle_address TEXT,
  collateral_token TEXT,
  reward_amount DECIMAL,
  
  -- 结算
  resolved BOOLEAN DEFAULT FALSE,
  resolution_data JSONB,
  winning_outcome INTEGER,
  
  -- 统计
  volume DECIMAL DEFAULT 0,
  liquidity DECIMAL DEFAULT 0,
  participants INTEGER DEFAULT 0,
  
  -- 优先级
  priority_level TEXT DEFAULT 'recommended' -- recommended, normal, low
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(main_category, sub_category);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_markets_question_id ON markets(question_id);
CREATE INDEX IF NOT EXISTS idx_markets_blockchain_status ON markets(blockchain_status);

-- ==========================================
-- 2. 订单表 (orders)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  
  -- 订单标识
  order_id TEXT UNIQUE NOT NULL,
  order_hash TEXT UNIQUE NOT NULL,
  
  -- 市场和用户
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  maker_address TEXT NOT NULL,
  
  -- 订单类型
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  outcome INTEGER NOT NULL CHECK (outcome IN (0, 1)), -- 0=NO, 1=YES
  
  -- 价格和数量
  price DECIMAL NOT NULL CHECK (price >= 0 AND price <= 1),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  filled_amount DECIMAL DEFAULT 0,
  remaining_amount DECIMAL,
  
  -- EIP-712 签名数据
  signature TEXT NOT NULL,
  salt TEXT NOT NULL,
  nonce BIGINT NOT NULL,
  
  -- 时间限制
  expiration BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 状态
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled', 'expired')),
  
  -- 结算
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'settling', 'settled', 'failed')),
  settlement_batch_id INTEGER,
  settlement_tx_hash TEXT,
  settlement_block_number BIGINT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_market ON orders(market_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_maker ON orders(maker_address, status);
CREATE INDEX IF NOT EXISTS idx_orders_side ON orders(market_id, side, outcome, status);
CREATE INDEX IF NOT EXISTS idx_orders_price ON orders(market_id, side, outcome, price, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_settlement ON orders(settlement_status);
CREATE INDEX IF NOT EXISTS idx_orders_expiration ON orders(expiration);

-- ==========================================
-- 3. 成交记录表 (trades)
-- ==========================================
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  
  -- 交易标识
  trade_id TEXT UNIQUE NOT NULL,
  
  -- 关联
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  maker_order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  taker_order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 交易双方
  maker_address TEXT NOT NULL,
  taker_address TEXT NOT NULL,
  
  -- 成交信息
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  outcome INTEGER NOT NULL CHECK (outcome IN (0, 1)),
  price DECIMAL NOT NULL,
  amount DECIMAL NOT NULL,
  
  -- 费用
  maker_fee DECIMAL DEFAULT 0,
  taker_fee DECIMAL DEFAULT 0,
  
  -- 时间
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 结算
  settlement_batch_id INTEGER,
  settlement_tx_hash TEXT,
  settlement_block_number BIGINT,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_maker ON trades(maker_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_taker ON trades(taker_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_settlement ON trades(settled, settlement_batch_id);
CREATE INDEX IF NOT EXISTS idx_trades_orders ON trades(maker_order_id, taker_order_id);

-- ==========================================
-- 4. 结算批次表 (settlements)
-- ==========================================
CREATE TABLE IF NOT EXISTS settlements (
  id SERIAL PRIMARY KEY,
  
  -- 批次信息
  batch_id TEXT UNIQUE NOT NULL,
  trade_ids INTEGER[] NOT NULL,
  trade_count INTEGER NOT NULL,
  
  -- 状态
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- 链上
  tx_hash TEXT,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price TEXT,
  
  -- 时间
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- 错误
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status, created_at);
CREATE INDEX IF NOT EXISTS idx_settlements_batch_id ON settlements(batch_id);

-- ==========================================
-- 5. 用户余额表 (balances)
-- ==========================================
CREATE TABLE IF NOT EXISTS balances (
  id SERIAL PRIMARY KEY,
  
  -- 用户和代币
  user_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_type TEXT DEFAULT 'collateral' CHECK (token_type IN ('collateral', 'outcome')),
  
  -- 如果是 outcome token，记录市场信息
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  outcome INTEGER CHECK (outcome IN (0, 1)),
  
  -- 余额
  balance DECIMAL DEFAULT 0 CHECK (balance >= 0),
  locked_balance DECIMAL DEFAULT 0 CHECK (locked_balance >= 0),
  available_balance DECIMAL GENERATED ALWAYS AS (balance - locked_balance) STORED,
  
  -- 更新时间
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一约束
  CONSTRAINT balances_unique_key UNIQUE (user_address, token_address, token_type, market_id, outcome)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_balances_user ON balances(user_address);
CREATE INDEX IF NOT EXISTS idx_balances_token ON balances(token_address, token_type);
CREATE INDEX IF NOT EXISTS idx_balances_market ON balances(market_id, outcome);

-- ==========================================
-- 6. 用户表 (users) - 可选
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  
  -- 钱包地址
  address TEXT UNIQUE NOT NULL,
  
  -- 用户信息
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  
  -- 统计
  total_volume DECIMAL DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  win_count INTEGER DEFAULT 0,
  loss_count INTEGER DEFAULT 0,
  
  -- 时间
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  
  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ==========================================
-- 7. 活动日志表 (activity_logs) - 可选
-- ==========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- 用户
  user_address TEXT NOT NULL,
  
  -- 活动类型
  action_type TEXT NOT NULL, -- create_order, cancel_order, trade, settlement
  
  -- 关联数据
  market_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  trade_id INTEGER REFERENCES trades(id) ON DELETE SET NULL,
  
  -- 详细信息
  details JSONB,
  
  -- IP 和 User Agent
  ip_address TEXT,
  user_agent TEXT,
  
  -- 时间
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_market ON activity_logs(market_id, created_at DESC);

-- ==========================================
-- 8. 触发器：自动更新 updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. 初始化平台账户余额（测试数据）
-- ==========================================
-- 这里假设平台账户地址，实际使用时替换为真实地址
INSERT INTO balances (user_address, token_address, token_type, balance)
VALUES 
  ('0xPlatformWalletAddress', '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', 'collateral', 10000)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 10. 视图：订单簿聚合
-- ==========================================
CREATE OR REPLACE VIEW order_book_aggregated AS
SELECT 
  market_id,
  question_id,
  outcome,
  side,
  price,
  SUM(remaining_amount) as total_amount,
  COUNT(*) as order_count
FROM orders
WHERE status IN ('open', 'partial')
  AND remaining_amount > 0
  AND expiration > EXTRACT(EPOCH FROM NOW())
GROUP BY market_id, question_id, outcome, side, price;

-- ==========================================
-- 11. 视图：市场统计
-- ==========================================
CREATE OR REPLACE VIEW market_statistics AS
SELECT 
  m.id,
  m.question_id,
  m.title,
  m.status,
  COUNT(DISTINCT o.maker_address) as unique_traders,
  COUNT(DISTINCT t.id) as total_trades,
  COALESCE(SUM(t.amount * t.price), 0) as total_volume,
  COUNT(DISTINCT CASE WHEN o.status IN ('open', 'partial') THEN o.id END) as open_orders
FROM markets m
LEFT JOIN orders o ON m.id = o.market_id
LEFT JOIN trades t ON m.id = t.market_id
GROUP BY m.id, m.question_id, m.title, m.status;

-- ==========================================
-- 完成！
-- ==========================================
-- 数据库初始化完成
-- 现在可以开始使用 CLOB 系统了！

SELECT 
  'Database setup completed!' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';







