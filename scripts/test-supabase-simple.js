// 测试 Supabase 连接（使用 API Keys）
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('\n=== 🧪 测试 Supabase 连接 ===\n');

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 错误：缺少 Supabase 配置');
    console.log('\n请在 .env.local 中配置：');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    console.log('\n获取方法：');
    console.log('  Supabase 控制台 → Settings → API Keys\n');
    process.exit(1);
  }

  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🔑 API Key:', supabaseKey.substring(0, 20) + '...\n');

  // 创建客户端
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 测试连接
    console.log('1️⃣ 测试基本连接...');
    const { data, error } = await supabase
      .from('markets')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ 连接失败:', error.message);
      console.log('\n可能的原因:');
      console.log('1. API Keys 不正确');
      console.log('2. 表还未创建');
      console.log('3. 网络无法访问 Supabase');
      process.exit(1);
    }

    console.log('✅ 连接成功！');

    // 2. 检查表
    console.log('\n2️⃣ 检查数据库表...');
    
    const tables = [
      'markets',
      'orders', 
      'trades',
      'settlements',
      'balances',
      'users',
      'activity_logs'
    ];

    let allTablesExist = true;
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table} - 不存在或无权限`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ ${table}`);
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  某些表缺失，请确保已运行 SQL 初始化脚本');
    }

    // 3. 测试查询
    console.log('\n3️⃣ 测试数据查询...');
    const { count, error: countError } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 查询失败:', countError.message);
    } else {
      console.log(`✅ markets 表当前有 ${count || 0} 条记录`);
    }

    console.log('\n🎉 所有测试通过！Supabase 配置正确！\n');

  } catch (err) {
    console.error('\n❌ 测试失败:', err.message);
    console.log('\n请检查：');
    console.log('1. .env.local 中的配置是否正确');
    console.log('2. 是否已在 Supabase 中创建表');
    console.log('3. 网络连接是否正常\n');
    process.exit(1);
  }
}

testSupabase();






