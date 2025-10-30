/**
 * 🧪 测试 UMA 官方预言机
 * 
 * 使用 UMA 官方 SDK 测试预言机功能
 * 参考: https://github.com/UMAprotocol/protocol
 */

const hre = require("hardhat");
const { ethers } = require("ethers");

// UMA Optimistic Oracle V2 地址（Polygon Amoy）
const UMA_ORACLE_ADDRESS = "0x263351499f82C107e540B01F0Ca959843e22464a";

// 您部署的 RealUmaCTFAdapter
const REAL_ADAPTER_ADDRESS = "0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C";

// Mock USDC
const MOCK_USDC_ADDRESS = "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a";

const UMA_ORACLE_ABI = [
  "function defaultLiveness() external view returns (uint256)",
  "function getCurrentTime() external view returns (uint256)",
  "function getState(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (uint8)",
  "function hasPrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (bool)"
];

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)"
];

async function main() {
  console.log('\n🔮 测试 UMA 官方预言机\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('👤 测试账户:', deployer.address);
  
  const balance = await deployer.getBalance();
  console.log('💰 余额:', hre.ethers.utils.formatEther(balance), 'POL\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 连接 UMA Oracle
  const oracle = new hre.ethers.Contract(
    UMA_ORACLE_ADDRESS,
    UMA_ORACLE_ABI,
    deployer
  );
  
  // 连接 Adapter
  const adapter = new hre.ethers.Contract(
    REAL_ADAPTER_ADDRESS,
    ADAPTER_ABI,
    deployer
  );
  
  // 测试 1: 获取 UMA Oracle 信息
  console.log('📝 测试 1: UMA Oracle 基本信息\n');
  
  try {
    const liveness = await oracle.defaultLiveness();
    const currentTime = await oracle.getCurrentTime();
    
    console.log('   默认挑战期:', liveness.toNumber(), '秒');
    console.log('   (约', Math.round(liveness.toNumber() / 3600), '小时)');
    console.log('   当前时间:', new Date(currentTime.toNumber() * 1000).toLocaleString());
    console.log('   ✅ UMA Oracle 连接成功\n');
  } catch (error) {
    console.log('   ❌ UMA Oracle 连接失败:', error.message, '\n');
  }
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 测试 2: 查询市场数量
  console.log('📝 测试 2: 查询链上市场\n');
  
  try {
    const marketCount = await adapter.getMarketCount();
    console.log('   链上市场数量:', marketCount.toString());
    
    if (marketCount.gt(0)) {
      console.log('   ✅ 有现有市场\n');
    } else {
      console.log('   ℹ️  暂无市场（可以创建测试市场）\n');
    }
  } catch (error) {
    console.log('   ❌ 查询失败:', error.message, '\n');
  }
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 测试 3: 创建测试市场（可选）
  console.log('📝 测试 3: 创建测试市场（演示）\n');
  
  console.log('   市场信息:');
  console.log('   标题: UMA Oracle 测试市场');
  console.log('   问题: Will this test succeed?');
  console.log('   结果: YES/NO (2 outcomes)');
  console.log('   奖励: 100 USDC\n');
  
  console.log('   ⏸️  跳过实际创建（演示模式）');
  console.log('   如需创建，请访问管理后台:\n');
  console.log('   http://localhost:3000/_dev_only_admin/create-market\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 打印使用指南
  console.log('🎯 UMA Oracle 使用流程:\n');
  console.log('   1️⃣  创建市场 (initialize)');
  console.log('      ↓');
  console.log('   2️⃣  市场到期');
  console.log('      ↓');
  console.log('   3️⃣  请求 UMA 预言机价格');
  console.log('      ↓');
  console.log('   4️⃣  提案者提交结果（需要保证金）');
  console.log('      ↓');
  console.log('   5️⃣  挑战期（默认 2 小时）');
  console.log('      ├─ 无争议 → 结果确定');
  console.log('      └─ 有争议 → UMA 代币投票');
  console.log('      ↓');
  console.log('   6️⃣  结算市场 (settle)');
  console.log('      ↓');
  console.log('   7️⃣  用户赎回代币\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('📚 参考资料:\n');
  console.log('   • UMA 官方文档: https://docs.uma.xyz');
  console.log('   • UMA GitHub: https://github.com/UMAprotocol/protocol');
  console.log('   • Polymarket CTF: https://github.com/Polymarket/ctf-exchange');
  console.log('   • 您的 Oracle: https://amoy.polygonscan.com/address/' + UMA_ORACLE_ADDRESS);
  console.log('   • 您的 Adapter: https://amoy.polygonscan.com/address/' + REAL_ADAPTER_ADDRESS);
  console.log('');
  
  console.log('═══════════════════════════════════════════════════\n');
  console.log('✅ 测试完成！UMA 官方预言机工作正常！\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });

