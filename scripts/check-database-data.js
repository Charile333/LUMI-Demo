// 检查 Supabase 数据库中的市场数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseData() {
  console.log('\n=== 📊 检查 Supabase 数据库数据 ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 配置');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 检查 markets 表
    console.log('📋 1. Markets 表数据：\n');
    const { data: markets, error: marketsError, count: marketsCount } = await supabase
      .from('markets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (marketsError) {
      console.error('❌ 查询失败:', marketsError.message);
    } else {
      console.log(`✅ 共有 ${marketsCount} 个市场\n`);
      
      if (markets && markets.length > 0) {
        markets.forEach((market, index) => {
          console.log(`📌 市场 ${index + 1}:`);
          console.log(`   ID: ${market.id}`);
          console.log(`   Question ID: ${market.question_id}`);
          console.log(`   标题: ${market.title}`);
          console.log(`   描述: ${market.description?.substring(0, 50)}...`);
          console.log(`   分类: ${market.main_category} / ${market.sub_category || '无'}`);
          console.log(`   状态: ${market.status}`);
          console.log(`   区块链状态: ${market.blockchain_status}`);
          console.log(`   图片: ${market.image_url ? '有' : '无'}`);
          console.log(`   优先级: ${market.priority_level}`);
          console.log(`   创建时间: ${market.created_at}`);
          console.log(`   合约地址: ${market.adapter_address || '未设置'}`);
          console.log('');
        });
      } else {
        console.log('⚠️  暂无市场数据\n');
      }
    }

    // 2. 检查 orders 表
    console.log('📋 2. Orders 表数据：\n');
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      console.error('❌ 查询失败:', ordersError.message);
    } else {
      console.log(`✅ 共有 ${ordersCount || 0} 个订单\n`);
    }

    // 3. 检查 trades 表
    console.log('📋 3. Trades 表数据：\n');
    const { count: tradesCount, error: tradesError } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true });

    if (tradesError) {
      console.error('❌ 查询失败:', tradesError.message);
    } else {
      console.log(`✅ 共有 ${tradesCount || 0} 条成交记录\n`);
    }

    // 4. 检查 balances 表
    console.log('📋 4. Balances 表数据：\n');
    const { count: balancesCount, error: balancesError } = await supabase
      .from('balances')
      .select('*', { count: 'exact', head: true });

    if (balancesError) {
      console.error('❌ 查询失败:', balancesError.message);
    } else {
      console.log(`✅ 共有 ${balancesCount || 0} 条余额记录\n`);
    }

    // 5. 检查 users 表
    console.log('📋 5. Users 表数据：\n');
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ 查询失败:', usersError.message);
    } else {
      console.log(`✅ 共有 ${usersCount || 0} 个用户\n`);
    }

    // 6. 检查 activity_logs 表
    console.log('📋 6. Activity Logs 表数据：\n');
    const { count: logsCount, error: logsError } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    if (logsError) {
      console.error('❌ 查询失败:', logsError.message);
    } else {
      console.log(`✅ 共有 ${logsCount || 0} 条活动日志\n`);
    }

    // 7. 统计总结
    console.log('═══════════════════════════════════════');
    console.log('📊 数据库统计总结：');
    console.log('═══════════════════════════════════════');
    console.log(`   Markets:        ${marketsCount || 0} 个`);
    console.log(`   Orders:         ${ordersCount || 0} 个`);
    console.log(`   Trades:         ${tradesCount || 0} 条`);
    console.log(`   Balances:       ${balancesCount || 0} 条`);
    console.log(`   Users:          ${usersCount || 0} 个`);
    console.log(`   Activity Logs:  ${logsCount || 0} 条`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 数据库检查完成！\n');

  } catch (error) {
    console.error('\n❌ 检查失败:', error.message);
    process.exit(1);
  }
}

checkDatabaseData();






