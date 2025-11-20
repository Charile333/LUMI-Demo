// 🪙 铸造测试网 USDC
const { ethers } = require('ethers');

const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
const USDC_ABI = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function main() {
  console.log('🪙 铸造 Mock USDC\n');
  
  // 检查私钥
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ 未配置 PLATFORM_WALLET_PRIVATE_KEY');
    console.log('请在 .env.local 中添加平台钱包私钥');
    process.exit(1);
  }
  
  // 连接区块链
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com';
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`💼 钱包地址: ${wallet.address}`);
  
  // 连接 USDC 合约
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  
  // 查看当前余额
  const balanceBefore = await usdc.balanceOf(wallet.address);
  console.log(`💵 当前 USDC 余额: ${ethers.utils.formatUnits(balanceBefore, 6)}\n`);
  
  // 铸造 1000 USDC
  const amount = ethers.utils.parseUnits('1000', 6);
  console.log(`🔨 正在铸造 1000 USDC...`);
  
  const tx = await usdc.mint(wallet.address, amount);
  console.log(`⏳ 交易已发送: ${tx.hash}`);
  console.log(`   查看: https://amoy.polygonscan.com/tx/${tx.hash}`);
  
  console.log('⏳ 等待确认...');
  await tx.wait();
  
  // 查看新余额
  const balanceAfter = await usdc.balanceOf(wallet.address);
  console.log(`\n✅ 铸造成功！`);
  console.log(`💵 新 USDC 余额: ${ethers.utils.formatUnits(balanceAfter, 6)}`);
  console.log(`📈 增加: ${ethers.utils.formatUnits(balanceAfter.sub(balanceBefore), 6)}`);
  
  console.log('\n🎉 现在可以激活市场了！');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ 铸造失败:', error.message);
    process.exit(1);
  });



























