-- 🔍 检查 markets 表的实际字段结构
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 查看 markets 表的所有列
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'markets'
ORDER BY ordinal_position;

-- 2. 检查是否存在 created_at 字段
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'markets'
  AND column_name = 'created_at'
) as has_created_at_field;

-- 3. 检查是否存在 createdAt 字段（驼峰命名）
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'markets'
  AND column_name = 'createdAt'
) as has_createdAt_field;

-- 4. 查看 markets 表的示例数据（前5条）
SELECT * FROM markets LIMIT 5;

