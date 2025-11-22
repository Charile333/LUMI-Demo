// 🔧 直接通过代码添加外键约束
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function addForeignKey() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 添加外键约束');
    console.log('='.repeat(60) + '\n');

    // 步骤 1：检查是否已存在
    const checkFK = await pool.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'orders'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'fk_orders_market_id'
    `);

    if (checkFK.rows.length > 0) {
      console.log('⚠️  外键 fk_orders_market_id 已存在');
      console.log('   先删除旧的外键...\n');
      
      await pool.query(`
        ALTER TABLE orders
        DROP CONSTRAINT fk_orders_market_id
      `);
      
      console.log('✅ 旧外键已删除\n');
    }

    // 步骤 2：添加外键
    console.log('📝 正在添加外键约束...\n');
    
    await pool.query(`
      ALTER TABLE orders
      ADD CONSTRAINT fk_orders_market_id
      FOREIGN KEY (market_id)
      REFERENCES markets(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    console.log('✅ 外键约束添加成功！\n');

    // 步骤 3：验证
    const verify = await pool.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'orders'
    `);

    console.log('📋 当前外键关系：\n');
    verify.rows.forEach(fk => {
      console.log(`   ✅ ${fk.column_name} → ${fk.foreign_table}.${fk.foreign_column}`);
      console.log(`      删除规则: ${fk.delete_rule}`);
      console.log(`      约束名: ${fk.constraint_name}\n`);
    });

    // 步骤 4：刷新 Supabase Schema Cache
    console.log('💡 重要提示：\n');
    console.log('   Supabase 的 schema cache 可能需要一些时间更新');
    console.log('   如果 API 仍然报错，请：');
    console.log('   1. 等待 1-2 分钟');
    console.log('   2. 重启开发服务器：npm run dev');
    console.log('   3. 或访问 Supabase Dashboard 刷新页面\n');

    console.log('='.repeat(60));
    console.log('✅ 外键添加完成！');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    
    if (error.message.includes('violates foreign key constraint')) {
      console.log('\n⚠️  错误原因：有订单引用了不存在的 market_id');
      console.log('   请检查 orders 表中是否有无效的 market_id\n');
    }
  } finally {
    await pool.end();
  }
}

addForeignKey();



































