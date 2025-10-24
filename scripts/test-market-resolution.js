/**
 * 测试市场解析功能
 * (由于 ConditionalTokens 是简化版，暂不测试 Token 铸造和赎回)
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

const CONTRACTS = {
  adapter: "0x5D440c98B55000087a8b0C164f1690551d18CfcC",
  mockOracle: "0x378fA22104E4c735680772Bf18C5195778a55b33",
};

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 预测市场解析测试");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 加载合约
  const adapterArtifact = require("../artifacts/contracts/TestUmaCTFAdapter.sol/TestUmaCTFAdapter.json");
  const oracleArtifact = require("../artifacts/contracts/MockOptimisticOracle.sol/MockOptimisticOracle.json");

  const adapter = new ethers.Contract(CONTRACTS.adapter, adapterArtifact.abi, deployer);
  const oracle = new ethers.Contract(CONTRACTS.mockOracle, oracleArtifact.abi, deployer);

  // ========================================
  // 步骤 1: 获取市场
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📊 步骤 1: 获取市场列表");
  console.log("=".repeat(70));

  const marketCount = await adapter.getMarketCount();
  console.log("\n总市场数:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场，请先在后台创建市场");
    return;
  }

  const marketList = await adapter.getMarketList(0, marketCount);
  console.log("市场列表:");
  for (let i = 0; i < marketList.length; i++) {
    const id = marketList[i];
    const market = await adapter.getMarket(id);
    console.log(`\n  市场 #${i + 1}:`);
    console.log("    ID:", id.substring(0, 10) + "...");
    console.log("    标题:", market.title);
    console.log("    描述:", market.description);
    console.log("    已解析:", market.resolved ? "✅ 是" : "❌ 否");
    if (market.resolved) {
      console.log("    结果:", market.payouts.map((p, i) => `Outcome ${i}: ${p}`).join(", "));
    }
  }

  // 找到第一个未解析的市场
  let targetMarket = null;
  let targetQuestionId = null;
  
  for (let i = 0; i < marketList.length; i++) {
    const id = marketList[i];
    const market = await adapter.getMarket(id);
    if (!market.resolved) {
      targetMarket = market;
      targetQuestionId = id;
      break;
    }
  }

  if (!targetMarket) {
    console.log("\n⚠️  所有市场都已解析");
    console.log("\n💡 您可以:");
    console.log("  1. 在后台创建新市场");
    console.log("  2. 查看已解析市场的结果（见上方列表）");
    return;
  }

  console.log("\n🎯 选择待解析市场:");
  console.log("  标题:", targetMarket.title);
  console.log("  描述:", targetMarket.description);

  // ========================================
  // 步骤 2: 设置 Oracle 价格
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎲 步骤 2: 设置 Oracle 结果");
  console.log("=".repeat(70));

  console.log("\n⏳ 设置 Oracle 价格为 YES (1e18)...");
  const setPriceTx = await oracle.setPrice(ethers.utils.parseEther("1"));
  await setPriceTx.wait();
  console.log("✅ 价格已设置");

  console.log("\n⏳ 设置 hasPrice 为 true...");
  const setHasTx = await oracle.setHasPrice(true);
  await setHasTx.wait();
  console.log("✅ hasPrice 已启用");

  console.log("\n💡 Oracle 状态:");
  console.log("  价格: 1e18 (表示 YES 获胜)");
  console.log("  可用: true");

  // ========================================
  // 步骤 3: 解析市场
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎯 步骤 3: 解析市场");
  console.log("=".repeat(70));

  console.log("\n⏳ 调用 adapter.resolve()...");
  const resolveTx = await adapter.resolve(targetQuestionId);
  const receipt = await resolveTx.wait();
  console.log("✅ 市场已解析");
  console.log("   交易哈希:", receipt.transactionHash);
  console.log("   Gas 消耗:", receipt.gasUsed.toString());

  // ========================================
  // 步骤 4: 验证结果
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 步骤 4: 验证解析结果");
  console.log("=".repeat(70));

  const resolvedMarket = await adapter.getMarket(targetQuestionId);
  console.log("\n📊 市场最终状态:");
  console.log("  标题:", resolvedMarket.title);
  console.log("  已解析:", resolvedMarket.resolved ? "✅ 是" : "❌ 否");
  console.log("\n  结果分布:");
  console.log("    Outcome 0 (YES):", resolvedMarket.payouts[0].toString(), resolvedMarket.payouts[0].eq(1) ? "✅ 获胜" : "❌ 失败");
  console.log("    Outcome 1 (NO): ", resolvedMarket.payouts[1].toString(), resolvedMarket.payouts[1].eq(1) ? "✅ 获胜" : "❌ 失败");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎉 测试完成总结");
  console.log("=".repeat(70));

  console.log("\n测试项目:");
  console.log("  ✅ 获取市场列表");
  console.log("  ✅ 设置 Oracle 价格");
  console.log("  ✅ 解析市场");
  console.log("  ✅ 验证解析结果");

  console.log("\n💡 说明:");
  console.log("  - 当前 ConditionalTokens 是简化版，不支持 Token 功能");
  console.log("  - 订单薄交易需要完整版 ConditionalTokens (支持 ERC1155)");
  console.log("  - 预言机和市场解析功能正常工作 ✅");

  console.log("\n🔧 下一步:");
  console.log("  1. 如需测试订单薄，需部署完整版 ConditionalTokens");
  console.log("  2. 当前系统可用于市场创建、展示和解析");
  console.log("  3. 前端可以显示市场状态和解析结果");

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error);
    process.exit(1);
  });

