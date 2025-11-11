// 🧪 测试 Supabase 是否能正常查询市场数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseMarkets() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试 Supabase 市场查询');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📋 配置信息：');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : '未配置'}\n`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 测试1：查询所有市场
    console.log('📊 测试1：查询所有市场...\n');
    const { data: allMarkets, error: allError } = await supabase
      .from('markets')
      .select('id, title, main_category, status')
      .order('id');

    if (allError) {
      console.log('❌ 查询失败:', allError.message);
      console.log('   Code:', allError.code);
      console.log('   Details:', allError.details);
      return;
    }

    console.log(`✅ 找到 ${allMarkets?.length || 0} 个市场\n`);
    if (allMarkets && allMarkets.length > 0) {
      console.log('市场列表：');
      allMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category} | 状态: ${m.status}\n`);
      });
    }

    // 测试2：查询 automotive 分类的活跃市场（和页面一样的查询）
    console.log('🚗 测试2：查询 automotive 分类（active状态）...\n');
    const { data: automotiveMarkets, error: autoError } = await supabase
      .from('markets')
      .select('*')
      .eq('main_category', 'automotive')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (autoError) {
      console.log('❌ 查询失败:', autoError.message);
      return;
    }

    console.log(`✅ 找到 ${automotiveMarkets?.length || 0} 个 automotive 市场\n`);
    
    if (automotiveMarkets && automotiveMarkets.length > 0) {
      automotiveMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       状态: ${m.status}`);
        console.log(`       区块链状态: ${m.blockchain_status}`);
        console.log(`       创建时间: ${m.created_at}\n`);
      });
    } else {
      console.log('⚠️  没有找到符合条件的市场！');
      console.log('   可能原因：');
      console.log('   1. 没有 main_category = "automotive" 的市场');
      console.log('   2. 市场状态不是 "active"');
      console.log('   3. 表中没有数据\n');
    }

    // 测试3：查看 automotive 市场的所有状态
    console.log('🔍 测试3：automotive 分类所有状态的市场...\n');
    const { data: allAutoMarkets, error: allAutoError } = await supabase
      .from('markets')
      .select('id, title, status')
      .eq('main_category', 'automotive');

    if (!allAutoError && allAutoMarkets) {
      console.log(`   找到 ${allAutoMarkets.length} 个 automotive 市场（所有状态）：`);
      allAutoMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title} - 状态: ${m.status}`);
      });
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ 测试完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSupabaseMarkets();















