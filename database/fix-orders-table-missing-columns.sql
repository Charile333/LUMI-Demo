-- 🔧 修复 orders 表缺失的基本字段
-- 在 Supabase SQL Editor 中执行此脚本

-- 添加 order_id（必需字段）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id VARCHAR(100);

-- 如果表中已有数据但 order_id 为空，设置默认值
UPDATE orders 
SET order_id = 'order-' || id || '-' || EXTRACT(EPOCH FROM created_at)::BIGINT
WHERE order_id IS NULL OR order_id = '';

-- 现在设置 NOT NULL 和 UNIQUE 约束（如果有数据可能会失败，先备份）
-- 注意：如果表中有重复的 order_id，需要先清理
DO $$
BEGIN
    -- 尝试添加 UNIQUE 约束（如果失败，说明有重复数据）
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_order_id_key'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_order_id_key UNIQUE (order_id);
    END IF;
END $$;

-- 设置 NOT NULL（只有在所有行都有值时才能成功）
-- 如果失败，说明还有 NULL 值，需要先处理
DO $$
BEGIN
    ALTER TABLE orders ALTER COLUMN order_id SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '无法设置 order_id 为 NOT NULL，可能存在 NULL 值';
END $$;

-- 添加 question_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS question_id VARCHAR(200);

-- 添加 outcome（INT 类型，0 或 1）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS outcome INTEGER DEFAULT 0;

-- 添加 outcome 约束（只能是 0 或 1）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_outcome_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_outcome_check CHECK (outcome IN (0, 1));
    END IF;
END $$;

-- 添加 signature
ALTER TABLE orders ADD COLUMN IF NOT EXISTS signature TEXT;

-- 验证字段已添加
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('order_id', 'question_id', 'outcome', 'signature')
ORDER BY column_name;

