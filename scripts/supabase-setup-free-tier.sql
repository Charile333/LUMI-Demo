-- ============================================
-- 崩盘事件数据库架构（免费版 - 无需Realtime）
-- ============================================

-- 1. 崩盘事件表
CREATE TABLE IF NOT EXISTS crash_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  asset TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_name TEXT,
  
  -- 时间信息（UTC）
  crash_start TIMESTAMPTZ NOT NULL,
  lowest_point TIMESTAMPTZ NOT NULL,
  crash_end TIMESTAMPTZ,
  
  -- 价格信息
  highest_price DECIMAL(20, 8) NOT NULL,
  lowest_price DECIMAL(20, 8) NOT NULL,
  recovery_price DECIMAL(20, 8),
  
  -- 统计数据
  crash_percentage DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER,
  recovery_hours INTEGER,
  
  -- 额外数据
  volume_data JSONB,
  metadata JSONB,
  
  -- 状态管理
  status TEXT NOT NULL DEFAULT 'detected',
  severity TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  
  -- 唯一约束
  CONSTRAINT crash_events_asset_date_unique UNIQUE(asset, event_date)
);

-- 2. 价格监控表
CREATE TABLE IF NOT EXISTS price_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(30, 8),
  
  high_24h DECIMAL(20, 8),
  low_24h DECIMAL(20, 8),
  change_24h DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT price_monitoring_asset_timestamp_unique UNIQUE(asset, timestamp)
);

-- 3. 检测日志表
CREATE TABLE IF NOT EXISTS crash_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  price_drop_percent DECIMAL(10, 2),
  duration_minutes INTEGER,
  trigger_threshold DECIMAL(10, 2),
  
  created_event BOOLEAN DEFAULT false,
  event_id UUID REFERENCES crash_events(id),
  
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

-- 5. 自动更新 updated_at
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

-- 6. 插入历史数据
INSERT INTO crash_events (
  asset, event_date, event_name,
  crash_start, lowest_point, crash_end,
  highest_price, lowest_price,
  crash_percentage, duration_hours,
  status, severity
) VALUES 
  ('BTC/USDT', '2025-10-10', 'BTC 1011事件',
   '2025-10-10T13:00:00Z', '2025-10-10T21:00:00Z', '2025-10-10T22:00:00Z',
   122550.00, 102000.00, -16.77, 8, 'verified', 'high'),
   
  ('ETH/USDT', '2025-10-10', 'ETH 1011事件',
   '2025-10-10T01:00:00Z', '2025-10-10T21:00:00Z', '2025-10-10T22:00:00Z',
   4393.63, 3435.00, -21.82, 20, 'verified', 'high'),
   
  ('FTT/USDT', '2022-11-08', 'FTX崩盘',
   '2022-11-07T08:00:00Z', '2022-11-09T23:00:00Z', '2022-11-09T23:00:00Z',
   23.90, 2.01, -91.58, 63, 'verified', 'extreme'),
   
  ('BTC/USDT', '2022-11-09', 'BTC FTX崩盘',
   '2022-11-08T16:00:00Z', '2022-11-09T23:00:00Z', '2022-11-10T00:00:00Z',
   20700.88, 15588.00, -24.70, 31, 'verified', 'high'),
   
  ('LUNA/USDT', '2022-05-10', 'LUNA崩盘',
   '2022-05-08T00:00:00Z', '2022-05-11T12:00:00Z', '2022-05-11T13:00:00Z',
   68.54, 0.69, -98.99, 84, 'verified', 'extreme'),
   
  ('BTC/USDT', '2020-03-12', 'COVID黑色星期四',
   '2020-03-11T22:00:00Z', '2020-03-13T02:00:00Z', '2020-03-13T03:00:00Z',
   7980.00, 3782.13, -52.60, 28, 'verified', 'extreme')
ON CONFLICT (asset, event_date) DO NOTHING;

-- 7. 验证数据
SELECT 
  asset, 
  event_date, 
  event_name,
  crash_percentage, 
  severity 
FROM crash_events 
ORDER BY event_date DESC;






