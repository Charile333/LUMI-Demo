// 检查区块链上的市场数据
const { ethers } = require('ethers');

const RPC_URL = 'https://rpc-amoy.polygon.technology';
const ADAPTER_ADDRESS = '0x5D440c98B55000087a8b0C164f1690551d18CfcC';

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
];

async function checkBlockchainMarkets() {
  console.log('\n=== ⛓️  检查区块链上的市场数据 ===\n');

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const adapter = new ethers.Contract(ADAPTER_ADDRESS, ADAPTER_ABI, provider);

    console.log('📡 连接到: Polygon Amoy 测试网');
    console.log('📝 合约地址:', ADAPTER_ADDRESS);
    console.log('');

    // 获取市场数量
    const count = await adapter.getMarketCount();
    console.log(`✅ 区块链上共有 ${count.toString()} 个市场\n`);

    if (count.gt(0)) {
      // 获取所有市场
      const marketIds = await adapter.getMarketList(0, count.toNumber());
      
      console.log('📋 市场详情：\n');
      
      for (let i = 0; i < marketIds.length; i++) {
        const questionId = marketIds[i];
        const market = await adapter.getMarket(questionId);
        
        console.log(`📌 市场 ${i + 1}:`);
        console.log(`   Question ID: ${questionId}`);
        console.log(`   Condition ID: ${market.conditionId}`);
        console.log(`   标题: ${market.title}`);
        console.log(`   描述: ${market.description.substring(0, 80)}...`);
        console.log(`   结果数量: ${market.outcomeSlotCount.toString()}`);
        console.log(`   奖励: ${ethers.utils.formatUnits(market.reward, 6)} USDC`);
        console.log(`   已结算: ${market.resolved ? '是' : '否'}`);
        console.log(`   奖励代币: ${market.rewardToken}`);
        console.log('');
      }
    } else {
      console.log('⚠️  区块链上暂无市场数据');
      console.log('💡 请先在管理后台创建市场');
    }

    console.log('═══════════════════════════════════════');
    console.log('🎉 区块链数据检查完成！');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.log('\n可能的原因:');
    console.log('1. RPC 连接失败');
    console.log('2. 合约地址不正确');
    console.log('3. 网络问题\n');
    process.exit(1);
  }
}

checkBlockchainMarkets();






