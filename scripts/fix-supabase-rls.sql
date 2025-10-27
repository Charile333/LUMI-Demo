-- 🔧 Supabase RLS 快速修复脚本
-- 用于解决 Vercel 部署后无法访问数据库的问题
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- ==========================================
-- 方案1：临时禁用 RLS（快速测试用）
-- ==========================================
-- 注意：这会允许所有人访问数据，仅用于测试！

ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orderbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS balances DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS已禁用（测试模式）' as status;

-- ==========================================
-- 方案2：添加允许所有操作的策略（推荐）
-- ==========================================
-- 取消下面的注释来使用此方案

/*
-- 启用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow all on orders" ON orders;
DROP POLICY IF EXISTS "Allow all on orderbooks" ON orderbooks;
DROP POLICY IF EXISTS "Allow all on markets" ON markets;
DROP POLICY IF EXISTS "Allow all on alerts" ON alerts;

-- Orders 表策略
CREATE POLICY "Allow all on orders" 
ON orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Orderbooks 表策略
CREATE POLICY "Allow all on orderbooks" 
ON orderbooks 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Markets 表策略
CREATE POLICY "Allow all on markets" 
ON markets 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Alerts 表策略
CREATE POLICY "Allow all on alerts" 
ON alerts 
FOR ALL 
USING (true) 
WITH CHECK (true);

SELECT '✅ RLS策略已添加（推荐模式）' as status;
*/

-- ==========================================
-- 方案3：基于用户的策略（生产环境推荐）
-- ==========================================
-- 取消下面的注释来使用此方案

/*
-- 启用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderbooks ENABLE ROW LEVEL SECURITY;

-- Orders: 用户只能访问自己的订单
CREATE POLICY "Users can view own orders" 
ON orders 
FOR SELECT 
USING (user_address = auth.uid()::text);

CREATE POLICY "Users can create own orders" 
ON orders 
FOR INSERT 
WITH CHECK (user_address = auth.uid()::text);

-- Orderbooks: 所有人可读
CREATE POLICY "Public orderbooks read" 
ON orderbooks 
FOR SELECT 
USING (true);

-- Markets: 所有人可读
CREATE POLICY "Public markets read" 
ON markets 
FOR SELECT 
USING (true);

SELECT '✅ 基于用户的RLS策略已添加（生产模式）' as status;
*/

-- ==========================================
-- 验证脚本
-- ==========================================
-- 运行此查询检查RLS状态

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('orders', 'orderbooks', 'markets', 'alerts')
ORDER BY tablename;

-- 查看已有的策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

