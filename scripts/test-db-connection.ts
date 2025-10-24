// 🧪 测试数据库连接

import { db, testConnection } from '../lib/db';

async function main() {
  console.log('🧪 测试数据库连接...\n');
  
  try {
    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('数据库连接失败');
    }
    
    // 2. 检查表是否存在
    console.log('\n2️⃣ 检查数据库表...');
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log('📋 已创建的表:', tables);
    
    const expectedTables = [
      'markets',
      'orders',
      'trades',
      'settlements',
      'balances',
      'users',
      'activity_logs'
    ];
    
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.warn('⚠️  缺少表:', missingTables);
      console.log('\n请运行以下命令创建表:');
      console.log('psql $DATABASE_URL -f scripts/setup-database.sql');
    } else {
      console.log('✅ 所有必需的表都已创建！');
    }
    
    // 3. 检查视图
    console.log('\n3️⃣ 检查视图...');
    const viewsResult = await db.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `);
    
    const views = viewsResult.rows.map(r => r.table_name);
    console.log('👁️  已创建的视图:', views);
    
    // 4. 测试插入和查询
    console.log('\n4️⃣ 测试基本操作...');
    
    // 插入测试市场
    const testMarket = {
      questionId: `test_${Date.now()}`,
      title: '测试市场',
      description: '这是一个测试市场',
      mainCategory: 'emerging',
      status: 'draft'
    };
    
    const insertResult = await db.query(`
      INSERT INTO markets (question_id, title, description, main_category, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, question_id, title
    `, [
      testMarket.questionId,
      testMarket.title,
      testMarket.description,
      testMarket.mainCategory,
      testMarket.status
    ]);
    
    console.log('✅ 插入测试市场:', insertResult.rows[0]);
    
    // 查询市场
    const selectResult = await db.query(`
      SELECT * FROM markets WHERE question_id = $1
    `, [testMarket.questionId]);
    
    console.log('✅ 查询测试市场:', selectResult.rows[0]);
    
    // 删除测试市场
    await db.query(`
      DELETE FROM markets WHERE question_id = $1
    `, [testMarket.questionId]);
    
    console.log('✅ 删除测试市场');
    
    // 5. 统计信息
    console.log('\n5️⃣ 数据库统计...');
    
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM markets) as market_count,
        (SELECT COUNT(*) FROM orders) as order_count,
        (SELECT COUNT(*) FROM trades) as trade_count,
        (SELECT COUNT(*) FROM settlements) as settlement_count,
        (SELECT COUNT(*) FROM balances) as balance_count
    `);
    
    console.log('📊 数据统计:');
    console.log('   - 市场数:', stats.rows[0].market_count);
    console.log('   - 订单数:', stats.rows[0].order_count);
    console.log('   - 成交数:', stats.rows[0].trade_count);
    console.log('   - 结算批次:', stats.rows[0].settlement_count);
    console.log('   - 余额记录:', stats.rows[0].balance_count);
    
    console.log('\n✅ 数据库测试全部通过！');
    console.log('🚀 可以开始使用 CLOB 系统了！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  } finally {
    await db.close();
    process.exit(0);
  }
}

main();







