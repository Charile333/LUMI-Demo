// 🔍 直接查询数据库验证外键
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verifyForeignKey() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 验证外键关系');
    console.log('='.repeat(60) + '\n');

    // 检查外键约束
    const result = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'orders'
    `);

    if (result.rows.length === 0) {
      console.log('❌ 没有找到外键约束！\n');
      console.log('这很奇怪，因为 Supabase Dashboard 显示已添加。');
      console.log('可能是在不同的 schema 或数据库。\n');
    } else {
      console.log('✅ 找到外键约束：\n');
      result.rows.forEach(fk => {
        console.log(`   约束名称: ${fk.constraint_name}`);
        console.log(`   表: ${fk.table_name}.${fk.column_name}`);
        console.log(`   引用: ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        console.log(`   删除规则: ${fk.delete_rule}`);
        console.log(`   更新规则: ${fk.update_rule}\n`);
      });
    }

    // 测试关联查询
    console.log('🔗 测试关联查询...\n');
    const testQuery = await pool.query(`
      SELECT 
        o.id,
        o.market_id,
        m.title as market_title,
        m.main_category
      FROM orders o
      LEFT JOIN markets m ON o.market_id = m.id
      LIMIT 5
    `);

    if (testQuery.rows.length > 0) {
      console.log('✅ SQL JOIN 查询正常工作！\n');
      console.log('示例数据：');
      testQuery.rows.forEach(row => {
        console.log(`   订单 ${row.id}: 市场 ${row.market_id} - ${row.market_title || '未找到'}`);
      });
    } else {
      console.log('⚠️  没有订单数据');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 验证完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await pool.end();
  }
}

verifyForeignKey();
















