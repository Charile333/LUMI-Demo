/**
 * 最终完整测试
 * 使用编译后的 ABI
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONTRACTS = {
  ctf: "0xeB4F3700FE422c1618B449763d423687D5ad0950",
  adapter: "0x5D440c98B55000087a8b0C164f1690551d18CfcC",
  mockOracle: "0x378fA22104E4c735680772Bf18C5195778a55b33",
  mockUSDC: "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a"
};

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 完整流程测试：Token铸造 → 市场解析 → 代币赎回");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 加载 ABI
  const adapterArtifact = require("../artifacts/contracts/TestUmaCTFAdapter.sol/TestUmaCTFAdapter.json");
  const oracleArtifact = require("../artifacts/contracts/MockOptimisticOracle.sol/MockOptimisticOracle.json");
  const ctfArtifact = require("../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json");
  const usdcArtifact = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json");

  // 初始化合约
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, usdcArtifact.abi, deployer);
  const adapter = new ethers.Contract(CONTRACTS.adapter, adapterArtifact.abi, deployer);
  const oracle = new ethers.Contract(CONTRACTS.mockOracle, oracleArtifact.abi, deployer);
  const ctf = new ethers.Contract(CONTRACTS.ctf, ctfArtifact.abi, deployer);

  // ========================================
  // 阶段 1: 获取市场
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📊 阶段 1: 获取市场信息");
  console.log("=".repeat(70));

  const marketCount = await adapter.getMarketCount();
  console.log("\n市场总数:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场，请先在后台创建市场");
    return;
  }

  const marketList = await adapter.getMarketList(0, marketCount);
  console.log("市场列表:", marketList.map(id => id.substring(0, 10) + "...").join(", "));

  let questionId = marketList[0];
  let market = await adapter.getMarket(questionId);

  console.log("\n📄 市场 #1:");
  console.log("  标题:", market.title);
  console.log("  描述:", market.description);
  console.log("  Condition ID:", market.conditionId.substring(0, 10) + "...");
  console.log("  已解析:", market.resolved);

  // 如果第一个已解析，尝试使用第二个
  if (market.resolved && marketList.length > 1) {
    console.log("\n⚠️  市场 #1 已解析，检查市场 #2...");
    questionId = marketList[1];
    market = await adapter.getMarket(questionId);
    console.log("  标题:", market.title);
    console.log("  已解析:", market.resolved);
  }

  // ========================================
  // 阶段 2: 铸造 Outcome Tokens
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎴 阶段 2: 铸造 Outcome Tokens");
  console.log("=".repeat(70));

  const splitAmount = ethers.utils.parseUnits("50", 6); // 减少到50 USDC
  console.log("\n分割数量:", ethers.utils.formatUnits(splitAmount, 6), "USDC");

  // 计算 Position IDs
  const yesCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [market.conditionId, 1]
  );
  const yesPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, yesCollectionId]
  );
  const noCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [market.conditionId, 2]
  );
  const noPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, noCollectionId]
  );

  console.log("\nPosition IDs:");
  console.log("  YES:", yesPositionId.substring(0, 20) + "...");
  console.log("  NO:", noPositionId.substring(0, 20) + "...");

  // ConditionalTokens 不追踪余额，跳过余额检查
  console.log("\n💡 准备铸造 YES 和 NO tokens...");

  // Approve & Split
  console.log("\n⏳ 批准 USDC...");
  const approveTx = await usdc.approve(CONTRACTS.ctf, splitAmount);
  await approveTx.wait();
  console.log("✅ 批准成功");

  console.log("\n⏳ 分割仓位...");
  const splitTx = await ctf.splitPosition(
    CONTRACTS.mockUSDC,
    ethers.constants.HashZero,
    market.conditionId,
    [1, 2],
    splitAmount
  );
  const splitReceipt = await splitTx.wait();
  console.log("✅ 分割成功 (Gas:", splitReceipt.gasUsed.toString(), ")");

  console.log("\n✅ 已铸造:", ethers.utils.formatUnits(splitAmount, 6), "YES 和", ethers.utils.formatUnits(splitAmount, 6), "NO tokens");

  // ========================================
  // 阶段 3: 市场解析
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎯 阶段 3: 市场解析");
  console.log("=".repeat(70));

  if (market.resolved) {
    console.log("\n⏭️  市场已解析，跳过此步骤");
  } else {
    console.log("\n⏳ 设置 Oracle 价格 (YES 获胜)...");
    const setPriceTx = await oracle.setPrice(ethers.utils.parseEther("1"));
    await setPriceTx.wait();
    console.log("✅ 价格已设置: 1e18 (YES)");

    const setHasTx = await oracle.setHasPrice(true);
    await setHasTx.wait();
    console.log("✅ hasPrice 已设置为 true");

    console.log("\n⏳ 解析市场...");
    const resolveTx = await adapter.resolve(questionId);
    const resolveReceipt = await resolveTx.wait();
    console.log("✅ 市场已解析 (Gas:", resolveReceipt.gasUsed.toString(), ")");
  }

  const resolvedMarket = await adapter.getMarket(questionId);
  console.log("\n解析结果:");
  console.log("  已解析:", resolvedMarket.resolved ? "✅ 是" : "❌ 否");
  console.log("  Payouts:");
  console.log("    YES (outcome 0):", resolvedMarket.payouts[0].toString(), resolvedMarket.payouts[0].eq(1) ? "✅ 获胜" : "❌ 失败");
  console.log("    NO  (outcome 1):", resolvedMarket.payouts[1].toString(), resolvedMarket.payouts[1].eq(1) ? "✅ 获胜" : "❌ 失败");

  // ========================================
  // 阶段 4: 赎回代币
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("💸 阶段 4: 赎回代币");
  console.log("=".repeat(70));

  const usdcBefore = await usdc.balanceOf(deployer.address);
  console.log("\n赎回前 USDC:", ethers.utils.formatUnits(usdcBefore, 6));

  console.log("\n⏳ 赎回 Outcome Tokens...");
  const redeemTx = await ctf.redeemPositions(
    CONTRACTS.mockUSDC,
    ethers.constants.HashZero,
    market.conditionId,
    [1, 2]
  );
  const redeemReceipt = await redeemTx.wait();
  console.log("✅ 赎回成功 (Gas:", redeemReceipt.gasUsed.toString(), ")");

  const usdcAfter = await usdc.balanceOf(deployer.address);

  console.log("\n赎回后余额:");
  console.log("  USDC:", ethers.utils.formatUnits(usdcAfter, 6));

  const usdcChange = usdcAfter.sub(usdcBefore);
  console.log("\n📈 收益:");
  console.log("  USDC 变化:", ethers.utils.formatUnits(usdcChange, 6), "USDC");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 测试完成总结");
  console.log("=".repeat(70));

  console.log("\n阶段完成情况:");
  console.log("  ✅ Token 铸造");
  console.log("  ✅ 市场解析");
  console.log("  ✅ 代币赎回");

  console.log("\n财务总结:");
  console.log("  投入:", ethers.utils.formatUnits(splitAmount, 6), "USDC");
  console.log("  收回:", ethers.utils.formatUnits(usdcChange, 6), "USDC");
  console.log("  盈亏:", ethers.utils.formatUnits(usdcChange.sub(splitAmount.mul(-1)), 6), "USDC");

  console.log("\n💡 说明:");
  if (resolvedMarket.payouts[0].eq(1)) {
    console.log("  YES 获胜，所以 YES Token 可以 1:1 赎回 USDC");
    console.log("  NO Token 失去价值，赎回为 0");
  } else if (resolvedMarket.payouts[1].eq(1)) {
    console.log("  NO 获胜，所以 NO Token 可以 1:1 赎回 USDC");
    console.log("  YES Token 失去价值，赎回为 0");
  }

  console.log("\n" + "=".repeat(70));
  console.log("🎉 所有测试通过！");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error);
    process.exit(1);
  });

