// 🚀 直接激活市场脚本
// 绕过 Next.js 的 ethers.js 网络检测问题
// 使用方法: node scripts/activate-market-direct.js <marketId>

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');

// 合约地址配置
const CONTRACTS = {
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  exchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};

const ADAPTER_ABI = [
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function activateMarket(marketId) {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 直接激活市场 ${marketId}`);
  console.log('='.repeat(60) + '\n');

  // 1. 检查配置
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rpcUrl || !privateKey || !supabaseUrl || !supabaseKey) {
    console.log('❌ 配置缺失！');
    console.log('   需要: NEXT_PUBLIC_RPC_URL, PLATFORM_WALLET_PRIVATE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // 2. 连接 Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 3. 获取市场数据
  const { data: market, error: marketError } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (marketError || !market) {
    console.log(`❌ 市场不存在: ${marketError?.message || '未找到'}`);
    return;
  }

  console.log(`📊 市场信息:`);
  console.log(`   标题: ${market.title}`);
  console.log(`   状态: ${market.blockchain_status}`);
  console.log(`   Question ID: ${market.question_id || '未设置'}\n`);

  if (market.blockchain_status === 'created') {
    console.log('⚠️ 市场已激活！');
    console.log(`   Condition ID: ${market.condition_id || '未设置'}\n`);
    return;
  }

  if (!market.question_id) {
    console.log('❌ 市场没有 question_id，无法激活！');
    return;
  }

  // 4. 连接区块链（使用 Node.js 原生 ethers.js，不受 Next.js 影响）
  console.log('🌐 连接区块链...');
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: 'polygon-amoy',
    chainId: 80002
  });

  // 🔧 确保私钥格式正确（如果用户没有输入 0x 前缀，自动添加）
  const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  console.log(`🔑 私钥格式: ${normalizedPrivateKey.substring(0, 10)}... (长度: ${normalizedPrivateKey.length} 字符)`);
  
  const wallet = new ethers.Wallet(normalizedPrivateKey, provider);
  console.log(`💰 平台钱包: ${wallet.address}`);

  // 检查余额
  const balance = await wallet.getBalance();
  console.log(`   MATIC 余额: ${ethers.utils.formatEther(balance)} MATIC\n`);

  if (balance.lt(ethers.utils.parseEther('0.01'))) {
    console.log('❌ MATIC 余额不足！');
    return;
  }

  // 5. 检查 USDC 余额和 approve
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, USDC_ABI, wallet);
  const usdcBalance = await usdc.balanceOf(wallet.address);
  const rewardAmount = ethers.utils.parseUnits((market.reward_amount || 10).toString(), 6);

  console.log(`💵 USDC 余额: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`💵 所需奖励: ${ethers.utils.formatUnits(rewardAmount, 6)} USDC\n`);

  if (usdcBalance.lt(rewardAmount)) {
    console.log('❌ USDC 余额不足！');
    return;
  }

  // 检查 approve
  const allowance = await usdc.allowance(wallet.address, CONTRACTS.adapter);
  console.log(`🔐 当前 Approve: ${ethers.utils.formatUnits(allowance, 6)} USDC`);

  if (allowance.lt(rewardAmount)) {
    console.log('📝 需要 Approve USDC...');
    
    // 🔧 获取当前 Gas 价格，并确保不低于最低要求
    const currentGasPrice = await provider.getGasPrice();
    const minGasPrice = ethers.utils.parseUnits('30', 'gwei'); // 最低 30 Gwei
    const gasPrice = currentGasPrice.gt(minGasPrice) ? currentGasPrice : minGasPrice;
    
    console.log(`⛽ Gas 价格: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
    
    const approveTx = await usdc.approve(CONTRACTS.adapter, rewardAmount, {
      gasLimit: 100000,
      gasPrice: gasPrice // 使用确保的 Gas 价格
    });
    console.log(`⏳ Approve 交易: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('✅ USDC approved\n');
  } else {
    console.log('✅ Approve 额度充足\n');
  }

  // 6. 更新状态为 creating
  await supabase
    .from('markets')
    .update({ blockchain_status: 'creating' })
    .eq('id', marketId);

  // 7. 调用 initialize
  const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, wallet);
  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(market.question_id)
  );

  console.log('📝 创建市场...');
  console.log(`   Question ID: ${questionId}`);

  try {
    // 🔧 获取当前 Gas 价格，并确保不低于最低要求
    const currentGasPrice = await provider.getGasPrice();
    const minGasPrice = ethers.utils.parseUnits('30', 'gwei'); // 最低 30 Gwei
    const gasPrice = currentGasPrice.gt(minGasPrice) ? currentGasPrice : minGasPrice;
    
    console.log(`⛽ Gas 价格: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
    console.log(`   (当前: ${ethers.utils.formatUnits(currentGasPrice, 'gwei')} Gwei, 最低: 30 Gwei)\n`);

    const tx = await adapter.initialize(
      questionId,
      market.title,
      market.description || '',
      2, // YES/NO
      CONTRACTS.mockUSDC,
      rewardAmount,
      0, // customLiveness
      {
        gasLimit: 1200000,
        gasPrice: gasPrice // 使用确保的 Gas 价格
      }
    );

    console.log(`⏳ 交易已发送: ${tx.hash}`);
    console.log(`🔗 查看交易: https://amoy.polygonscan.com/tx/${tx.hash}\n`);

    const receipt = await tx.wait();
    console.log(`✅ 交易已确认，区块: ${receipt.blockNumber}`);

    // 8. 解析 conditionId
    let conditionId = '';
    if (receipt.events && receipt.events.length > 0) {
      const event = receipt.events.find((e) => e.event === 'MarketInitialized');
      if (event && event.args) {
        conditionId = event.args.conditionId;
      }
    }

    if (!conditionId) {
      conditionId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes32', 'uint256'],
          [CONTRACTS.adapter, questionId, 2]
        )
      );
    }

    console.log(`📊 Condition ID: ${conditionId}\n`);

    // 9. 更新数据库
    await supabase
      .from('markets')
      .update({
        blockchain_status: 'created',
        status: 'active',
        condition_id: conditionId,
        activated_at: new Date().toISOString(),
        adapter_address: CONTRACTS.adapter,
        ctf_address: CONTRACTS.conditionalTokens
      })
      .eq('id', marketId);

    console.log('✅ 市场激活成功！\n');
    console.log('='.repeat(60));
    console.log('📋 激活结果:');
    console.log(`   市场 ID: ${marketId}`);
    console.log(`   交易哈希: ${tx.hash}`);
    console.log(`   Condition ID: ${conditionId}`);
    console.log(`   查看交易: https://amoy.polygonscan.com/tx/${tx.hash}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 激活失败:', error.message);
    
    // 更新状态为 failed
    await supabase
      .from('markets')
      .update({ blockchain_status: 'failed' })
      .eq('id', marketId);

    if (error.reason) {
      console.error(`   原因: ${error.reason}`);
    }
    if (error.transaction) {
      console.error(`   交易哈希: ${error.transaction.hash}`);
    }
    console.log('');
  }
}

// 主函数
const marketId = process.argv[2];

if (!marketId) {
  console.log('使用方法: node scripts/activate-market-direct.js <marketId>');
  console.log('示例: node scripts/activate-market-direct.js 24\n');
  process.exit(1);
}

activateMarket(parseInt(marketId)).catch(console.error);

