-- 创建 trades 表（成交记录表）
-- 如果表已存在则跳过

-- 检查表是否存在，不存在则创建
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trades'
  ) THEN
    -- 创建 trades 表
    CREATE TABLE trades (
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      -- 结算
      settlement_batch_id INTEGER,
      settlement_tx_hash TEXT,
      settlement_block_number BIGINT,
      settled BOOLEAN DEFAULT FALSE,
      settled_at TIMESTAMP WITH TIME ZONE
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_maker ON trades(maker_address, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_taker ON trades(taker_address, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_settlement ON trades(settled, settlement_batch_id);
    CREATE INDEX IF NOT EXISTS idx_trades_orders ON trades(maker_order_id, taker_order_id);
    CREATE INDEX IF NOT EXISTS idx_trades_question ON trades(question_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_trade_id ON trades(trade_id);

    -- 添加注释
    COMMENT ON TABLE trades IS '成交记录表，记录所有订单撮合成交的信息';
    COMMENT ON COLUMN trades.trade_id IS '交易唯一标识符';
    COMMENT ON COLUMN trades.maker_order_id IS '挂单方订单ID';
    COMMENT ON COLUMN trades.taker_order_id IS '吃单方订单ID';
    COMMENT ON COLUMN trades.settled IS '是否已结算';
    COMMENT ON COLUMN trades.settlement_batch_id IS '结算批次ID';
    COMMENT ON COLUMN trades.settlement_tx_hash IS '链上结算交易哈希';

    RAISE NOTICE 'trades 表创建成功';
  ELSE
    RAISE NOTICE 'trades 表已存在，跳过创建';
  END IF;
END $$;


