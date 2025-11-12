-- 🔍 诊断数据库架构状态
-- 在 Supabase SQL Editor 中执行

-- 查看所有列
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'title', 'description') THEN '🟢 基础字段'
        WHEN column_name IN ('main_category', 'sub_category', 'status', 'blockchain_status', 'question_id', 'created_at', 'updated_at', 'priority_level', 'end_time', 'start_time') THEN '🟦 新架构字段'
        WHEN column_name IN ('categoryType', 'category', 'isActive', 'createdAt', 'updatedAt', 'priorityLevel', 'endDate') THEN '🟧 旧架构字段'
        ELSE '⚪ 其他字段'
    END as field_type
FROM information_schema.columns
WHERE table_name = 'markets'
ORDER BY ordinal_position;

-- 统计
SELECT 
    '新架构字段数' as type,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'markets'
    AND column_name IN ('main_category', 'sub_category', 'status', 'blockchain_status', 'question_id', 'created_at', 'updated_at', 'priority_level', 'end_time', 'start_time')

UNION ALL

SELECT 
    '旧架构字段数' as type,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'markets'
    AND column_name IN ('categoryType', 'category', 'isActive', 'createdAt', 'updatedAt', 'priorityLevel', 'endDate');











