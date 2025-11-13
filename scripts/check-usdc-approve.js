// 🔍 检查 USDC approve 状态

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

async function checkUSDCApprove() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.log('❌ 配置缺失！');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 USDC Approve 状态');
  console.log('='.repeat(60) + '\n');

  const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
  const ADAPTER_ADDRESS = '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C';
  const PLATFORM_WALLET = '0xaa22D02aA0C31cF4140d54284B249cDb651107aB';

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: 'polygon-amoy',
      chainId: 80002
    });

    const USDC_ABI = [
      "function allowance(address owner, address spender) view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)"
    ];

    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

    // 检查余额
    const balance = await usdc.balanceOf(PLATFORM_WALLET);
    console.log(`💰 USDC 余额: ${ethers.utils.formatUnits(balance, 6)} USDC\n`);

    // 检查 approve 状态
    const allowance = await usdc.allowance(PLATFORM_WALLET, ADAPTER_ADDRESS);
    console.log(`🔐 Approve 额度: ${ethers.utils.formatUnits(allowance, 6)} USDC`);

    const requiredAmount = ethers.utils.parseUnits('10', 6); // 10 USDC
    console.log(`📊 所需额度: ${ethers.utils.formatUnits(requiredAmount, 6)} USDC\n`);

    if (allowance.gte(requiredAmount)) {
      console.log('✅ Approve 额度充足！');
    } else {
      console.log('❌ Approve 额度不足！');
      console.log(`   需要至少 ${ethers.utils.formatUnits(requiredAmount, 6)} USDC`);
      console.log(`   当前只有 ${ethers.utils.formatUnits(allowance, 6)} USDC\n`);
      console.log('💡 解决方案：');
      console.log('   需要重新执行 approve 操作');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkUSDCApprove().catch(console.error);

