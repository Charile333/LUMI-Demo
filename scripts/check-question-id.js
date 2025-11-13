// 🔍 检查 questionId 是否已存在

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

async function checkQuestionId() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  if (!rpcUrl) {
    console.log('❌ NEXT_PUBLIC_RPC_URL 未配置！');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 Question ID 状态');
  console.log('='.repeat(60) + '\n');

  // 从交易中提取的 questionId
  const questionId = '0x69526054ba13be04e347ca42bceba378342143a061161602ba74db7db44160b2';
  const ADAPTER_ADDRESS = '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C';

  console.log(`Question ID: ${questionId}`);
  console.log(`Adapter: ${ADAPTER_ADDRESS}\n`);

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: 'polygon-amoy',
      chainId: 80002
    });

    // 尝试调用 Adapter 合约的方法来检查 questionId 状态
    // 注意：这需要知道 Adapter 合约的 ABI
    // 我们可以尝试查看交易失败的具体原因

    console.log('💡 建议：');
    console.log('   1. 查看 Polygonscan 上的交易详情：');
    console.log(`      https://amoy.polygonscan.com/tx/0x40830a582a0db25fc8fd783f76dfc934a3e7a94a7df3af7ccff7492772971a10`);
    console.log('   2. 检查交易失败的具体原因（revert reason）');
    console.log('   3. 可能的原因：');
    console.log('      - Question ID 已存在');
    console.log('      - 合约内部检查失败');
    console.log('      - 参数验证失败');
    console.log('      - 权限不足\n');

    // 检查最近的交易，看看是否有成功的 initialize
    console.log('🔍 检查最近的交易...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`   当前区块: ${blockNumber}`);
    console.log(`   失败交易区块: 28983850`);
    console.log(`   区块差: ${blockNumber - 28983850}\n`);

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }

  console.log('='.repeat(60) + '\n');
}

checkQuestionId().catch(console.error);

