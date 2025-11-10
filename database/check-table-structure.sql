-- 🔍 检查 markets 表的实际结构
-- 在 Supabase SQL Editor 中运行

-- 查看表的所有列
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'markets'
ORDER BY ordinal_position;

-- 查看几条实际数据，了解字段内容
SELECT * FROM markets LIMIT 3;











