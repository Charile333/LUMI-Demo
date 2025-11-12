// 🚀 激活市场上链
// 使用 API 激活市场，获取 condition_id
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function activateMarkets() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 激活市场上链');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 查找需要激活的市场
    console.log('📊 查找需要激活的市场...\n');
    const { data: markets, error } = await supabase
      .from('markets')
      .select('id, title, question_id, condition_id, blockchain_status')
      .in('blockchain_status', ['not_created', 'failed'])
      .not('question_id', 'is', null);

    if (error) {
      console.log('❌ 查询失败:', error.message);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('✅ 没有需要激活的市场！');
      return;
    }

    console.log(`✅ 找到 ${markets.length} 个需要激活的市场\n`);

    // 2. 显示市场列表
    console.log('📋 市场列表：');
    markets.forEach(m => {
      console.log(`   [${m.id}] ${m.title}`);
      console.log(`       区块链状态: ${m.blockchain_status}`);
      console.log(`       Question ID: ${m.question_id}`);
      console.log();
    });

    // 3. 激活建议
    console.log('='.repeat(60));
    console.log('💡 激活方法：');
    console.log('='.repeat(60));
    console.log('\n   方法1：使用 API 激活（推荐）');
    console.log('   ──────────────────────────────');
    markets.forEach(m => {
      console.log(`   curl -X POST http://localhost:3000/api/admin/markets/${m.id}/activate`);
    });

    console.log('\n   方法2：使用 Supabase Dashboard');
    console.log('   ──────────────────────────────');
    console.log('   1. 打开 Supabase Dashboard');
    console.log('   2. 进入 SQL Editor');
    console.log('   3. 运行以下 SQL：');
    console.log('\n   -- 检查市场状态');
    console.log('   SELECT id, title, question_id, blockchain_status');
    console.log('   FROM markets');
    console.log('   WHERE blockchain_status IN (\'not_created\', \'failed\');');

    console.log('\n   方法3：使用脚本激活');
    console.log('   ──────────────────────────────');
    console.log('   需要配置以下环境变量：');
    console.log('   - PLATFORM_WALLET_PRIVATE_KEY: 平台钱包私钥');
    console.log('   - NEXT_PUBLIC_RPC_URL: RPC URL');
    console.log('   - NEXT_PUBLIC_MOCK_USDC: USDC 合约地址');
    console.log('   - NEXT_PUBLIC_ADAPTER: Adapter 合约地址');

    console.log('\n   注意事项：');
    console.log('   ⚠️  激活市场需要：');
    console.log('   1. 平台钱包有足够的 USDC 余额');
    console.log('   2. 平台钱包有足够的 Gas 费');
    console.log('   3. 智能合约已部署');
    console.log('   4. 网络连接正常');

    console.log('\n' + '='.repeat(60));
    console.log('✅ 检查完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

activateMarkets();

