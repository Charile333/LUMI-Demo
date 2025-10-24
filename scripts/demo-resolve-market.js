const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🎮 市场解析演示");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );

  const adapterAddress = testDeployment.contracts.testUmaCTFAdapter.address;
  const oracleAddress = testDeployment.contracts.mockOptimisticOracle.address;

  console.log("📍 Test Adapter:", adapterAddress);
  console.log("🔮 Mock Oracle:", oracleAddress);
  console.log();

  const ADAPTER_ABI = [
    "function getMarketCount() view returns (uint256)",
    "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
    "function canResolve(bytes32 questionId) view returns (bool)",
    "function resolve(bytes32 questionId) returns (bool)"
  ];

  const ORACLE_ABI = [
    "function setPrice(int256) external",
    "function setHasPrice(bool) external"
  ];

  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);
  const oracle = new hre.ethers.Contract(oracleAddress, ORACLE_ABI, deployer);

  // 获取第一个市场
  const count = await adapter.getMarketCount();
  console.log("📊 市场总数:", count.toString());

  if (count.eq(0)) {
    console.log("\n⚠️  没有市场可以解析");
    return;
  }

  const marketIds = await adapter.getMarketList(0, 1);
  const questionId = marketIds[0];
  const market = await adapter.getMarket(questionId);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 要解析的市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("标题:", market.title);
  console.log("描述:", market.description);
  console.log("奖励:", hre.ethers.utils.formatUnits(market.reward, 6), "USDC");
  console.log("已解析:", market.resolved ? "是" : "否");

  if (market.resolved) {
    console.log("\n⚠️  此市场已经解析过了");
    console.log("结果:", market.payouts.map(p => p.toString()).join(", "));
    return;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 1: 设置 Oracle 价格");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("设置结果为 YES (1e18)...");
  await oracle.setPrice(hre.ethers.utils.parseEther("1"));
  console.log("✅ 价格已设置: YES\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 2: 启用价格数据");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await oracle.setHasPrice(true);
  console.log("✅ 价格数据已启用\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 3: 检查是否可以解析");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const canResolve = await adapter.canResolve(questionId);
  console.log("可以解析:", canResolve ? "✅ 是" : "❌ 否\n");

  if (!canResolve) {
    console.log("⚠️  无法解析此市场");
    return;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 4: 解析市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("正在解析...");
  const resolveTx = await adapter.resolve(questionId, {
    gasLimit: 500000
  });

  console.log("⏳ 交易哈希:", resolveTx.hash);
  await resolveTx.wait();
  console.log("✅ 市场解析成功！\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 解析结果");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const resolvedMarket = await adapter.getMarket(questionId);
  console.log("标题:", resolvedMarket.title);
  console.log("已解析:", resolvedMarket.resolved ? "是" : "否");
  console.log("结果:");
  console.log("  YES (Outcome 0):", resolvedMarket.payouts[0].toString());
  console.log("  NO  (Outcome 1):", resolvedMarket.payouts[1].toString());

  const winner = resolvedMarket.payouts[0].gt(0) ? "YES" : "NO";
  console.log("\n🏆 获胜结果:", winner);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 演示完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 现在刷新前端页面，可以看到市场已解析！");
  console.log("   http://localhost:3000/admin/test-market\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

