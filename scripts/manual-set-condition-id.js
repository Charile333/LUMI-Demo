// 🔧 手动设置市场的 condition_id（用于测试）
// 当 RPC 连接失败无法激活时使用

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

async function manualSetConditionId() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 手动设置市场 Condition ID（测试用）');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 获取所有未上链的市场
    const { data: markets, error } = await supabase
      .from('markets')
      .select('id, title, question_id, condition_id, blockchain_status')
      .in('blockchain_status', ['not_created', 'creating', 'failed'])
      .order('id');

    if (error) {
      console.log('❌ 查询失败:', error.message);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('✅ 没有需要设置的市场（所有市场都已上链）\n');
      return;
    }

    console.log(`📋 找到 ${markets.length} 个未上链的市场\n`);

    // 为每个市场生成 condition_id
    for (const market of markets) {
      if (!market.question_id) {
        console.log(`⚠️ 市场 [${market.id}] ${market.title} 缺少 question_id，跳过\n`);
        continue;
      }

      // 生成 condition_id（模拟链上生成的逻辑）
      const questionIdBytes = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(market.question_id)
      );
      
      const adapterAddress = '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C';
      const outcomeSlotCount = 2; // YES/NO
      
      const conditionId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes32', 'uint256'],
          [adapterAddress, questionIdBytes, outcomeSlotCount]
        )
      );

      console.log(`📝 市场 [${market.id}] ${market.title}`);
      console.log(`   Question ID: ${market.question_id}`);
      console.log(`   Condition ID: ${conditionId}`);

      // 更新数据库
      const { error: updateError } = await supabase
        .from('markets')
        .update({
          condition_id: conditionId,
          blockchain_status: 'created',
          status: 'active',
          adapter_address: adapterAddress,
          ctf_address: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2'
        })
        .eq('id', market.id);

      if (updateError) {
        console.log(`   ❌ 更新失败:`, updateError.message);
      } else {
        console.log(`   ✅ 已设置为"已上链"状态`);
      }
      
      console.log('');
    }

    console.log('============================================================');
    console.log('✅ 完成');
    console.log('============================================================');
    console.log('\n⚠️  注意：');
    console.log('   这是测试方法，并未真正在区块链上创建市场。');
    console.log('   生成的 condition_id 仅用于本地测试。');
    console.log('   实际交易会失败，因为链上没有这个 condition。');
    console.log('');
    console.log('💡 建议：');
    console.log('   1. 使用 Alchemy RPC（需要注册）');
    console.log('   2. 使用 VPN 连接公共 RPC');
    console.log('   3. 真正激活市场后再测试交易\n');

  } catch (error) {
    console.error('❌ 设置失败:', error);
  }
}

manualSetConditionId();

