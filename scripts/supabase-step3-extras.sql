-- ==========================================
-- 第 3 步：创建触发器、视图和初始数据
-- ==========================================

-- 1. 触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 为表添加触发器
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. 初始化平台账户余额
INSERT INTO balances (user_address, token_address, token_type, balance)
VALUES 
  ('0xPlatformWalletAddress', '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', 'collateral', 10000)
ON CONFLICT DO NOTHING;

-- 4. 视图：订单簿聚合
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

-- 5. 视图：市场统计
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

-- 完成！
SELECT 
  'Database setup completed! ✅' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';






