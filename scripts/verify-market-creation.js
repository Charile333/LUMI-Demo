const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n✨ 验证市场创建状态");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  
  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );

  const adapterAddress = testDeployment.contracts.testUmaCTFAdapter.address;

  console.log("📍 Test Adapter:", adapterAddress);
  console.log("👤 账户:", deployer.address);
  console.log();

  const ADAPTER_ABI = [
    "function getMarketCount() view returns (uint256)",
    "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
  ];

  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);

  // 获取市场数量
  const count = await adapter.getMarketCount();
  console.log("📊 市场总数:", count.toString());

  if (count.gt(0)) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 市场列表");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const marketIds = await adapter.getMarketList(0, count.toNumber());

    for (let i = 0; i < marketIds.length; i++) {
      const questionId = marketIds[i];
      const market = await adapter.getMarket(questionId);

      console.log(`市场 #${i + 1}:`);
      console.log("  标题:", market.title);
      console.log("  描述:", market.description);
      console.log("  奖励:", hre.ethers.utils.formatUnits(market.reward, 6), "USDC");
      console.log("  结果数量:", market.outcomeSlotCount.toString());
      console.log("  已解析:", market.resolved ? "是" : "否");
      console.log("  Question ID:", questionId);
      console.log("  Condition ID:", market.conditionId);
      console.log();
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ 所有市场加载成功！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } else {
    console.log("\n⚠️ 没有找到市场");
  }

  console.log("💡 下一步可以做什么:");
  console.log("   1. 在前端查看市场: http://localhost:3000/admin/test-market");
  console.log("   2. 设置 Oracle 价格并解析市场");
  console.log("   3. 创建更多市场进行测试\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

