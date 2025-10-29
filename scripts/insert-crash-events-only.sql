-- 仅插入崩盘事件数据（如果表已存在但没有数据）

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
  duration_hours = EXCLUDED.duration_hours,
  status = EXCLUDED.status,
  severity = EXCLUDED.severity;

-- 查询确认
SELECT 
  asset, 
  event_date, 
  event_name,
  crash_percentage, 
  severity, 
  status 
FROM crash_events 
ORDER BY event_date DESC;






