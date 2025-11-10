// 🔍 检查 orders 表是否存在及其结构
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkOrdersTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000, // 30秒超时
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n='.repeat(60));
    console.log('🔍 检查 orders 表');
    console.log('='.repeat(60) + '\n');

    // 1. 检查表是否存在
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ orders 表不存在！\n');
      console.log('💡 需要创建 orders 表。运行：');
      console.log('   node scripts/create-orders-table.js\n');
      return;
    }

    console.log('✅ orders 表存在\n');

    // 2. 检查表结构
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);

    console.log('📋 表结构：\n');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL    '}`);
    });

    // 3. 检查外键关系
    const foreignKeys = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'orders'
    `);

    console.log('\n🔗 外键关系：\n');
    if (foreignKeys.rows.length === 0) {
      console.log('   ❌ 没有外键关系！');
      console.log('   💡 这就是 Supabase 查询失败的原因\n');
    } else {
      foreignKeys.rows.forEach(fk => {
        console.log(`   ✅ ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
      console.log();
    }

    // 4. 统计订单数量
    const count = await pool.query('SELECT COUNT(*) as count FROM orders');
    console.log(`📊 订单数量: ${count.rows[0].count}\n`);

    // 5. 检查索引
    const indexes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders'
      ORDER BY indexname
    `);

    console.log('📑 索引：\n');
    indexes.rows.forEach(idx => {
      console.log(`   ${idx.indexname}`);
    });

    console.log('\n' + '='.repeat(60));
    
    // 给出建议
    if (foreignKeys.rows.length === 0) {
      console.log('\n⚠️  问题诊断：');
      console.log('   orders 表缺少外键关系');
      console.log('   这导致 Supabase 无法通过 market_id 自动 JOIN markets 表\n');
      console.log('💡 解决方案：');
      console.log('   1. 删除现有的 orders 表');
      console.log('   2. 运行正确的建表脚本\n');
      console.log('📝 运行以下命令修复：');
      console.log('   node scripts/recreate-orders-table.js\n');
    } else {
      console.log('\n✅ orders 表结构正常！');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrdersTable();

