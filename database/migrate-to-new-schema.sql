-- 🔄 迁移数据库到新架构
-- 在 Supabase SQL Editor 中执行此脚本

-- ⚠️ 重要：请先备份数据库！

-- 1️⃣ 首先检查表是否存在旧字段
DO $$
BEGIN
    RAISE NOTICE '===== 开始检查表结构 =====';
END $$;

-- 查看当前表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'markets'
ORDER BY ordinal_position;

-- 2️⃣ 添加新架构字段（如果不存在）
DO $$
BEGIN
    -- 添加 image_url（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE markets ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ 已添加字段: image_url';
    ELSE
        RAISE NOTICE '⚠️ 字段已存在: image_url';
    END IF;

    -- 添加 outcome_type（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'outcome_type'
    ) THEN
        ALTER TABLE markets ADD COLUMN outcome_type TEXT DEFAULT 'binary';
        RAISE NOTICE '✅ 已添加字段: outcome_type';
    ELSE
        RAISE NOTICE '⚠️ 字段已存在: outcome_type';
    END IF;

    -- 添加 outcome_options（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'outcome_options'
    ) THEN
        ALTER TABLE markets ADD COLUMN outcome_options TEXT;
        RAISE NOTICE '✅ 已添加字段: outcome_options';
    ELSE
        RAISE NOTICE '⚠️ 字段已存在: outcome_options';
    END IF;

    -- 添加 numeric_min（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'numeric_min'
    ) THEN
        ALTER TABLE markets ADD COLUMN numeric_min DECIMAL;
        RAISE NOTICE '✅ 已添加字段: numeric_min';
    ELSE
        RAISE NOTICE '⚠️ 字段已存在: numeric_min';
    END IF;

    -- 添加 numeric_max（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'numeric_max'
    ) THEN
        ALTER TABLE markets ADD COLUMN numeric_max DECIMAL;
        RAISE NOTICE '✅ 已添加字段: numeric_max';
    ELSE
        RAISE NOTICE '⚠️ 字段已存在: numeric_max';
    END IF;

    RAISE NOTICE '===== 字段添加完成 =====';
END $$;

-- 3️⃣ 验证表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'markets'
    AND column_name IN (
        'image_url', 
        'outcome_type', 
        'outcome_options', 
        'numeric_min', 
        'numeric_max'
    )
ORDER BY ordinal_position;

-- 4️⃣ 检查必需字段是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'main_category'
    ) THEN
        RAISE EXCEPTION '❌ 错误：缺少必需字段 main_category，请先运行完整的新架构创建脚本！';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'question_id'
    ) THEN
        RAISE EXCEPTION '❌ 错误：缺少必需字段 question_id，请先运行完整的新架构创建脚本！';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'status'
    ) THEN
        RAISE EXCEPTION '❌ 错误：缺少必需字段 status，请先运行完整的新架构创建脚本！';
    END IF;

    RAISE NOTICE '✅ 所有必需字段检查通过';
END $$;

-- 5️⃣ 完成提示
DO $$
BEGIN
    RAISE NOTICE '===== 迁移完成 =====';
    RAISE NOTICE '✅ 现在可以使用创建市场功能了';
    RAISE NOTICE '💡 请刷新页面并重试创建市场';
END $$;

