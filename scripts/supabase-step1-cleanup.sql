-- ==========================================
-- 第 1 步：清理旧数据
-- ==========================================
-- 先删除视图（因为视图依赖表）
DROP VIEW IF EXISTS order_book_aggregated CASCADE;
DROP VIEW IF EXISTS market_statistics CASCADE;

-- 删除触发器
DROP TRIGGER IF EXISTS update_markets_updated_at ON markets CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders CASCADE;
DROP TRIGGER IF EXISTS update_balances_updated_at ON balances CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 删除表（按依赖关系倒序删除）
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS markets CASCADE;

-- 清理完成
SELECT 'Cleanup completed! Now run step 2.' as status;






