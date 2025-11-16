// 🔍 检查 questionId 是否已在 Adapter 合约上存在
// 用于分析为什么 initialize 失败

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const CONTRACTS = {
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
};

const ADAPTER_ABI = [
  "function markets(bytes32 questionId) view returns (uint256 requestTimestamp, uint256 proposedPrice, uint256 resolvedPrice, bool isResolved, bytes32 conditionId)",
  "function getQuestion(bytes32 questionId) view returns (bool exists, uint256 requestTimestamp)"
];

async function checkQuestionId(questionIdString) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 Question ID 是否存在');
  console.log('='.repeat(60) + '\n');

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) {
    console.log('❌ NEXT_PUBLIC_RPC_URL 未配置！');
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: 'polygon-amoy',
    chainId: 80002
  });

  const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, provider);

  // 计算 questionId
  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(questionIdString)
  );

  console.log(`Question ID String: ${questionIdString}`);
  console.log(`Question ID (bytes32): ${questionId}\n`);

  try {
    // 方法1: 检查 markets 映射
    console.log('📋 检查 markets 映射...');
    const marketInfo = await adapter.markets(questionId);
    
    console.log(`   requestTimestamp: ${marketInfo.requestTimestamp.toString()}`);
    console.log(`   proposedPrice: ${marketInfo.proposedPrice.toString()}`);
    console.log(`   resolvedPrice: ${marketInfo.resolvedPrice.toString()}`);
    console.log(`   isResolved: ${marketInfo.isResolved}`);
    console.log(`   conditionId: ${marketInfo.conditionId}\n`);

    if (marketInfo.requestTimestamp.gt(0)) {
      console.log('❌ Question ID 已经存在！');
      console.log(`   创建时间戳: ${new Date(marketInfo.requestTimestamp.toNumber() * 1000).toISOString()}`);
      if (marketInfo.conditionId !== ethers.constants.HashZero) {
        console.log(`   Condition ID: ${marketInfo.conditionId}`);
      }
      return true;
    } else {
      console.log('✅ Question ID 不存在，可以创建\n');
      return false;
    }
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    
    // 尝试方法2: getQuestion（如果存在）
    try {
      console.log('\n📋 尝试使用 getQuestion 方法...');
      const questionInfo = await adapter.getQuestion(questionId);
      console.log(`   exists: ${questionInfo.exists}`);
      console.log(`   requestTimestamp: ${questionInfo.requestTimestamp.toString()}\n`);
      
      if (questionInfo.exists) {
        console.log('❌ Question ID 已经存在！');
        return true;
      } else {
        console.log('✅ Question ID 不存在，可以创建\n');
        return false;
      }
    } catch (error2) {
      console.error('❌ getQuestion 也失败:', error2.message);
      return null;
    }
  }
}

const questionIdString = process.argv[2] || 'market-1762685228835-l6ninlq5c';
checkQuestionId(questionIdString).then(exists => {
  if (exists === true) {
    console.log('\n💡 解决方案：');
    console.log('   1. 如果这个市场已经成功创建，可以直接使用数据库中的 condition_id');
    console.log('   2. 如果想重新创建，需要修改 question_id 字符串（例如添加时间戳）');
    console.log('   3. 或者使用另一个市场 ID 进行测试\n');
    process.exit(1);
  } else if (exists === false) {
    console.log('✅ 可以继续尝试创建市场\n');
    process.exit(0);
  } else {
    console.log('⚠️ 无法确定状态，请手动检查\n');
    process.exit(2);
  }
});


