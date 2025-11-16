// 🔍 通过 Supabase Client 检查 orders 表
// 这个方法比直连更可靠

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkOrdersTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 配置缺失');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 orders 表（通过 Supabase Client）');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. 尝试查询 orders 表
    console.log('📊 查询 orders 表...\n');
    
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ orders 表不存在！\n');
        console.log('💡 需要在 Supabase Dashboard 创建 orders 表');
        console.log('   访问：https://supabase.com/dashboard');
        console.log('   进入：SQL Editor');
        console.log('   运行：scripts/setup-database-clean.sql\n');
      } else {
        console.log('❌ 查询错误:', error.message);
        console.log('   Code:', error.code);
        console.log('   Details:', error.details);
        console.log('   Hint:', error.hint);
      }
      return;
    }

    console.log(`✅ orders 表存在`);
    console.log(`📊 订单数量: ${count || 0}\n`);

    // 2. 尝试关联查询（测试外键）
    console.log('🔗 测试外键关系...\n');
    
    const { data: joinData, error: joinError } = await supabase
      .from('orders')
      .select(`
        id,
        market_id,
        markets:market_id (
          title
        )
      `)
      .limit(1);

    if (joinError) {
      console.log('❌ 外键关系查询失败！');
      console.log('   错误:', joinError.message);
      console.log('   Code:', joinError.code);
      console.log('   Details:', joinError.details);
      
      if (joinError.code === 'PGRST200') {
        console.log('\n💡 诊断：');
        console.log('   orders 表缺少外键关系');
        console.log('   market_id 字段没有指向 markets 表的外键\n');
        console.log('🔧 修复步骤：');
        console.log('   1. 访问 Supabase Dashboard → SQL Editor');
        console.log('   2. 运行以下 SQL：\n');
        console.log('   -- 添加外键约束');
        console.log('   ALTER TABLE orders');
        console.log('   ADD CONSTRAINT fk_orders_market_id');
        console.log('   FOREIGN KEY (market_id)');
        console.log('   REFERENCES markets(id)');
        console.log('   ON DELETE CASCADE;\n');
      }
    } else {
      console.log('✅ 外键关系正常！');
      if (joinData && joinData.length > 0) {
        console.log('   示例数据:', JSON.stringify(joinData[0], null, 2));
      }
    }

    // 3. 检查 markets 表
    console.log('\n📊 检查 markets 表...\n');
    
    const { data: marketsData, error: marketsError, count: marketsCount } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true });

    if (marketsError) {
      console.log('❌ markets 表查询失败:', marketsError.message);
    } else {
      console.log(`✅ markets 表存在，共 ${marketsCount} 个市场`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 检查完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkOrdersTable();



















