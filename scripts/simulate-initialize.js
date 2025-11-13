// 🔍 模拟调用 initialize 函数，获取失败原因
// 用于诊断为什么交易失败

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');

const CONTRACTS = {
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};

const ADAPTER_ABI = [
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
  "function markets(bytes32 questionId) view returns (uint256 requestTimestamp, uint256 proposedPrice, uint256 resolvedPrice, bool isResolved, bytes32 conditionId)"
];

async function simulateInitialize(marketId) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 模拟调用 initialize 函数');
  console.log('='.repeat(60) + '\n');

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rpcUrl || !privateKey || !supabaseUrl || !supabaseKey) {
    console.log('❌ 配置缺失！');
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: 'polygon-amoy',
    chainId: 80002
  });

  const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  const wallet = new ethers.Wallet(normalizedPrivateKey, provider);

  // 获取市场数据
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: market, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error) {
    console.error('❌ 查询市场失败:', error.message);
    // 尝试查询所有市场
    const { data: allMarkets } = await supabase
      .from('markets')
      .select('id, title, question_id')
      .limit(10);
    console.log('📋 可用的市场:', allMarkets);
    return;
  }

  if (error || !market) {
    console.log(`❌ 市场 ${marketId} 不存在！`);
    return;
  }

  console.log(`📊 市场: ${market.title}`);
  console.log(`   Question ID: ${market.question_id}\n`);

  const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, wallet);
  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(market.question_id)
  );

  const rewardAmount = ethers.utils.parseUnits('10', 6); // 10 USDC

  console.log(`🔍 模拟执行 initialize 函数...`);
  console.log(`   Question ID: ${questionId}`);
  console.log(`   Title: ${market.title}`);
  console.log(`   Reward: ${ethers.utils.formatUnits(rewardAmount, 6)} USDC\n`);

  try {
    // 使用 callStatic 模拟执行（不会发送实际交易）
    const result = await adapter.callStatic.initialize(
      questionId,
      market.title,
      market.description || '',
      2, // YES/NO
      CONTRACTS.mockUSDC,
      rewardAmount,
      0 // customLiveness
    );

    console.log('✅ 模拟执行成功！');
    console.log(`   Condition ID: ${result}\n`);
    console.log('💡 如果模拟成功，可能是 Gas 价格或其他运行时问题导致实际交易失败。\n');

  } catch (error) {
    console.log('❌ 模拟执行失败！');
    console.log(`   错误: ${error.message}\n`);

    // 尝试提取 revert reason
    if (error.reason) {
      console.log(`   Revert Reason: ${error.reason}\n`);
    }

    if (error.data) {
      console.log(`   Error Data: ${error.data}\n`);
    }

    // 检查可能的原因
    if (error.message.includes('Market already exists')) {
      console.log('💡 原因: 市场已存在');
    } else if (error.message.includes('transferFrom')) {
      console.log('💡 原因: USDC transferFrom 失败（可能 approve 不足）');
    } else if (error.message.includes('prepareCondition')) {
      console.log('💡 原因: CTF prepareCondition 失败（可能条件已存在）');
    } else if (error.message.includes('requestPrice')) {
      console.log('💡 原因: UMA Oracle requestPrice 失败');
    } else {
      console.log('💡 需要查看完整的错误信息来确定原因');
    }
  }

  // 检查 markets 映射
  console.log('\n📋 检查 markets 映射...');
  try {
    const marketInfo = await adapter.markets(questionId);
    console.log(`   requestTimestamp: ${marketInfo.requestTimestamp.toString()}`);
    console.log(`   isResolved: ${marketInfo.isResolved}`);
    console.log(`   conditionId: ${marketInfo.conditionId}\n`);
  } catch (e) {
    console.log(`   ⚠️ 无法读取 markets 映射: ${e.message}\n`);
  }

  console.log('='.repeat(60) + '\n');
}

const marketId = process.argv[2];
if (!marketId) {
  console.log('用法: node scripts/simulate-initialize.js <marketId>');
  process.exit(1);
}

simulateInitialize(parseInt(marketId)).catch(console.error);

