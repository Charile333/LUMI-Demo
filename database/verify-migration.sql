-- ✅ 验证数据库迁移结果

-- 1. 检查字段是否存在
SELECT 
  '字段检查' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'main_category'
  ) THEN '✅ main_category 存在' ELSE '❌ main_category 缺失' END as main_category,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'status'
  ) THEN '✅ status 存在' ELSE '❌ status 缺失' END as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'question_id'
  ) THEN '✅ question_id 存在' ELSE '❌ question_id 缺失' END as question_id;

-- 2. 检查数据迁移情况
SELECT 
  '数据统计' as check_type,
  COUNT(*) as total_markets,
  COUNT(CASE WHEN main_category IS NOT NULL THEN 1 END) as has_main_category,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as has_status,
  COUNT(CASE WHEN question_id IS NOT NULL THEN 1 END) as has_question_id,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_markets
FROM markets;

-- 3. 按分类统计
SELECT 
  main_category,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM markets
GROUP BY main_category
ORDER BY count DESC;

-- 4. 查看 automotive 分类的市场
SELECT 
  id,
  title,
  main_category,
  status,
  question_id
FROM markets
WHERE main_category = 'automotive'
ORDER BY id;














