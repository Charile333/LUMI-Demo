-- 🧠 智能迁移脚本 - 自动处理混合状态
-- 在 Supabase SQL Editor 中执行

DO $$
DECLARE
    has_old_categoryType BOOLEAN;
    has_new_main_category BOOLEAN;
    has_old_isActive BOOLEAN;
    has_new_status BOOLEAN;
    has_question_id BOOLEAN;
BEGIN
    RAISE NOTICE '===== 开始智能迁移 =====';
    
    -- 检测当前状态
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'categoryType'
    ) INTO has_old_categoryType;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'main_category'
    ) INTO has_new_main_category;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'isActive'
    ) INTO has_old_isActive;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'status'
    ) INTO has_new_status;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'question_id'
    ) INTO has_question_id;
    
    RAISE NOTICE '当前状态检测:';
    RAISE NOTICE '  旧字段 categoryType: %', has_old_categoryType;
    RAISE NOTICE '  新字段 main_category: %', has_new_main_category;
    RAISE NOTICE '  旧字段 isActive: %', has_old_isActive;
    RAISE NOTICE '  新字段 status: %', has_new_status;
    RAISE NOTICE '  新字段 question_id: %', has_question_id;
    
    -- 情况1: 都有 categoryType 和 main_category
    IF has_old_categoryType AND has_new_main_category THEN
        RAISE NOTICE '>>> 发现同时存在旧字段和新字段';
        
        -- 将旧字段数据复制到新字段（如果新字段为空）
        EXECUTE 'UPDATE markets SET main_category = "categoryType" WHERE main_category IS NULL AND "categoryType" IS NOT NULL';
        RAISE NOTICE '✅ 已从 categoryType 复制数据到 main_category';
        
        -- 删除旧字段
        EXECUTE 'ALTER TABLE markets DROP COLUMN "categoryType"';
        RAISE NOTICE '✅ 已删除旧字段 categoryType';
        
    ELSIF has_old_categoryType AND NOT has_new_main_category THEN
        -- 只有旧字段，重命名
        EXECUTE 'ALTER TABLE markets RENAME COLUMN "categoryType" TO main_category';
        RAISE NOTICE '✅ 重命名: categoryType -> main_category';
        
    ELSIF NOT has_old_categoryType AND has_new_main_category THEN
        -- 只有新字段，正常
        RAISE NOTICE '✅ 已经使用新字段 main_category';
    END IF;
    
    -- 处理 isActive 和 status
    IF has_old_isActive AND has_new_status THEN
        -- 同时存在
        EXECUTE 'UPDATE markets SET status = CASE WHEN "isActive" THEN ''active'' ELSE ''cancelled'' END WHERE status IS NULL';
        RAISE NOTICE '✅ 已从 isActive 迁移数据到 status';
        
        EXECUTE 'ALTER TABLE markets DROP COLUMN "isActive"';
        RAISE NOTICE '✅ 已删除旧字段 isActive';
        
    ELSIF has_old_isActive AND NOT has_new_status THEN
        -- 只有旧字段，需要创建新字段
        EXECUTE 'ALTER TABLE markets ADD COLUMN status TEXT';
        EXECUTE 'UPDATE markets SET status = CASE WHEN "isActive" THEN ''active'' ELSE ''cancelled'' END';
        EXECUTE 'ALTER TABLE markets DROP COLUMN "isActive"';
        RAISE NOTICE '✅ 创建 status 并迁移 isActive 数据';
    END IF;
    
    -- 添加 question_id（如果不存在）
    IF NOT has_question_id THEN
        EXECUTE 'ALTER TABLE markets ADD COLUMN question_id TEXT';
        EXECUTE 'UPDATE markets SET question_id = ''migrated-'' || id::text WHERE question_id IS NULL';
        EXECUTE 'ALTER TABLE markets ALTER COLUMN question_id SET NOT NULL';
        EXECUTE 'ALTER TABLE markets ADD CONSTRAINT markets_question_id_key UNIQUE (question_id)';
        RAISE NOTICE '✅ 已添加 question_id 字段';
    ELSE
        RAISE NOTICE '✅ question_id 字段已存在';
    END IF;
    
    -- 添加 blockchain_status（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'blockchain_status'
    ) THEN
        EXECUTE 'ALTER TABLE markets ADD COLUMN blockchain_status TEXT DEFAULT ''not_created''';
        RAISE NOTICE '✅ 已添加 blockchain_status';
    END IF;
    
    -- 添加 tags（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'tags'
    ) THEN
        EXECUTE 'ALTER TABLE markets ADD COLUMN tags TEXT[]';
        RAISE NOTICE '✅ 已添加 tags';
    END IF;
    
    -- 添加 reward_amount（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'reward_amount'
    ) THEN
        EXECUTE 'ALTER TABLE markets ADD COLUMN reward_amount DECIMAL DEFAULT 10';
        RAISE NOTICE '✅ 已添加 reward_amount';
    END IF;
    
    -- 处理其他常见的字段重命名
    -- sub_category
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'category')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'sub_category')
    THEN
        EXECUTE 'ALTER TABLE markets RENAME COLUMN category TO sub_category';
        RAISE NOTICE '✅ 重命名: category -> sub_category';
    END IF;
    
    -- created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'createdAt')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'created_at')
    THEN
        EXECUTE 'ALTER TABLE markets RENAME COLUMN "createdAt" TO created_at';
        RAISE NOTICE '✅ 重命名: createdAt -> created_at';
    END IF;
    
    -- updated_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'updatedAt')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'updated_at')
    THEN
        EXECUTE 'ALTER TABLE markets RENAME COLUMN "updatedAt" TO updated_at';
        RAISE NOTICE '✅ 重命名: updatedAt -> updated_at';
    END IF;
    
    -- priority_level
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'priorityLevel')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'priority_level')
    THEN
        EXECUTE 'ALTER TABLE markets RENAME COLUMN "priorityLevel" TO priority_level';
        RAISE NOTICE '✅ 重命名: priorityLevel -> priority_level';
    END IF;
    
    -- 处理 end_time
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'endDate')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markets' AND column_name = 'end_time')
    THEN
        EXECUTE 'ALTER TABLE markets ADD COLUMN end_time TIMESTAMP';
        EXECUTE 'UPDATE markets SET end_time = "endDate"::TIMESTAMP WHERE "endDate" IS NOT NULL AND "endDate" != ''''';
        EXECUTE 'ALTER TABLE markets DROP COLUMN "endDate"';
        RAISE NOTICE '✅ 迁移: endDate (TEXT) -> end_time (TIMESTAMP)';
    END IF;
    
    RAISE NOTICE '===== 智能迁移完成 =====';
    
END $$;

-- 显示最终结构
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'markets'
ORDER BY ordinal_position;

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE '🎉 迁移成功！';
    RAISE NOTICE '💡 现在可以创建市场了';
END $$;














