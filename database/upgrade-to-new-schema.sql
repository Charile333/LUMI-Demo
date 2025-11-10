-- 🔄 将旧架构升级到新架构
-- ⚠️ 在 Supabase SQL Editor 中执行此脚本
-- ⚠️ 建议先备份数据库！

-- ==========================================
-- 第一步：检查表是否存在
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'markets') THEN
        RAISE EXCEPTION '❌ markets 表不存在！请先创建表';
    END IF;
    RAISE NOTICE '✅ markets 表存在';
END $$;

-- ==========================================
-- 第二步：重命名列（从驼峰到下划线）
-- ==========================================
DO $$
BEGIN
    -- categoryType -> main_category
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'categoryType'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "categoryType" TO main_category;
        RAISE NOTICE '✅ 重命名: categoryType -> main_category';
    END IF;

    -- category -> sub_category
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'category'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'sub_category'
    ) THEN
        ALTER TABLE markets RENAME COLUMN category TO sub_category;
        RAISE NOTICE '✅ 重命名: category -> sub_category';
    END IF;

    -- createdAt -> created_at
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "createdAt" TO created_at;
        RAISE NOTICE '✅ 重命名: createdAt -> created_at';
    END IF;

    -- updatedAt -> updated_at
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "updatedAt" TO updated_at;
        RAISE NOTICE '✅ 重命名: updatedAt -> updated_at';
    END IF;

    -- priorityLevel -> priority_level
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'priorityLevel'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "priorityLevel" TO priority_level;
        RAISE NOTICE '✅ 重命名: priorityLevel -> priority_level';
    END IF;

    -- endDate -> end_time (先重命名，后面改类型)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'endDate'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "endDate" TO end_time_temp;
        RAISE NOTICE '✅ 重命名: endDate -> end_time_temp';
    END IF;

    -- volumeNum -> volume (如果需要)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'volumeNum'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'volume'
    ) THEN
        ALTER TABLE markets RENAME COLUMN "volumeNum" TO volume;
        RAISE NOTICE '✅ 重命名: volumeNum -> volume';
    END IF;

    RAISE NOTICE '===== 重命名完成 =====';
END $$;

-- ==========================================
-- 第三步：添加新架构必需字段
-- ==========================================
DO $$
BEGIN
    -- 添加 question_id（必需）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'question_id'
    ) THEN
        ALTER TABLE markets ADD COLUMN question_id TEXT;
        -- 为现有记录生成 question_id
        UPDATE markets SET question_id = 'migrated-' || id::text WHERE question_id IS NULL;
        -- 设置为唯一且非空
        ALTER TABLE markets ALTER COLUMN question_id SET NOT NULL;
        ALTER TABLE markets ADD CONSTRAINT markets_question_id_key UNIQUE (question_id);
        RAISE NOTICE '✅ 已添加字段: question_id';
    END IF;

    -- 添加 status（替代 isActive）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'status'
    ) THEN
        ALTER TABLE markets ADD COLUMN status TEXT DEFAULT 'draft';
        
        -- 从 isActive 迁移数据
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'markets' AND column_name = 'isActive'
        ) THEN
            UPDATE markets SET status = CASE WHEN "isActive" THEN 'active' ELSE 'cancelled' END;
            RAISE NOTICE '✅ 已从 isActive 迁移数据到 status';
        END IF;
        
        RAISE NOTICE '✅ 已添加字段: status';
    END IF;

    -- 添加 blockchain_status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'blockchain_status'
    ) THEN
        ALTER TABLE markets ADD COLUMN blockchain_status TEXT DEFAULT 'not_created';
        RAISE NOTICE '✅ 已添加字段: blockchain_status';
    END IF;

    -- 添加 image_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE markets ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ 已添加字段: image_url';
    END IF;

    -- 添加 tags
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'tags'
    ) THEN
        ALTER TABLE markets ADD COLUMN tags TEXT[];
        RAISE NOTICE '✅ 已添加字段: tags';
    END IF;

    -- 添加时间字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE markets ADD COLUMN start_time TIMESTAMP;
        RAISE NOTICE '✅ 已添加字段: start_time';
    END IF;

    -- 添加新的 end_time（TIMESTAMP 类型）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE markets ADD COLUMN end_time TIMESTAMP;
        
        -- 从 end_time_temp 迁移数据
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'markets' AND column_name = 'end_time_temp'
        ) THEN
            UPDATE markets 
            SET end_time = end_time_temp::TIMESTAMP 
            WHERE end_time_temp IS NOT NULL AND end_time_temp != '';
            RAISE NOTICE '✅ 已从 end_time_temp 迁移数据';
        END IF;
        
        RAISE NOTICE '✅ 已添加字段: end_time (TIMESTAMP)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'resolution_time'
    ) THEN
        ALTER TABLE markets ADD COLUMN resolution_time TIMESTAMP;
        RAISE NOTICE '✅ 已添加字段: resolution_time';
    END IF;

    -- 添加区块链相关字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'condition_id'
    ) THEN
        ALTER TABLE markets ADD COLUMN condition_id TEXT;
        RAISE NOTICE '✅ 已添加字段: condition_id';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'adapter_address'
    ) THEN
        ALTER TABLE markets ADD COLUMN adapter_address TEXT;
        RAISE NOTICE '✅ 已添加字段: adapter_address';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'reward_amount'
    ) THEN
        ALTER TABLE markets ADD COLUMN reward_amount DECIMAL DEFAULT 10;
        RAISE NOTICE '✅ 已添加字段: reward_amount';
    END IF;

    -- 添加统计字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'liquidity'
    ) THEN
        ALTER TABLE markets ADD COLUMN liquidity DECIMAL DEFAULT 0;
        RAISE NOTICE '✅ 已添加字段: liquidity';
    END IF;

    RAISE NOTICE '===== 字段添加完成 =====';
END $$;

-- ==========================================
-- 第四步：删除旧字段（可选）
-- ==========================================
DO $$
BEGIN
    -- 删除 isActive（已被 status 替代）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE markets DROP COLUMN "isActive";
        RAISE NOTICE '✅ 已删除旧字段: isActive';
    END IF;

    -- 删除 end_time_temp
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'end_time_temp'
    ) THEN
        ALTER TABLE markets DROP COLUMN end_time_temp;
        RAISE NOTICE '✅ 已删除临时字段: end_time_temp';
    END IF;

    -- 删除其他旧字段（如果存在且不需要）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'isHomepage'
    ) THEN
        ALTER TABLE markets DROP COLUMN "isHomepage";
        RAISE NOTICE '✅ 已删除旧字段: isHomepage';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'isHot'
    ) THEN
        ALTER TABLE markets DROP COLUMN "isHot";
        RAISE NOTICE '✅ 已删除旧字段: isHot';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'isTrending'
    ) THEN
        ALTER TABLE markets DROP COLUMN "isTrending";
        RAISE NOTICE '✅ 已删除旧字段: isTrending';
    END IF;

    RAISE NOTICE '===== 旧字段清理完成 =====';
END $$;

-- ==========================================
-- 第五步：创建索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_main_category ON markets(main_category);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_markets_question_id ON markets(question_id);
CREATE INDEX IF NOT EXISTS idx_markets_blockchain_status ON markets(blockchain_status);

-- ==========================================
-- 第六步：验证迁移结果
-- ==========================================
DO $$
DECLARE
    column_count INT;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'markets'
        AND column_name IN (
            'id', 'question_id', 'title', 'description',
            'main_category', 'sub_category', 'status',
            'blockchain_status', 'created_at', 'updated_at'
        );

    IF column_count >= 10 THEN
        RAISE NOTICE '===== ✅ 迁移成功！ =====';
        RAISE NOTICE '所有必需字段已存在';
    ELSE
        RAISE WARNING '⚠️ 某些必需字段可能缺失，请检查';
    END IF;
END $$;

-- 显示最终表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'markets'
ORDER BY ordinal_position;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '===== 🎉 数据库升级完成！ =====';
    RAISE NOTICE '✅ 已从旧架构升级到新架构';
    RAISE NOTICE '✅ 字段名已标准化（下划线命名）';
    RAISE NOTICE '✅ 已添加区块链集成字段';
    RAISE NOTICE '💡 现在可以使用完整功能创建市场了';
    RAISE NOTICE '💡 请刷新页面并重试创建市场';
END $$;

