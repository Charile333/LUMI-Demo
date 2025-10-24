-- 添加结果选项配置字段到 markets 表

ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS outcome_type TEXT DEFAULT 'binary' CHECK (outcome_type IN ('binary', 'multiple', 'numeric')),
ADD COLUMN IF NOT EXISTS outcome_options JSONB DEFAULT '["YES", "NO"]',
ADD COLUMN IF NOT EXISTS numeric_min DECIMAL,
ADD COLUMN IF NOT EXISTS numeric_max DECIMAL;

-- 添加注释
COMMENT ON COLUMN markets.outcome_type IS '结果类型：binary(二元), multiple(多选), numeric(数值)';
COMMENT ON COLUMN markets.outcome_options IS '结果选项数组，例如：["YES", "NO"] 或 ["选项1", "选项2", "选项3"]';
COMMENT ON COLUMN markets.numeric_min IS '数值型市场的最小值';
COMMENT ON COLUMN markets.numeric_max IS '数值型市场的最大值';

-- 完成
SELECT 'Outcome options fields added!' as status;


