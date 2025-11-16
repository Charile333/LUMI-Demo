-- 🔧 为 orders 表添加所有缺失的字段（一次性完整迁移）
-- 在 Supabase SQL Editor 中执行此脚本

-- 链上交易标识字段
ALTER TABLE orders ADD COLUMN IF NOT EXISTS condition_id VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_order_data JSONB;

-- 订单签名和安全字段
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expiration BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS salt VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nonce BIGINT;

-- 验证字段已添加
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN (
    'condition_id', 
    'ctf_signature', 
    'ctf_order_data',
    'expiration',
    'salt',
    'nonce'
  )
ORDER BY column_name;

-- 显示所有字段（用于验证）
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;


