-- 🔮 添加 UMA 预言机相关字段
-- 用于追踪市场结算状态

-- 1️⃣ 添加结算相关字段
DO $$ 
BEGIN
  -- 市场截止时间
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE markets ADD COLUMN end_date TIMESTAMPTZ;
    COMMENT ON COLUMN markets.end_date IS '市场截止时间';
  END IF;

  -- 结算请求时间
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'settlement_requested_at'
  ) THEN
    ALTER TABLE markets ADD COLUMN settlement_requested_at TIMESTAMPTZ;
    COMMENT ON COLUMN markets.settlement_requested_at IS 'UMA 预言机结算请求时间';
  END IF;

  -- 最终结算时间
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'settlement_resolved_at'
  ) THEN
    ALTER TABLE markets ADD COLUMN settlement_resolved_at TIMESTAMPTZ;
    COMMENT ON COLUMN markets.settlement_resolved_at IS '市场最终结算时间';
  END IF;

  -- 结算结果
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'settlement_result'
  ) THEN
    ALTER TABLE markets ADD COLUMN settlement_result VARCHAR(10);
    COMMENT ON COLUMN markets.settlement_result IS '结算结果: YES, NO, INVALID';
  END IF;

  -- 提案者地址
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'proposer_address'
  ) THEN
    ALTER TABLE markets ADD COLUMN proposer_address VARCHAR(42);
    COMMENT ON COLUMN markets.proposer_address IS 'UMA 提案者地址';
  END IF;

  -- 争议状态
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'is_disputed'
  ) THEN
    ALTER TABLE markets ADD COLUMN is_disputed BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN markets.is_disputed IS '是否被争议';
  END IF;
END $$;

-- 2️⃣ 创建索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_markets_end_date 
ON markets(end_date) 
WHERE end_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_markets_settlement_status 
ON markets(settlement_requested_at, settlement_resolved_at);

CREATE INDEX IF NOT EXISTS idx_markets_settlement_result 
ON markets(settlement_result) 
WHERE settlement_result IS NOT NULL;

-- 3️⃣ 创建函数：获取市场 UMA 状态
CREATE OR REPLACE FUNCTION get_market_oracle_status(p_market_id INTEGER)
RETURNS TABLE (
  state VARCHAR(20),
  can_settle BOOLEAN,
  can_resolve BOOLEAN,
  can_redeem BOOLEAN,
  time_until_end INTERVAL,
  time_until_challenge_end INTERVAL
) AS $$
DECLARE
  v_market RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_challenge_period INTERVAL := INTERVAL '2 hours';
BEGIN
  -- 获取市场信息
  SELECT * INTO v_market
  FROM markets
  WHERE id = p_market_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found: %', p_market_id;
  END IF;

  -- 判断状态
  IF v_market.settlement_result IS NOT NULL THEN
    -- 已结算
    RETURN QUERY SELECT 
      'resolved'::VARCHAR(20),
      FALSE,
      FALSE,
      TRUE,
      NULL::INTERVAL,
      NULL::INTERVAL;
      
  ELSIF v_market.settlement_requested_at IS NOT NULL THEN
    -- 结算请求中
    DECLARE
      v_challenge_end TIMESTAMPTZ := v_market.settlement_requested_at + v_challenge_period;
    BEGIN
      IF v_now >= v_challenge_end THEN
        -- 挑战期已过，可以最终确认
        RETURN QUERY SELECT 
          'proposed'::VARCHAR(20),
          FALSE,
          TRUE,
          FALSE,
          NULL::INTERVAL,
          INTERVAL '0';
      ELSE
        -- 挑战期中
        RETURN QUERY SELECT 
          'requested'::VARCHAR(20),
          FALSE,
          FALSE,
          FALSE,
          NULL::INTERVAL,
          v_challenge_end - v_now;
      END IF;
    END;
    
  ELSIF v_market.end_date IS NOT NULL AND v_now >= v_market.end_date THEN
    -- 已到期，等待结算
    RETURN QUERY SELECT 
      'ended'::VARCHAR(20),
      TRUE,
      FALSE,
      FALSE,
      INTERVAL '0',
      NULL::INTERVAL;
      
  ELSE
    -- 交易中
    RETURN QUERY SELECT 
      'active'::VARCHAR(20),
      FALSE,
      FALSE,
      FALSE,
      CASE 
        WHEN v_market.end_date IS NOT NULL THEN v_market.end_date - v_now
        ELSE NULL
      END,
      NULL::INTERVAL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ 创建函数：批量获取 UMA 状态
CREATE OR REPLACE FUNCTION get_markets_oracle_status_batch(p_market_ids INTEGER[])
RETURNS TABLE (
  market_id INTEGER,
  state VARCHAR(20),
  can_settle BOOLEAN,
  can_resolve BOOLEAN,
  can_redeem BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    CASE
      WHEN m.settlement_result IS NOT NULL THEN 'resolved'
      WHEN m.settlement_requested_at IS NOT NULL THEN
        CASE 
          WHEN NOW() >= m.settlement_requested_at + INTERVAL '2 hours' THEN 'proposed'
          ELSE 'requested'
        END
      WHEN m.end_date IS NOT NULL AND NOW() >= m.end_date THEN 'ended'
      ELSE 'active'
    END::VARCHAR(20),
    
    (m.end_date IS NOT NULL AND NOW() >= m.end_date AND m.settlement_requested_at IS NULL)::BOOLEAN,
    (m.settlement_requested_at IS NOT NULL AND NOW() >= m.settlement_requested_at + INTERVAL '2 hours' AND m.settlement_result IS NULL)::BOOLEAN,
    (m.settlement_result IS NOT NULL)::BOOLEAN
    
  FROM markets m
  WHERE m.id = ANY(p_market_ids);
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ 测试函数
-- SELECT * FROM get_market_oracle_status(1);
-- SELECT * FROM get_markets_oracle_status_batch(ARRAY[1, 2, 3]);

-- 6️⃣ 添加示例数据（可选）
-- UPDATE markets 
-- SET end_date = NOW() + INTERVAL '7 days'
-- WHERE end_date IS NULL;

COMMENT ON FUNCTION get_market_oracle_status IS '获取单个市场的 UMA 预言机状态';
COMMENT ON FUNCTION get_markets_oracle_status_batch IS '批量获取市场的 UMA 预言机状态';

-- 完成
SELECT '✅ UMA 预言机字段和函数已创建' as status;





























