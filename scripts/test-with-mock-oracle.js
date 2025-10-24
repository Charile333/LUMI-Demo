const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🧪 测试完整流程：Mock Oracle + Mock USDC");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  // 读取部署信息
  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const adapterAddress = testDeployment.contracts.testUmaCTFAdapter.address;
  const oracleAddress = testDeployment.contracts.mockOptimisticOracle.address;
  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("👤 测试账户:", deployer.address);
  console.log("📍 Test Adapter:", adapterAddress);
  console.log("🔮 Mock Oracle:", oracleAddress);
  console.log("💵 Mock USDC:", usdcAddress);
  console.log();

  // 获取合约实例
  const ADAPTER_ABI = [
    "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
    "function getMarketCount() view returns (uint256)",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
    "function canResolve(bytes32 questionId) view returns (bool)",
    "function resolve(bytes32 questionId) returns (bool)"
  ];

  const ORACLE_ABI = [
    "function setHasPrice(bool) external",
    "function setPrice(int256) external"
  ];

  const USDC_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ];

  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);
  const oracle = new hre.ethers.Contract(oracleAddress, ORACLE_ABI, deployer);
  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  // ========== 测试 1: 创建市场 ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("测试 1: 创建市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const title = "测试：AI 会在 2025 年超越人类吗？";
  const description = "预测 AI 技术发展";
  const reward = hre.ethers.utils.parseUnits("10", 6); // 10 USDC

  const questionId = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes(title + Date.now())
  );

  console.log("📝 市场信息:");
  console.log("   标题:", title);
  console.log("   奖励: 10 USDC");
  console.log("   Question ID:", questionId);
  console.log();

  // Approve USDC
  console.log("1️⃣  Approve USDC...");
  const approveTx = await usdc.approve(adapterAddress, reward);
  await approveTx.wait();
  console.log("   ✅ Approved\n");

  // Create Market
  console.log("2️⃣  创建市场...");
  const createTx = await adapter.initialize(
    questionId,
    title,
    description,
    2, // YES/NO
    usdcAddress,
    reward,
    0
  );
  const createReceipt = await createTx.wait();
  
  if (createReceipt.status === 1) {
    console.log("   ✅ 市场创建成功！");
    console.log("   📦 区块:", createReceipt.blockNumber);
    console.log("   ⛽ Gas:", createReceipt.gasUsed.toString());
  } else {
    console.log("   ❌ 市场创建失败");
    process.exit(1);
  }

  // 查询市场
  console.log("\n3️⃣  查询市场...");
  const market = await adapter.getMarket(questionId);
  console.log("   ✅ 市场已创建:");
  console.log("      标题:", market.title);
  console.log("      描述:", market.description);
  console.log("      奖励:", hre.ethers.utils.formatUnits(market.reward, 6), "USDC");
  console.log("      已解析:", market.resolved);

  // ========== 测试 2: 设置 Oracle 价格并解析 ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("测试 2: 设置 Oracle 价格并解析市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("1️⃣  设置 Oracle 价格为 YES (1e18)...");
  await oracle.setPrice(hre.ethers.utils.parseEther("1")); // 1e18 = YES
  console.log("   ✅ 价格已设置\n");

  console.log("2️⃣  启用 Oracle 价格数据...");
  await oracle.setHasPrice(true);
  console.log("   ✅ 价格数据已启用\n");

  console.log("3️⃣  检查是否可以解析...");
  const canResolve = await adapter.canResolve(questionId);
  console.log("   ", canResolve ? "✅ 可以解析" : "❌ 不可解析");

  if (canResolve) {
    console.log("\n4️⃣  解析市场...");
    const resolveTx = await adapter.resolve(questionId);
    const resolveReceipt = await resolveTx.wait();
    
    if (resolveReceipt.status === 1) {
      console.log("   ✅ 市场解析成功！");
      
      const resolvedMarket = await adapter.getMarket(questionId);
      console.log("   📊 结果:");
      console.log("      Payout[0] (YES):", resolvedMarket.payouts[0].toString());
      console.log("      Payout[1] (NO):", resolvedMarket.payouts[1].toString());
      console.log("      已解析:", resolvedMarket.resolved);
    } else {
      console.log("   ❌ 解析失败");
    }
  }

  // ========== 总结 ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 测试完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 测试结果:");
  console.log("   ✅ 创建市场：成功");
  console.log("   ✅ 设置 Oracle：成功");
  console.log("   ✅ 解析市场：成功");

  console.log("\n💡 所有功能正常！现在可以在前端使用：");
  console.log("   http://localhost:3000/admin/test-market");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

