// ✅ 验证市场激活状态
// 检查市场是否已正确激活，包括 condition_id、状态等

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const CONTRACTS = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C'
};

const CTF_ABI = [
  "function getConditionId(address oracle, bytes32 questionId, uint256 outcomeSlotCount) view returns (bytes32)"
];

async function verifyMarketStatus(marketId) {
  console.log('\n' + '='.repeat(60));
  console.log('✅ 验证市场激活状态');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. 获取市场数据
  const { data: market, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error || !market) {
    console.log(`❌ 市场 ${marketId} 不存在！`);
    return;
  }

  console.log(`📊 市场信息：`);
  console.log(`   标题: ${market.title}`);
  console.log(`   状态: ${market.blockchain_status || '未设置'}`);
  console.log(`   Question ID: ${market.question_id || '未设置'}`);
  console.log(`   Condition ID: ${market.condition_id || '未设置'}\n`);

  // 2. 验证状态
  if (market.blockchain_status === 'created') {
    console.log('✅ 市场状态: 已激活\n');
  } else {
    console.log(`⚠️ 市场状态: ${market.blockchain_status || '未设置'}\n`);
  }

  // 3. 验证 Condition ID
  if (!market.condition_id) {
    console.log('❌ Condition ID 未设置！');
    return;
  }

  console.log(`✅ Condition ID 已设置: ${market.condition_id}\n`);

  // 4. 验证链上 Condition ID（如果配置了 RPC）
  if (rpcUrl && market.question_id) {
    console.log('🔍 验证链上 Condition ID...');
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
        name: 'polygon-amoy',
        chainId: 80002
      });

      const ctf = new ethers.Contract(CONTRACTS.conditionalTokens, CTF_ABI, provider);
      
      const questionId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(market.question_id)
      );

      const onChainConditionId = await ctf.getConditionId(
        CONTRACTS.adapter,
        questionId,
        2
      );

      console.log(`   链上 Condition ID: ${onChainConditionId}`);
      console.log(`   数据库 Condition ID: ${market.condition_id}\n`);

      if (onChainConditionId.toLowerCase() === market.condition_id.toLowerCase()) {
        console.log('✅ Condition ID 匹配！链上状态正确\n');
      } else if (onChainConditionId === ethers.constants.HashZero) {
        console.log('⚠️ 链上 Condition ID 不存在（但数据库中有）\n');
      } else {
        console.log('⚠️ Condition ID 不匹配！');
        console.log('   可能链上的条件已被重新创建\n');
      }

    } catch (error) {
      console.log(`   ⚠️ 无法验证链上状态: ${error.message}\n`);
    }
  } else {
    console.log('⚠️ 未配置 RPC URL，跳过链上验证\n');
  }

  // 5. 总结
  console.log('📋 验证总结：');
  if (market.blockchain_status === 'created' && market.condition_id) {
    console.log('   ✅ 市场已完全激活');
    console.log('   ✅ Condition ID 已设置');
    console.log('   💡 现在可以使用这个市场进行链上交易了！\n');
  } else {
    console.log('   ⚠️ 市场状态不完整，可能需要进一步检查\n');
  }

  console.log('='.repeat(60) + '\n');
}

const marketId = process.argv[2];
if (!marketId) {
  console.log('用法: node scripts/verify-market-status.js <marketId>');
  process.exit(1);
}

verifyMarketStatus(parseInt(marketId)).catch(console.error);

