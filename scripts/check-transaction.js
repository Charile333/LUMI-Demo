// 🔍 检查交易详情
// 用于分析失败的交易

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

async function checkTransaction() {
  const txHash = '0x40830a582a0db25fc8fd783f76dfc934a3e7a94a7df3af7ccff7492772971a10';
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  if (!rpcUrl) {
    console.log('❌ NEXT_PUBLIC_RPC_URL 未配置！');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查交易详情');
  console.log('='.repeat(60) + '\n');

  console.log(`交易哈希: ${txHash}\n`);

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: 'polygon-amoy',
      chainId: 80002
    });

    // 获取交易详情
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log('❌ 交易不存在！');
      return;
    }

    console.log('📋 交易信息：');
    console.log(`   发送地址 (from): ${tx.from}`);
    console.log(`   接收地址 (to): ${tx.to}`);
    console.log(`   金额 (value): ${ethers.utils.formatEther(tx.value)} MATIC`);
    console.log(`   Gas Limit: ${tx.gasLimit.toString()}`);
    console.log(`   Gas Price: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
    console.log(`   Nonce: ${tx.nonce}`);
    console.log(`   Chain ID: ${tx.chainId}\n`);

    // 获取交易收据
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log('⚠️ 交易收据不存在（可能还在 pending）\n');
    } else {
      console.log('📋 交易收据：');
      console.log(`   状态: ${receipt.status === 1 ? '✅ 成功' : '❌ 失败'}`);
      console.log(`   区块号: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`   实际 Gas 费用: ${ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice))} MATIC\n`);

      if (receipt.status === 0) {
        console.log('❌ 交易失败！可能的原因：');
        console.log('   1. Gas 不足');
        console.log('   2. 合约执行失败（revert）');
        console.log('   3. 参数错误');
        console.log('   4. 权限不足\n');

        // 尝试解码交易数据
        if (tx.data && tx.data !== '0x') {
          console.log('🔍 尝试分析交易数据...');
          try {
            // Adapter ABI
            const ADAPTER_ABI = [
              "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)"
            ];
            const iface = new ethers.utils.Interface(ADAPTER_ABI);
            const decoded = iface.parseTransaction({ data: tx.data });
            console.log(`   函数: ${decoded.name}`);
            console.log(`   参数:`, decoded.args);
          } catch (e) {
            console.log(`   ⚠️ 无法解码交易数据: ${e.message}`);
          }
        }
      }
    }

    // 检查发送地址余额
    console.log('\n💰 发送地址余额：');
    const balance = await provider.getBalance(tx.from);
    console.log(`   MATIC: ${ethers.utils.formatEther(balance)} MATIC`);

    // 检查接收地址（如果是合约）
    if (tx.to) {
      const code = await provider.getCode(tx.to);
      if (code !== '0x') {
        console.log(`\n📄 接收地址是合约: ${tx.to}`);
        console.log(`   合约代码长度: ${code.length} 字符`);
      } else {
        console.log(`\n📄 接收地址是普通地址: ${tx.to}`);
      }
    }

    // Polygonscan 链接
    console.log('\n🔗 查看交易详情：');
    console.log(`   https://amoy.polygonscan.com/tx/${txHash}\n`);

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }

  console.log('='.repeat(60) + '\n');
}

checkTransaction().catch(console.error);

