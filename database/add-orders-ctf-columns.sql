-- 🔧 为 orders 表添加链上交易相关字段
-- 在 Supabase SQL Editor 中执行此脚本

ALTER TABLE orders ADD COLUMN IF NOT EXISTS condition_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_order_data JSONB;

-- 验证字段已添加
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('condition_id', 'ctf_signature', 'ctf_order_data');


