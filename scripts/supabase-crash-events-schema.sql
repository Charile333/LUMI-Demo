-- ============================================
-- 崩盘事件数据库架构（Vercel + Supabase）
-- ============================================

-- 1. 崩盘事件表（历史 + 实时）
CREATE TABLE IF NOT EXISTS crash_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  asset TEXT NOT NULL,                    -- BTC/USDT, ETH/USDT
  event_date DATE NOT NULL,               -- 事件日期
  event_name TEXT,                        -- 事件名称，如 "COVID黑色星期四"
  
  -- 时间信息（UTC）
  crash_start TIMESTAMPTZ NOT NULL,       -- 崩盘开始时间（最高点）
  lowest_point TIMESTAMPTZ NOT NULL,      -- 最低点时间
  crash_end TIMESTAMPTZ,                  -- 崩盘结束时间（恢复时间）
  
  -- 价格信息
  highest_price DECIMAL(20, 8) NOT NULL,  -- 最高价
  lowest_price DECIMAL(20, 8) NOT NULL,   -- 最低价
  recovery_price DECIMAL(20, 8),          -- 恢复价格
  
  -- 统计数据
  crash_percentage DECIMAL(10, 2) NOT NULL,  -- 崩盘幅度
  duration_hours INTEGER,                    -- 持续时间（小时）
  recovery_hours INTEGER,                    -- 恢复时间（小时）
  
  -- 额外数据（JSON格式）
  volume_data JSONB,                      -- 成交量数据
  metadata JSONB,                         -- 其他元数据
  
  -- 状态管理
  status TEXT NOT NULL DEFAULT 'detected', -- detected, verified, archived
  severity TEXT,                           -- low, medium, high, extreme
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  
  -- 索引
  CONSTRAINT crash_events_asset_date_unique UNIQUE(asset, event_date)
);

-- 2. 实时价格监控表（用于检测新崩盘）
CREATE TABLE IF NOT EXISTS price_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(30, 8),
  
  -- 24小时统计
  high_24h DECIMAL(20, 8),
  low_24h DECIMAL(20, 8),
  change_24h DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 索引优化
  CONSTRAINT price_monitoring_asset_timestamp_unique UNIQUE(asset, timestamp)
);

-- 3. 崩盘检测日志表
CREATE TABLE IF NOT EXISTS crash_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 检测数据
  price_drop_percent DECIMAL(10, 2),
  duration_minutes INTEGER,
  trigger_threshold DECIMAL(10, 2),
  
  -- 是否创建事件
  created_event BOOLEAN DEFAULT false,
  event_id UUID REFERENCES crash_events(id),
  
  -- 原始数据
  detection_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_crash_events_asset ON crash_events(asset);
CREATE INDEX IF NOT EXISTS idx_crash_events_date ON crash_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_crash_events_status ON crash_events(status);
CREATE INDEX IF NOT EXISTS idx_crash_events_severity ON crash_events(severity);

CREATE INDEX IF NOT EXISTS idx_price_monitoring_asset_time ON price_monitoring(asset, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_monitoring_timestamp ON price_monitoring(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_crash_detection_logs_asset ON crash_detection_logs(asset);
CREATE INDEX IF NOT EXISTS idx_crash_detection_logs_detected_at ON crash_detection_logs(detected_at DESC);

-- 5. 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE crash_events;
ALTER PUBLICATION supabase_realtime ADD TABLE price_monitoring;

-- 6. 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crash_events_updated_at
  BEFORE UPDATE ON crash_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 插入历史数据（从现有数据迁移）
INSERT INTO crash_events (
  asset, event_date, event_name,
  crash_start, lowest_point, crash_end,
  highest_price, lowest_price,
  crash_percentage, duration_hours,
  status, severity
) VALUES 
  -- BTC 2025-10-10
  ('BTC/USDT', '2025-10-10', 'BTC 1011事件',
   '2025-10-10T13:00:00Z', '2025-10-10T21:00:00Z', '2025-10-10T22:00:00Z',
   122550.00, 102000.00,
   -16.77, 8,
   'verified', 'high'),
   
  -- ETH 2025-10-10
  ('ETH/USDT', '2025-10-10', 'ETH 1011事件',
   '2025-10-10T01:00:00Z', '2025-10-10T21:00:00Z', '2025-10-10T22:00:00Z',
   4393.63, 3435.00,
   -21.82, 20,
   'verified', 'high'),
   
  -- FTT 2022-11-08
  ('FTT/USDT', '2022-11-08', 'FTX崩盘',
   '2022-11-07T08:00:00Z', '2022-11-09T23:00:00Z', '2022-11-09T23:00:00Z',
   23.90, 2.01,
   -91.58, 63,
   'verified', 'extreme'),
   
  -- BTC 2022-11-09
  ('BTC/USDT', '2022-11-09', 'BTC FTX崩盘',
   '2022-11-08T16:00:00Z', '2022-11-09T23:00:00Z', '2022-11-10T00:00:00Z',
   20700.88, 15588.00,
   -24.70, 31,
   'verified', 'high'),
   
  -- LUNA 2022-05-10
  ('LUNA/USDT', '2022-05-10', 'LUNA崩盘',
   '2022-05-08T00:00:00Z', '2022-05-11T12:00:00Z', '2022-05-11T13:00:00Z',
   68.54, 0.69,
   -98.99, 84,
   'verified', 'extreme'),
   
  -- BTC 2020-03-12
  ('BTC/USDT', '2020-03-12', 'COVID黑色星期四',
   '2020-03-11T22:00:00Z', '2020-03-13T02:00:00Z', '2020-03-13T03:00:00Z',
   7980.00, 3782.13,
   -52.60, 28,
   'verified', 'extreme')
ON CONFLICT (asset, event_date) DO UPDATE SET
  crash_start = EXCLUDED.crash_start,
  lowest_point = EXCLUDED.lowest_point,
  crash_end = EXCLUDED.crash_end,
  highest_price = EXCLUDED.highest_price,
  lowest_price = EXCLUDED.lowest_price,
  crash_percentage = EXCLUDED.crash_percentage,
  duration_hours = EXCLUDED.duration_hours;

-- 8. 查询视图
CREATE OR REPLACE VIEW crash_events_with_stats AS
SELECT 
  ce.*,
  EXTRACT(EPOCH FROM (lowest_point - crash_start)) / 3600 AS actual_crash_hours,
  EXTRACT(EPOCH FROM (crash_end - lowest_point)) / 3600 AS actual_recovery_hours,
  ABS(crash_percentage) AS abs_crash_percentage
FROM crash_events ce
ORDER BY ce.event_date DESC;

-- 9. 权限设置（如果使用RLS）
-- ALTER TABLE crash_events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "允许所有人读取崩盘事件" ON crash_events FOR SELECT USING (true);
-- CREATE POLICY "只允许认证用户创建" ON crash_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');





