// 🪙 铸造测试网 USDC（带完整检查）

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
const USDC_ABI = [
  'function mint(address to, uint256 amount)',
  'function faucet(uint256 amount)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

async function main() {
  console.log('\n🪙 铸造测试网 USDC\n');
  console.log('='.repeat(60));
  
  // 1. 检查配置
  console.log('\n📋 检查配置...\n');
  
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ 未配置 PLATFORM_WALLET_PRIVATE_KEY');
    console.log('\n请在 .env.local 中添加：');
    console.log('PLATFORM_WALLET_PRIVATE_KEY=0x...\n');
    process.exit(1);
  }
  console.log('✅ PLATFORM_WALLET_PRIVATE_KEY 已配置');
  
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
  console.log(`✅ RPC URL: ${rpcUrl}`);
  
  // 2. 连接区块链
  console.log('\n🔌 连接区块链...\n');
  
  const provider = new ethers.providers.JsonRpcProvider({
    url: rpcUrl,
    timeout: 15000
  }, {
    name: 'polygon-amoy',
    chainId: 80002
  });
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`💼 钱包地址: ${wallet.address}`);
  
  // 3. 检查 POL 余额
  try {
    const polBalance = await wallet.getBalance();
    const polBalanceFormatted = ethers.utils.formatEther(polBalance);
    console.log(`💵 POL 余额: ${polBalanceFormatted} POL`);
    
    if (polBalance.eq(0)) {
      console.log('\n⚠️  警告: POL 余额为 0，无法支付 gas 费用');
      console.log('\n请先获取测试 POL:');
      console.log('  1. 访问: https://faucet.polygon.technology/');
      console.log('  2. 选择 Polygon Amoy 网络');
      console.log(`  3. 粘贴地址: ${wallet.address}`);
      console.log('  4. 领取测试币后重新运行此脚本\n');
      process.exit(1);
    }
    
    console.log('✅ POL 余额充足');
  } catch (error) {
    console.error('❌ 检查 POL 余额失败:', error.message);
    process.exit(1);
  }
  
  // 4. 连接 USDC 合约
  console.log('\n📝 连接 Mock USDC 合约...\n');
  
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  
  try {
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    console.log(`✅ 合约连接成功`);
    console.log(`   Token: ${symbol}`);
    console.log(`   精度: ${decimals}`);
    console.log(`   地址: ${USDC_ADDRESS}`);
  } catch (error) {
    console.error('❌ 连接合约失败:', error.message);
    process.exit(1);
  }
  
  // 5. 查看当前 USDC 余额
  const balanceBefore = await usdc.balanceOf(wallet.address);
  console.log(`💵 当前 USDC 余额: ${ethers.utils.formatUnits(balanceBefore, 6)} USDC`);
  
  // 6. 铸造 USDC
  const mintAmount = ethers.utils.parseUnits('1000', 6); // 1000 USDC
  
  console.log('\n🔨 开始铸造 1000 USDC...\n');
  
  try {
    // 估算 gas
    const gasEstimate = await usdc.estimateGas.mint(wallet.address, mintAmount);
    console.log(`⛽ 预估 gas: ${gasEstimate.toString()}`);
    
    // 发送交易
    console.log('📤 发送交易...');
    const tx = await usdc.mint(wallet.address, mintAmount, {
      gasLimit: gasEstimate.mul(120).div(100) // 增加 20% buffer
    });
    
    console.log(`✅ 交易已发送: ${tx.hash}`);
    console.log(`🔗 查看: https://amoy.polygonscan.com/tx/${tx.hash}`);
    
    console.log('\n⏳ 等待交易确认...');
    const receipt = await tx.wait();
    
    console.log(`✅ 交易已确认！区块: ${receipt.blockNumber}`);
    
    // 7. 查看新余额
    const balanceAfter = await usdc.balanceOf(wallet.address);
    const increase = balanceAfter.sub(balanceBefore);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 铸造成功！\n');
    console.log(`💵 新 USDC 余额: ${ethers.utils.formatUnits(balanceAfter, 6)} USDC`);
    console.log(`📈 增加: ${ethers.utils.formatUnits(increase, 6)} USDC`);
    
    console.log('\n✅ 现在可以激活市场了！\n');
    
  } catch (error) {
    console.error('\n❌ 铸造失败:', error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n💡 原因: POL 余额不足，无法支付 gas 费用');
      console.log('请获取更多测试 POL: https://faucet.polygon.technology/\n');
    } else if (error.message.includes('gas required exceeds allowance')) {
      console.log('\n💡 原因: gas 估算失败，可能是合约问题');
    } else {
      console.log('\n详细错误:', error);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });





























