// 🌐 测试您配置的 Alchemy RPC
// 只测试 .env.local 中配置的 RPC

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

async function testMyRPC() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 测试您的 Alchemy RPC');
  console.log('='.repeat(60) + '\n');

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  if (!rpcUrl) {
    console.log('❌ NEXT_PUBLIC_RPC_URL 未配置！');
    console.log('\n请在 .env.local 中添加：');
    console.log('NEXT_PUBLIC_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY\n');
    return;
  }

  console.log(`📍 RPC URL: ${rpcUrl}\n`);

  try {
    console.log('⏳ 正在连接...');
    const startTime = Date.now();

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: 'polygon-amoy',
      chainId: 80002
    });

    // 获取区块号
    const blockNumber = await provider.getBlockNumber();
    const latency = Date.now() - startTime;

    console.log(`✅ 连接成功！\n`);
    console.log(`📊 网络信息：`);
    console.log(`   Chain ID: 80002 (Polygon Amoy)`);
    console.log(`   当前区块: ${blockNumber}`);
    console.log(`   响应时间: ${latency}ms\n`);

    // 测试获取 Gas Price
    const gasPrice = await provider.getGasPrice();
    console.log(`⛽ Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei\n`);

    // 测试平台钱包（如果配置了）
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    if (privateKey) {
      console.log('💰 测试平台钱包...');
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log(`   地址: ${wallet.address}`);

      const balance = await wallet.getBalance();
      console.log(`   MATIC 余额: ${ethers.utils.formatEther(balance)} MATIC`);

      if (balance.lt(ethers.utils.parseEther('0.01'))) {
        console.log(`   ⚠️  余额不足！建议至少有 0.1 MATIC`);
        console.log(`   获取测试 MATIC: https://faucet.polygon.technology/\n`);
      } else {
        console.log(`   ✅ 余额充足\n`);
      }

      // 测试 USDC 余额
      const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
      const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
      
      try {
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const usdcBalance = await usdc.balanceOf(wallet.address);
        console.log(`💵 Mock USDC 余额: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
        
        if (usdcBalance.lt(ethers.utils.parseUnits('10', 6))) {
          console.log(`   ⚠️  USDC 不足！激活市场需要至少 10 USDC`);
          console.log(`   需要调用 Mock USDC 合约的 mint 函数\n`);
        } else {
          console.log(`   ✅ USDC 充足\n`);
        }
      } catch (error) {
        console.log(`   ⚠️  无法获取 USDC 余额: ${error.message}\n`);
      }
    } else {
      console.log('⚠️  PLATFORM_WALLET_PRIVATE_KEY 未配置');
      console.log('   激活市场需要配置平台钱包私钥\n');
    }

    console.log('='.repeat(60));
    console.log('✅ RPC 测试通过！');
    console.log('='.repeat(60));
    console.log('\n💡 下一步：');
    console.log('   1. 确保 PLATFORM_WALLET_PRIVATE_KEY 已配置');
    console.log('   2. 确保平台钱包有足够的 MATIC 和 USDC');
    console.log('   3. 重启开发服务器');
    console.log('   4. 在管理页面点击"激活"\n');

  } catch (error) {
    console.log('❌ 连接失败！\n');
    console.log(`错误: ${error.message}\n`);
    
    console.log('='.repeat(60));
    console.log('🔧 故障排查：');
    console.log('='.repeat(60));
    console.log('1. 检查 RPC URL 是否正确');
    console.log('   当前: ' + rpcUrl);
    console.log('   格式: https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY\n');
    console.log('2. 检查 Alchemy API Key 是否有效');
    console.log('   登录 Alchemy Dashboard 确认\n');
    console.log('3. 检查网络连接');
    console.log('   确保能访问 alchemy.com\n');
    console.log('4. 检查 Alchemy App 配置');
    console.log('   确认选择的是 Polygon Amoy 网络\n');
  }
}

testMyRPC().catch(console.error);

