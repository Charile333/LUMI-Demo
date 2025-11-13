// 🔍 检查 CTF 合约中的条件是否已存在
// 用于诊断 initialize 失败的原因

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const CONTRACTS = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C'
};

const CTF_ABI = [
  "function getConditionId(address oracle, bytes32 questionId, uint256 outcomeSlotCount) view returns (bytes32)",
  "function getCondition(bytes32 conditionId) view returns (address oracle, bytes32 questionId, uint256 outcomeSlotCount)"
];

async function checkCondition(questionIdString) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 CTF 条件');
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

  const ctf = new ethers.Contract(CONTRACTS.conditionalTokens, CTF_ABI, provider);

  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(questionIdString)
  );

  console.log(`Question ID String: ${questionIdString}`);
  console.log(`Question ID (bytes32): ${questionId}`);
  console.log(`Oracle (Adapter): ${CONTRACTS.adapter}`);
  console.log(`Outcome Slot Count: 2\n`);

  try {
    // 获取 condition ID
    const conditionId = await ctf.getConditionId(
      CONTRACTS.adapter,
      questionId,
      2
    );

    console.log(`Condition ID: ${conditionId}\n`);

    if (conditionId === ethers.constants.HashZero) {
      console.log('✅ 条件不存在，可以创建\n');
      return false;
    } else {
      console.log('❌ 条件已存在！\n');

      // 获取条件详情
      try {
        const condition = await ctf.getCondition(conditionId);
        console.log(`📋 条件详情：`);
        console.log(`   Oracle: ${condition.oracle}`);
        console.log(`   Question ID: ${condition.questionId}`);
        console.log(`   Outcome Slot Count: ${condition.outcomeSlotCount.toString()}\n`);
      } catch (e) {
        console.log(`   ⚠️ 无法获取条件详情: ${e.message}\n`);
      }

      return true;
    }
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    return null;
  }
}

const questionIdString = process.argv[2] || 'market-1762685228835-l6ninlq5c';
checkCondition(questionIdString).then(exists => {
  if (exists === true) {
    console.log('💡 解决方案：');
    console.log('   1. 条件已存在，可能之前的 initialize 调用部分成功了');
    console.log('   2. 可以尝试使用不同的 question_id 字符串');
    console.log('   3. 或者检查合约状态，看看是否需要清理\n');
    process.exit(1);
  } else if (exists === false) {
    console.log('✅ CTF 条件不存在，这不是问题所在\n');
    process.exit(0);
  } else {
    console.log('⚠️ 无法确定状态\n');
    process.exit(2);
  }
});

