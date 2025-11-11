// 🔍 区块链连接测试脚本

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function testBlockchainConnection() {
  console.log('\n🔍 开始诊断区块链连接...\n');
  
  // 1. 检查环境变量
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com';
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  
  console.log('📍 RPC URL:', rpcUrl);
  
  if (!privateKey) {
    console.error('❌ PLATFORM_WALLET_PRIVATE_KEY 未配置');
    console.log('\n💡 市场激活需要平台钱包私钥');
    console.log('   请在 .env.local 中配置：');
    console.log('   PLATFORM_WALLET_PRIVATE_KEY=0x...\n');
    process.exit(1);
  }
  
  console.log('✅ PLATFORM_WALLET_PRIVATE_KEY 已配置\n');
  
  // 2. 测试 RPC 连接
  console.log('🔌 正在测试 RPC 连接...');
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // 设置超时
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('RPC 连接超时 (10秒)')), 10000)
    );
    
    const start = Date.now();
    const network = await Promise.race([provider.getNetwork(), timeout]);
    const duration = Date.now() - start;
    
    console.log(`✅ RPC 连接成功! (耗时: ${duration}ms)`);
    console.log(`🌐 网络: ${network.name} (chainId: ${network.chainId})\n`);
    
    // 3. 测试钱包
    console.log('💰 测试钱包...');
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`📍 钱包地址: ${wallet.address}`);
    
    const balance = await wallet.getBalance();
    console.log(`💵 余额: ${ethers.utils.formatEther(balance)} POL (MATIC)\n`);
    
    if (balance.eq(0)) {
      console.warn('⚠️  警告: 钱包余额为 0，无法支付 gas 费用');
      console.warn('    请到水龙头获取测试币: https://faucet.polygon.technology/\n');
    }
    
    // 4. 测试 USDC 合约
    console.log('🪙 测试 USDC 合约...');
    const usdcAddress = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
    const usdcAbi = [
      'function balanceOf(address account) view returns (uint256)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)'
    ];
    
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
    
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    const usdcBalance = await usdc.balanceOf(wallet.address);
    
    console.log(`✅ USDC 合约连接成功`);
    console.log(`📍 Token: ${symbol}`);
    console.log(`📍 精度: ${decimals}`);
    console.log(`💵 USDC 余额: ${ethers.utils.formatUnits(usdcBalance, decimals)}\n`);
    
    if (usdcBalance.eq(0)) {
      console.warn('⚠️  警告: USDC 余额为 0，无法激活市场');
      console.warn('    市场激活需要 USDC 作为奖励金\n');
    }
    
    console.log('🎉 区块链连接完全正常!\n');
    
    // 5. 总结
    console.log('📊 激活市场所需条件:');
    console.log(`  ✅ RPC 连接: 正常`);
    console.log(`  ✅ 钱包配置: 正常`);
    console.log(`  ${balance.gt(0) ? '✅' : '❌'} POL 余额: ${ethers.utils.formatEther(balance)} (用于 gas)`);
    console.log(`  ${usdcBalance.gt(0) ? '✅' : '❌'} USDC 余额: ${ethers.utils.formatUnits(usdcBalance, decimals)} (用于奖励)`);
    
    if (balance.eq(0) || usdcBalance.eq(0)) {
      console.log('\n⚠️  无法激活市场，请先充值钱包\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n可能的原因:');
      console.log('  1. RPC 服务器响应慢或不可用');
      console.log('  2. 网络连接问题');
      console.log('  3. 防火墙阻止连接');
      console.log('\n建议:');
      console.log('  - 尝试更换 RPC URL');
      console.log('  - 检查网络连接');
    } else if (error.message.includes('invalid address')) {
      console.log('\n可能的原因:');
      console.log('  1. PLATFORM_WALLET_PRIVATE_KEY 格式错误');
      console.log('  2. 私钥不完整');
      console.log('\n建议:');
      console.log('  - 确保私钥以 0x 开头');
      console.log('  - 私钥应该是 64 个十六进制字符');
    }
    
    process.exit(1);
  }
}

testBlockchainConnection();









