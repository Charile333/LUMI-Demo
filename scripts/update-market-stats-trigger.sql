-- 🔧 自动更新市场统计数据的触发器
-- 当订单或交易创建时，自动更新 markets 表的 participants 和 volume

-- 1. 创建函数：更新市场统计数据
CREATE OR REPLACE FUNCTION update_market_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_market_id INTEGER;
  v_unique_traders INTEGER;
  v_total_volume NUMERIC;
BEGIN
  -- 获取 market_id（根据触发的表）
  IF TG_TABLE_NAME = 'orders' THEN
    v_market_id := NEW.market_id;
  ELSIF TG_TABLE_NAME = 'trades' THEN
    v_market_id := NEW.market_id;
  END IF;

  -- 统计该市场的唯一交易者数量
  SELECT COUNT(DISTINCT maker_address)
  INTO v_unique_traders
  FROM (
    -- 从订单表统计
    SELECT DISTINCT maker_address 
    FROM orders 
    WHERE market_id = v_market_id
    
    UNION
    
    -- 从成交表统计
    SELECT DISTINCT maker_address 
    FROM trades 
    WHERE market_id = v_market_id
    
    UNION
    
    SELECT DISTINCT taker_address 
    FROM trades 
    WHERE market_id = v_market_id
  ) AS all_traders;

  -- 统计该市场的总交易量（已成交金额）
  SELECT COALESCE(SUM(amount * price), 0)
  INTO v_total_volume
  FROM trades
  WHERE market_id = v_market_id;

  -- 更新 markets 表
  UPDATE markets
  SET 
    participants = v_unique_traders,
    volume = v_total_volume,
    updated_at = NOW()
  WHERE id = v_market_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建触发器：当订单创建时更新
DROP TRIGGER IF EXISTS trigger_update_market_stats_on_order ON orders;
CREATE TRIGGER trigger_update_market_stats_on_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_market_stats();

-- 3. 创建触发器：当交易成交时更新
DROP TRIGGER IF EXISTS trigger_update_market_stats_on_trade ON trades;
CREATE TRIGGER trigger_update_market_stats_on_trade
AFTER INSERT ON trades
FOR EACH ROW
EXECUTE FUNCTION update_market_stats();

-- 4. 手动触发一次，更新现有数据
-- 遍历所有市场，重新计算统计数据
DO $$
DECLARE
  market_record RECORD;
  v_unique_traders INTEGER;
  v_total_volume NUMERIC;
BEGIN
  FOR market_record IN SELECT id FROM markets LOOP
    -- 统计参与人数
    SELECT COUNT(DISTINCT maker_address)
    INTO v_unique_traders
    FROM (
      SELECT DISTINCT maker_address 
      FROM orders 
      WHERE market_id = market_record.id
      
      UNION
      
      SELECT DISTINCT maker_address 
      FROM trades 
      WHERE market_id = market_record.id
      
      UNION
      
      SELECT DISTINCT taker_address 
      FROM trades 
      WHERE market_id = market_record.id
    ) AS all_traders;

    -- 统计交易量
    SELECT COALESCE(SUM(amount * price), 0)
    INTO v_total_volume
    FROM trades
    WHERE market_id = market_record.id;

    -- 更新市场
    UPDATE markets
    SET 
      participants = v_unique_traders,
      volume = v_total_volume,
      updated_at = NOW()
    WHERE id = market_record.id;
    
    RAISE NOTICE '市场 % 更新完成: % 人参与, 交易量 $%', 
      market_record.id, v_unique_traders, v_total_volume;
  END LOOP;
END $$;

-- 5. 验证触发器
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%market_stats%';

-- 6. 显示更新后的市场统计
SELECT 
  id,
  title,
  participants,
  volume,
  main_category
FROM markets
ORDER BY id;






