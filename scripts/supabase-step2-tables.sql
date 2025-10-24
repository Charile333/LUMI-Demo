-- ==========================================
-- 第 2 步：创建所有表
-- ==========================================

-- 1. 市场表 (markets)
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  question_id TEXT UNIQUE NOT NULL,
  condition_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  main_category TEXT NOT NULL DEFAULT 'emerging',
  sub_category TEXT,
  tags TEXT[],
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  resolution_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'draft',
  blockchain_status TEXT DEFAULT 'not_created',
  adapter_address TEXT,
  ctf_address TEXT,
  oracle_address TEXT,
  collateral_token TEXT,
  reward_amount DECIMAL,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_data JSONB,
  winning_outcome INTEGER,
  volume DECIMAL DEFAULT 0,
  liquidity DECIMAL DEFAULT 0,
  participants INTEGER DEFAULT 0,
  priority_level TEXT DEFAULT 'recommended'
);

CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(main_category, sub_category);
CREATE INDEX idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX idx_markets_question_id ON markets(question_id);
CREATE INDEX idx_markets_blockchain_status ON markets(blockchain_status);

-- 2. 订单表 (orders)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  order_hash TEXT UNIQUE NOT NULL,
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  maker_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  outcome INTEGER NOT NULL CHECK (outcome IN (0, 1)),
  price DECIMAL NOT NULL CHECK (price >= 0 AND price <= 1),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  filled_amount DECIMAL DEFAULT 0,
  remaining_amount DECIMAL,
  signature TEXT NOT NULL,
  salt TEXT NOT NULL,
  nonce BIGINT NOT NULL,
  expiration BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled', 'expired')),
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'settling', 'settled', 'failed')),
  settlement_batch_id INTEGER,
  settlement_tx_hash TEXT,
  settlement_block_number BIGINT
);

CREATE INDEX idx_orders_market ON orders(market_id, status);
CREATE INDEX idx_orders_maker ON orders(maker_address, status);
CREATE INDEX idx_orders_side ON orders(market_id, side, outcome, status);
CREATE INDEX idx_orders_price ON orders(market_id, side, outcome, price, created_at);
CREATE INDEX idx_orders_settlement ON orders(settlement_status);
CREATE INDEX idx_orders_expiration ON orders(expiration);

-- 3. 成交记录表 (trades)
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  trade_id TEXT UNIQUE NOT NULL,
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  maker_order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  taker_order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  maker_address TEXT NOT NULL,
  taker_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  outcome INTEGER NOT NULL CHECK (outcome IN (0, 1)),
  price DECIMAL NOT NULL,
  amount DECIMAL NOT NULL,
  maker_fee DECIMAL DEFAULT 0,
  taker_fee DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  settlement_batch_id INTEGER,
  settlement_tx_hash TEXT,
  settlement_block_number BIGINT,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP
);

CREATE INDEX idx_trades_market ON trades(market_id, created_at DESC);
CREATE INDEX idx_trades_maker ON trades(maker_address, created_at DESC);
CREATE INDEX idx_trades_taker ON trades(taker_address, created_at DESC);
CREATE INDEX idx_trades_settlement ON trades(settled, settlement_batch_id);
CREATE INDEX idx_trades_orders ON trades(maker_order_id, taker_order_id);

-- 4. 结算批次表 (settlements)
CREATE TABLE settlements (
  id SERIAL PRIMARY KEY,
  batch_id TEXT UNIQUE NOT NULL,
  trade_ids INTEGER[] NOT NULL,
  trade_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tx_hash TEXT,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_settlements_status ON settlements(status, created_at);
CREATE INDEX idx_settlements_batch_id ON settlements(batch_id);

-- 5. 用户余额表 (balances)
CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_type TEXT DEFAULT 'collateral' CHECK (token_type IN ('collateral', 'outcome')),
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  outcome INTEGER CHECK (outcome IN (0, 1)),
  balance DECIMAL DEFAULT 0 CHECK (balance >= 0),
  locked_balance DECIMAL DEFAULT 0 CHECK (locked_balance >= 0),
  available_balance DECIMAL GENERATED ALWAYS AS (balance - locked_balance) STORED,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT balances_unique_key UNIQUE (user_address, token_address, token_type, market_id, outcome)
);

CREATE INDEX idx_balances_user ON balances(user_address);
CREATE INDEX idx_balances_token ON balances(token_address, token_type);
CREATE INDEX idx_balances_market ON balances(market_id, outcome);

-- 6. 用户表 (users)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  total_volume DECIMAL DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  win_count INTEGER DEFAULT 0,
  loss_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_username ON users(username);

-- 7. 活动日志表 (activity_logs)
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  market_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  trade_id INTEGER REFERENCES trades(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_address, created_at DESC);
CREATE INDEX idx_activity_type ON activity_logs(action_type, created_at DESC);
CREATE INDEX idx_activity_market ON activity_logs(market_id, created_at DESC);

-- 表创建完成
SELECT 'Tables created! Now run step 3.' as status;






