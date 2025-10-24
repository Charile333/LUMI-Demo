// 测试 Supabase 数据库连接
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testConnection() {
  console.log('\n=== 🧪 测试 Supabase 连接 ===\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误：DATABASE_URL 未配置');
    console.log('请在 .env.local 文件中设置 DATABASE_URL');
    process.exit(1);
  }

  // 隐藏密码显示
  const urlPreview = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log('📡 连接地址:', urlPreview);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // 测试基本连接
    console.log('\n1️⃣ 测试基本连接...');
    const timeResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ 连接成功！');
    console.log('⏰ 服务器时间:', timeResult.rows[0].current_time);

    // 检查表是否存在
    console.log('\n2️⃣ 检查表结构...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`✅ 找到 ${tables.length} 个表:`);
    tables.forEach(table => console.log(`   - ${table}`));

    const expectedTables = ['markets', 'orders', 'trades', 'settlements', 'balances', 'users', 'activity_logs'];
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  缺少表:', missingTables.join(', '));
    } else {
      console.log('\n✅ 所有必需的表都存在！');
    }

    // 检查视图
    console.log('\n3️⃣ 检查视图...');
    const viewsResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const views = viewsResult.rows.map(r => r.table_name);
    console.log(`✅ 找到 ${views.length} 个视图:`);
    views.forEach(view => console.log(`   - ${view}`));

    // 测试简单查询
    console.log('\n4️⃣ 测试查询功能...');
    const countResult = await pool.query('SELECT COUNT(*) as count FROM markets');
    console.log(`✅ markets 表当前有 ${countResult.rows[0].count} 条记录`);

    console.log('\n🎉 所有测试通过！数据库配置正确！\n');

  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    console.log('\n可能的原因:');
    console.log('1. 连接字符串格式不正确');
    console.log('2. 密码包含特殊字符需要 URL 编码');
    console.log('3. 网络无法访问 Supabase');
    console.log('4. 使用了 Session mode 而不是 Connection pooling');
    console.log('\n请检查 .env.local 中的 DATABASE_URL 配置\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();






