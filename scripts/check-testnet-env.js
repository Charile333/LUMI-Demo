// 🧪 检查测试网环境配置
const { ethers } = require('ethers');

// 合约地址
const CONTRACTS = {
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C'
};

// MockUSDC ABI
const USDC_ABI = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function main() {
  console.log('🧪 测试网环境检查工具\n');
  console.log('='.repeat(60));
  
  // 1. 连接到 Polygon Amoy 测试网
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com';
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  
  console.log('🌐 连接到 Polygon Amoy 测试网...');
  try {
    const network = await provider.getNetwork();
    console.log(`✅ 已连接：${network.name} (Chain ID: ${network.chainId})\n`);
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    return;
  }
  
  // 2. 检查平台钱包配置
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('❌ 未配置 PLATFORM_WALLET_PRIVATE_KEY\n');
    console.log('📝 请在 .env.local 中添加：');
    console.log('PLATFORM_WALLET_PRIVATE_KEY=0x你的私钥\n');
    
    console.log('💡 如何获取私钥：');
    console.log('1. 打开 MetaMask');
    console.log('2. 点击账户详情');
    console.log('3. 导出私钥');
    console.log('⚠️  仅用于测试，不要使用真实资产的钱包！\n');
    
    // 生成一个新钱包
    console.log('🔧 或者使用这个新生成的测试钱包：\n');
    const newWallet = ethers.Wallet.createRandom();
    console.log('地址:', newWallet.address);
    console.log('私钥:', newWallet.privateKey);
    console.log('\n📝 获取测试币：');
    console.log('1. POL 水龙头: https://faucet.polygon.technology/');
    console.log('   选择 Polygon Amoy，输入地址:', newWallet.address);
    console.log('2. 配置私钥到 .env.local');
    console.log('3. 运行 node scripts/mint-usdc.js 铸造 USDC');
    
    return;
  }
  
  // 3. 创建钱包实例
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`💼 平台钱包地址: ${wallet.address}\n`);
  
  // 4. 检查 POL 余额
  const polBalance = await provider.getBalance(wallet.address);
  const polFormatted = ethers.utils.formatEther(polBalance);
  
  console.log(`💰 POL 余额: ${polFormatted} POL`);
  
  if (polBalance.eq(0)) {
    console.log('❌ POL 余额为 0！\n');
    console.log('🔗 请访问水龙头获取测试 POL:');
    console.log('   https://faucet.polygon.technology/');
    console.log('   选择 Polygon Amoy');
    console.log(`   输入地址: ${wallet.address}\n`);
  } else if (polBalance.lt(ethers.utils.parseEther('0.01'))) {
    console.log('⚠️  POL 余额较低（建议 > 0.1）\n');
  } else {
    console.log('✅ POL 余额充足\n');
  }
  
  // 5. 检查 USDC 余额
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, USDC_ABI, wallet);
  const usdcBalance = await usdc.balanceOf(wallet.address);
  const usdcFormatted = ethers.utils.formatUnits(usdcBalance, 6);
  
  console.log(`💵 Mock USDC 余额: ${usdcFormatted} USDC`);
  
  // 6. 如果 USDC 不足，提供铸造指令
  if (usdcBalance.lt(ethers.utils.parseUnits('100', 6))) {
    console.log('⚠️  USDC 余额不足（建议 > 100）\n');
    console.log('🪙 铸造 Mock USDC（免费）：');
    console.log('   node scripts/mint-usdc.js\n');
  } else {
    console.log('✅ USDC 余额充足\n');
  }
  
  // 7. 总结
  console.log('='.repeat(60));
  console.log('📊 环境检查总结\n');
  
  const hasPol = polBalance.gte(ethers.utils.parseEther('0.01'));
  const hasUsdc = usdcBalance.gte(ethers.utils.parseUnits('10', 6));
  const canActivate = hasPol && hasUsdc;
  
  console.log(`POL 余额：    ${hasPol ? '✅' : '❌'} ${polFormatted} POL`);
  console.log(`USDC 余额：   ${hasUsdc ? '✅' : '❌'} ${usdcFormatted} USDC`);
  console.log(`可以激活市场：${canActivate ? '✅ 是' : '❌ 否'}\n`);
  
  if (canActivate) {
    console.log('🎉 环境配置完整，可以激活市场！\n');
    console.log('🚀 下一步：');
    console.log('1. 访问: http://localhost:3000/admin/markets');
    console.log('2. 点击市场旁边的"🚀 激活上链"按钮');
    console.log('3. 确认并等待交易完成');
    console.log('4. 市场上链成功！\n');
  } else {
    console.log('⚠️  需要补充测试币：\n');
    if (!hasPol) {
      console.log('❌ 需要 POL（用于 gas 费）');
      console.log('   https://faucet.polygon.technology/');
    }
    if (!hasUsdc) {
      console.log('❌ 需要 USDC（用于预言机奖励）');
      console.log('   node scripts/mint-usdc.js');
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  });











