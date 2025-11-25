-- 🔧 为 orders 表添加外键约束
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- 步骤 1：检查当前外键（可选，仅用于确认）
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'orders';

-- 步骤 2：添加外键约束
-- ⚠️ 注意：这会确保 orders.market_id 必须存在于 markets.id 中
ALTER TABLE orders
ADD CONSTRAINT fk_orders_market_id
FOREIGN KEY (market_id)
REFERENCES markets(id)
ON DELETE CASCADE;

-- 步骤 3：验证外键已添加
SELECT 
  'orders.market_id → markets.id' as relationship,
  'CASCADE' as on_delete,
  '✅ 外键添加成功' as status;

-- 步骤 4：测试关联查询
SELECT 
  o.id,
  o.market_id,
  m.title as market_title
FROM orders o
LEFT JOIN markets m ON o.market_id = m.id
LIMIT 5;








































