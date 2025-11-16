// 🔧 使用已存在的 Condition ID
// 如果 CTF 条件已存在，直接使用它，而不重新调用 initialize

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');

const CONTRACTS = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C'
};

const CTF_ABI = [
  "function getConditionId(address oracle, bytes32 questionId, uint256 outcomeSlotCount) view returns (bytes32)"
];

async function useExistingCondition(marketId) {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 使用已存在的 Condition ID');
  console.log('='.repeat(60) + '\n');

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rpcUrl || !supabaseUrl || !supabaseKey) {
    console.log('❌ 配置缺失！');
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: 'polygon-amoy',
    chainId: 80002
  });

  const ctf = new ethers.Contract(CONTRACTS.conditionalTokens, CTF_ABI, provider);

  // 获取市场数据
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: market, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error || !market) {
    console.log(`❌ 市场 ${marketId} 不存在！`);
    return;
  }

  console.log(`📊 市场: ${market.title}`);
  console.log(`   Question ID: ${market.question_id}\n`);

  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(market.question_id)
  );

  try {
    // 获取已存在的 Condition ID
    const conditionId = await ctf.getConditionId(
      CONTRACTS.adapter,
      questionId,
      2
    );

    if (conditionId === ethers.constants.HashZero) {
      console.log('❌ Condition ID 不存在！需要先调用 initialize。\n');
      return;
    }

    console.log(`✅ 找到已存在的 Condition ID:`);
    console.log(`   ${conditionId}\n`);

    // 更新数据库
    const { error: updateError } = await supabase
      .from('markets')
      .update({
        condition_id: conditionId,
        blockchain_status: 'created',
        updated_at: new Date().toISOString()
      })
      .eq('id', marketId);

    if (updateError) {
      console.log(`❌ 更新数据库失败: ${updateError.message}\n`);
      return;
    }

    console.log('✅ 数据库已更新！');
    console.log(`   Condition ID 已保存到市场 ${marketId}`);
    console.log(`   状态已更新为 'created'\n`);

    console.log('💡 现在可以使用这个市场进行链上交易了！\n');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }

  console.log('='.repeat(60) + '\n');
}

const marketId = process.argv[2];
if (!marketId) {
  console.log('用法: node scripts/use-existing-condition.js <marketId>');
  process.exit(1);
}

useExistingCondition(parseInt(marketId)).catch(console.error);


