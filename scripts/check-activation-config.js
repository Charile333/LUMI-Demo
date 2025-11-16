// 🔍 检查市场激活配置
// 检查所有必需的配置和钱包状态

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

async function checkActivationConfig() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查市场激活配置');
  console.log('='.repeat(60) + '\n');

  const checks = {
    rpc: { configured: false, value: '', status: '❌' },
    wallet: { configured: false, value: '', status: '❌' },
    rpcConnection: { success: false, status: '❌' },
    walletBalance: { matic: '0', usdc: '0', status: '❌' }
  };

  // 1. 检查 RPC 配置
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (rpcUrl) {
    checks.rpc.configured = true;
    checks.rpc.value = rpcUrl;
    checks.rpc.status = '✅';
    console.log('✅ NEXT_PUBLIC_RPC_URL: 已配置');
    console.log(`   ${rpcUrl.substring(0, 50)}...\n`);
  } else {
    console.log('❌ NEXT_PUBLIC_RPC_URL: 未配置\n');
  }

  // 2. 检查平台钱包配置
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  if (privateKey) {
    checks.wallet.configured = true;
    checks.wallet.value = privateKey.substring(0, 10) + '...';
    checks.wallet.status = '✅';
    console.log('✅ PLATFORM_WALLET_PRIVATE_KEY: 已配置');
    console.log(`   ${privateKey.substring(0, 10)}...\n`);
  } else {
    console.log('❌ PLATFORM_WALLET_PRIVATE_KEY: 未配置');
    console.log('   ⚠️  这是激活市场必需的！\n');
  }

  // 3. 测试 RPC 连接
  if (rpcUrl) {
    try {
      console.log('🌐 测试 RPC 连接...');
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
        name: 'polygon-amoy',
        chainId: 80002
      });
      
      const blockNumber = await provider.getBlockNumber();
      checks.rpcConnection.success = true;
      checks.rpcConnection.status = '✅';
      console.log(`✅ RPC 连接成功 (区块: ${blockNumber})\n`);
    } catch (error) {
      console.log(`❌ RPC 连接失败: ${error.message}\n`);
    }
  }

  // 4. 检查钱包余额（如果配置了）
  if (privateKey && rpcUrl) {
    try {
      console.log('💰 检查平台钱包状态...');
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
        name: 'polygon-amoy',
        chainId: 80002
      });
      
      const wallet = new ethers.Wallet(privateKey, provider);
      const address = wallet.address;
      console.log(`   地址: ${address}`);

      // 检查 MATIC 余额
      const balance = await wallet.getBalance();
      const maticBalance = ethers.utils.formatEther(balance);
      checks.walletBalance.matic = maticBalance;
      
      console.log(`   MATIC 余额: ${maticBalance} MATIC`);
      
      if (balance.lt(ethers.utils.parseEther('0.1'))) {
        console.log(`   ⚠️  MATIC 余额不足！建议至少有 0.1 MATIC`);
        console.log(`   获取测试 MATIC: https://faucet.polygon.technology/\n`);
      } else {
        console.log(`   ✅ MATIC 余额充足\n`);
        checks.walletBalance.status = '✅';
      }

      // 检查 USDC 余额
      const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
      const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
      
      try {
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const usdcBalance = await usdc.balanceOf(address);
        const usdcFormatted = ethers.utils.formatUnits(usdcBalance, 6);
        checks.walletBalance.usdc = usdcFormatted;
        
        console.log(`💵 Mock USDC 余额: ${usdcFormatted} USDC`);
        
        if (usdcBalance.lt(ethers.utils.parseUnits('10', 6))) {
          console.log(`   ⚠️  USDC 余额不足！激活市场需要至少 10 USDC`);
          console.log(`   需要调用 Mock USDC 合约的 mint 函数\n`);
        } else {
          console.log(`   ✅ USDC 余额充足\n`);
        }
      } catch (error) {
        console.log(`   ⚠️  无法获取 USDC 余额: ${error.message}\n`);
      }

    } catch (error) {
      console.log(`❌ 检查钱包失败: ${error.message}\n`);
    }
  }

  // 总结
  console.log('='.repeat(60));
  console.log('📊 配置检查总结');
  console.log('='.repeat(60));
  console.log(`RPC 配置: ${checks.rpc.status}`);
  console.log(`平台钱包: ${checks.wallet.status}`);
  console.log(`RPC 连接: ${checks.rpcConnection.status}`);
  console.log(`钱包余额: ${checks.walletBalance.status}`);
  console.log('');

  // 诊断建议
  if (!checks.wallet.configured) {
    console.log('❌ 问题：平台钱包未配置');
    console.log('\n💡 解决方案：');
    console.log('   1. 在 .env.local 中添加：');
    console.log('      PLATFORM_WALLET_PRIVATE_KEY=0x你的私钥');
    console.log('   2. 确保这是 Polygon Amoy 测试网的钱包');
    console.log('   3. 钱包需要有 MATIC 和 USDC\n');
  }

  if (checks.wallet.configured && checks.walletBalance.matic === '0') {
    console.log('❌ 问题：钱包余额不足');
    console.log('\n💡 解决方案：');
    console.log('   1. 获取测试 MATIC: https://faucet.polygon.technology/');
    console.log('   2. 获取测试 USDC: 需要调用 Mock USDC 合约 mint 函数');
    console.log('   3. 或我可以帮您创建一个 mint 脚本\n');
  }

  if (checks.rpc.configured && !checks.rpcConnection.success) {
    console.log('❌ 问题：RPC 无法连接');
    console.log('\n💡 解决方案：');
    console.log('   1. 检查 Alchemy API Key 是否正确');
    console.log('   2. 检查网络连接');
    console.log('   3. 确认 Alchemy App 选择了 Polygon Amoy 网络\n');
  }

  if (checks.rpc.status === '✅' && 
      checks.wallet.status === '✅' && 
      checks.rpcConnection.success && 
      parseFloat(checks.walletBalance.matic) >= 0.1) {
    console.log('✅ 所有配置检查通过！');
    console.log('   现在可以尝试激活市场了\n');
  }

  console.log('='.repeat(60) + '\n');
}

checkActivationConfig().catch(console.error);


