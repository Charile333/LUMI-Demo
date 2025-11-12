// 🔍 检查市场链上状态
// 检查哪些市场已上链（有 condition_id），哪些未上链
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkMarketBlockchainStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查市场链上状态');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    console.log('   请确保 .env.local 文件中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 查询所有市场
    console.log('📊 查询所有市场...\n');
    const { data: markets, error } = await supabase
      .from('markets')
      .select('id, title, condition_id, blockchain_status, main_category, status, question_id')
      .order('id');

    if (error) {
      console.log('❌ 查询失败:', error.message);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('⚠️  没有找到市场！');
      console.log('   请先在数据库中创建市场。\n');
      return;
    }

    console.log(`✅ 找到 ${markets.length} 个市场\n`);

    // 分类统计
    const onChainMarkets = markets.filter(m => m.condition_id && m.blockchain_status === 'created');
    const notOnChainMarkets = markets.filter(m => !m.condition_id || m.blockchain_status === 'not_created');
    const creatingMarkets = markets.filter(m => m.blockchain_status === 'creating');
    const failedMarkets = markets.filter(m => m.blockchain_status === 'failed');

    console.log('📈 统计信息：');
    console.log(`   ✅ 已上链: ${onChainMarkets.length} 个`);
    console.log(`   ⏳ 上链中: ${creatingMarkets.length} 个`);
    console.log(`   ❌ 上链失败: ${failedMarkets.length} 个`);
    console.log(`   ⚠️  未上链: ${notOnChainMarkets.length} 个`);
    console.log(`   📊 总计: ${markets.length} 个\n`);

    // 显示已上链的市场
    if (onChainMarkets.length > 0) {
      console.log('✅ 已上链的市场：');
      console.log('='.repeat(60));
      onChainMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category || 'N/A'}`);
        console.log(`       状态: ${m.status || 'N/A'}`);
        console.log(`       区块链状态: ${m.blockchain_status}`);
        console.log(`       Condition ID: ${m.condition_id?.substring(0, 20)}...`);
        console.log(`       Question ID: ${m.question_id || 'N/A'}`);
        console.log();
      });
    }

    // 显示未上链的市场
    if (notOnChainMarkets.length > 0) {
      console.log('⚠️  未上链的市场：');
      console.log('='.repeat(60));
      notOnChainMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category || 'N/A'}`);
        console.log(`       状态: ${m.status || 'N/A'}`);
        console.log(`       区块链状态: ${m.blockchain_status || 'not_created'}`);
        console.log(`       Condition ID: ${m.condition_id || '❌ 未设置'}`);
        console.log(`       Question ID: ${m.question_id || '❌ 未设置'}`);
        console.log();
      });
    }

    // 显示上链中的市场
    if (creatingMarkets.length > 0) {
      console.log('⏳ 上链中的市场：');
      console.log('='.repeat(60));
      creatingMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       区块链状态: ${m.blockchain_status}`);
        console.log(`       Condition ID: ${m.condition_id || '等待中...'}`);
        console.log();
      });
    }

    // 显示上链失败的市场
    if (failedMarkets.length > 0) {
      console.log('❌ 上链失败的市场：');
      console.log('='.repeat(60));
      failedMarkets.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       区块链状态: ${m.blockchain_status}`);
        console.log(`       Condition ID: ${m.condition_id || 'N/A'}`);
        console.log();
      });
    }

    // 测试建议
    console.log('\n' + '='.repeat(60));
    console.log('🧪 测试建议：');
    console.log('='.repeat(60));
    
    if (onChainMarkets.length > 0) {
      const testMarket = onChainMarkets[0];
      console.log(`\n✅ 可以使用已上链的市场进行测试：`);
      console.log(`   市场ID: ${testMarket.id}`);
      console.log(`   标题: ${testMarket.title}`);
      console.log(`   Condition ID: ${testMarket.condition_id}`);
      console.log(`\n   测试步骤：`);
      console.log(`   1. 访问: http://localhost:3000/markets/${testMarket.main_category || 'automotive'}`);
      console.log(`   2. 找到市场ID为 ${testMarket.id} 的市场卡片`);
      console.log(`   3. 点击"快速交易"按钮`);
      console.log(`   4. 下单测试（需要连接钱包）`);
      console.log(`   5. 检查订单是否撮合成功`);
      console.log(`   6. 检查是否需要链上执行`);
    } else {
      console.log(`\n⚠️  没有已上链的市场！`);
      console.log(`   需要先创建市场并上链。`);
      console.log(`\n   上链步骤：`);
      console.log(`   1. 创建市场（使用 /api/admin/markets/create-supabase）`);
      console.log(`   2. 激活市场（使用 /api/markets/[marketId]/activate 或手动上链）`);
      console.log(`   3. 检查 condition_id 是否已设置`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 检查完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkMarketBlockchainStatus();

