/**
 * CTF Redeem 功能测试脚本
 * 
 * 使用方法：
 * 1. 设置环境变量：export TEST_PRIVATE_KEY=your_private_key
 * 2. 运行：npx tsx scripts/test-redeem.ts <conditionId> [outcomeIndex]
 * 
 * 示例：
 * npx tsx scripts/test-redeem.ts 0x123... 1
 */

import { ethers } from 'ethers';
import { 
  redeemPositions, 
  checkRedeemableBalance,
  isMarketResolved,
  calculateRedeemablePayout
} from '../lib/ctf/redeem';

// 配置
const CONFIG = {
  rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com',
  collateralToken: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', // Mock USDC
};

async function testRedeem() {
  // 从命令行参数获取
  const conditionId = process.argv[2];
  const outcomeIndex = process.argv[3] ? parseInt(process.argv[3]) : 1;
  const privateKey = process.env.TEST_PRIVATE_KEY;

  if (!conditionId) {
    console.error('❌ 错误：缺少 conditionId 参数');
    console.log('\n使用方法：');
    console.log('  npx tsx scripts/test-redeem.ts <conditionId> [outcomeIndex]');
    console.log('\n示例：');
    console.log('  npx tsx scripts/test-redeem.ts 0x123... 1');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ 错误：缺少 TEST_PRIVATE_KEY 环境变量');
    console.log('\n请设置测试账户私钥：');
    console.log('  export TEST_PRIVATE_KEY=your_private_key');
    process.exit(1);
  }

  console.log('🧪 开始测试 CTF Redeem 功能...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. 初始化 provider 和 signer
  const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const userAddress = await signer.getAddress();

  console.log('📝 测试配置：');
  console.log('   账户地址:', userAddress);
  console.log('   Condition ID:', conditionId);
  console.log('   Outcome Index:', outcomeIndex, outcomeIndex === 1 ? '(YES)' : '(NO)');
  console.log('   RPC URL:', CONFIG.rpcUrl);
  console.log('');

  // 2. 检查市场是否已解析
  console.log('1️⃣ 检查市场解析状态...');
  try {
    const resolved = await isMarketResolved(provider, conditionId);
    console.log('   ✅ 市场已解析:', resolved ? '是' : '否');
    
    if (!resolved) {
      console.log('   ⚠️  市场未解析，无法测试提取功能');
      console.log('   💡 提示：请先解析市场（调用 reportPayouts）');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('   ❌ 检查失败:', error.message);
    process.exit(1);
  }
  console.log('');

  // 3. 检查可赎回余额
  console.log('2️⃣ 检查可赎回余额...');
  let balanceInfo;
  try {
    balanceInfo = await checkRedeemableBalance(
      provider,
      userAddress,
      conditionId,
      outcomeIndex
    );
    
    console.log('   ✅ 有可赎回余额:', balanceInfo.hasBalance ? '是' : '否');
    console.log('   📊 持仓数量:', balanceInfo.balance, 'USDC');
    console.log('   🆔 Position ID:', balanceInfo.positionId);
    
    if (!balanceInfo.hasBalance) {
      console.log('   ⚠️  没有可赎回的 Position Tokens');
      console.log('   💡 提示：请先买入 YES/NO 获得 Position Tokens');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('   ❌ 检查失败:', error.message);
    process.exit(1);
  }
  console.log('');

  // 4. 计算预期 payout
  console.log('3️⃣ 计算预期 payout...');
  let payoutInfo;
  try {
    payoutInfo = await calculateRedeemablePayout(
      provider,
      userAddress,
      conditionId,
      outcomeIndex
    );
    
    console.log('   💰 预期 payout:', payoutInfo.payout, 'USDC');
    console.log('   📊 持仓余额:', payoutInfo.positionBalance, 'USDC');
  } catch (error: any) {
    console.error('   ❌ 计算失败:', error.message);
    process.exit(1);
  }
  console.log('');

  // 5. 检查 USDC 余额（提取前）
  console.log('4️⃣ 检查 USDC 余额（提取前）...');
  let balanceBefore;
  try {
    const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
    const usdcContract = new ethers.Contract(
      CONFIG.collateralToken,
      usdcAbi,
      provider
    );
    balanceBefore = await usdcContract.balanceOf(userAddress);
    const balanceBeforeFormatted = ethers.utils.formatUnits(balanceBefore, 6);
    console.log('   💵 USDC 余额:', balanceBeforeFormatted);
  } catch (error: any) {
    console.error('   ❌ 检查失败:', error.message);
    process.exit(1);
  }
  console.log('');

  // 6. 执行赎回
  console.log('5️⃣ 执行赎回...');
  console.log('   ⏳ 等待交易确认...');
  let result;
  try {
    result = await redeemPositions(
      signer,
      conditionId,
      outcomeIndex
    );
  } catch (error: any) {
    console.error('   ❌ 赎回失败:', error.message);
    process.exit(1);
  }

  if (result.success) {
    console.log('   ✅ 赎回成功！');
    console.log('   🔗 交易哈希:', result.transactionHash);
    console.log('   🌐 浏览器查看:', result.explorerUrl);
    console.log('   💰 提取金额:', result.payout, 'USDC');
    console.log('');

    // 7. 检查 USDC 余额（提取后）
    console.log('6️⃣ 验证结果...');
    try {
      const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
      const usdcContract = new ethers.Contract(
        CONFIG.collateralToken,
        usdcAbi,
        provider
      );
      const balanceAfter = await usdcContract.balanceOf(userAddress);
      const balanceAfterFormatted = ethers.utils.formatUnits(balanceAfter, 6);
      const increase = parseFloat(balanceAfterFormatted) - parseFloat(ethers.utils.formatUnits(balanceBefore, 6));
      
      console.log('   💵 USDC 余额（提取后）:', balanceAfterFormatted);
      console.log('   📈 增加金额:', increase.toFixed(6), 'USDC');
      console.log('   🎯 预期增加:', result.payout, 'USDC');
      
      const diff = Math.abs(increase - parseFloat(result.payout || '0'));
      if (diff < 0.01) {
        console.log('   ✅ 余额增加正确！');
      } else {
        console.log('   ⚠️  余额增加不匹配（差异:', diff.toFixed(6), 'USDC）');
      }
    } catch (error: any) {
      console.error('   ❌ 验证失败:', error.message);
    }
  } else {
    console.error('   ❌ 赎回失败:', result.error);
    process.exit(1);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 测试完成！');
}

// 运行测试
testRedeem().catch((error) => {
  console.error('❌ 测试出错:', error);
  process.exit(1);
});





