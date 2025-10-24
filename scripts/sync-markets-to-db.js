// 将区块链上的市场同步到 Supabase 数据库
require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');

const RPC_URL = 'https://rpc-amoy.polygon.technology';
const ADAPTER_ADDRESS = '0x5D440c98B55000087a8b0C164f1690551d18CfcC';

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
];

async function syncMarketsToDatabase() {
  console.log('\n=== 🔄 同步区块链市场到数据库 ===\n');

  // 初始化 Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 配置');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 连接区块链
    console.log('📡 连接区块链...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const adapter = new ethers.Contract(ADAPTER_ADDRESS, ADAPTER_ABI, provider);

    // 获取市场数量
    const count = await adapter.getMarketCount();
    console.log(`✅ 找到 ${count.toString()} 个市场\n`);

    if (count.eq(0)) {
      console.log('⚠️  区块链上暂无市场');
      return;
    }

    // 获取所有市场
    const marketIds = await adapter.getMarketList(0, count.toNumber());
    
    let syncedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < marketIds.length; i++) {
      const questionId = marketIds[i];
      const market = await adapter.getMarket(questionId);

      console.log(`📌 处理市场 ${i + 1}/${marketIds.length}: ${market.title}`);

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('markets')
        .select('id')
        .eq('question_id', questionId)
        .single();

      if (existing) {
        console.log('   ⏭️  已存在，跳过');
        skippedCount++;
        continue;
      }

      // 插入到数据库
      const { data, error } = await supabase
        .from('markets')
        .insert({
          question_id: questionId,
          condition_id: market.conditionId,
          title: market.title,
          description: market.description,
          main_category: 'emerging', // 默认分类
          sub_category: null,
          status: market.resolved ? 'resolved' : 'active',
          blockchain_status: 'created',
          adapter_address: ADAPTER_ADDRESS,
          collateral_token: market.rewardToken,
          reward_amount: ethers.utils.formatUnits(market.reward, 6),
          resolved: market.resolved,
          priority_level: 'normal'
        })
        .select();

      if (error) {
        console.log(`   ❌ 插入失败: ${error.message}`);
      } else {
        console.log(`   ✅ 同步成功 (ID: ${data[0].id})`);
        syncedCount++;
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('📊 同步结果：');
    console.log('═══════════════════════════════════════');
    console.log(`   总计：    ${marketIds.length} 个市场`);
    console.log(`   已同步：  ${syncedCount} 个`);
    console.log(`   已跳过：  ${skippedCount} 个`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 同步完成！\n');

    // 验证
    console.log('🔍 验证数据库数据...');
    const { count: dbCount } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ 数据库中现有 ${dbCount} 个市场\n`);

  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncMarketsToDatabase();






