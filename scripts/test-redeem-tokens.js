/**
 * 测试代币赎回功能
 * 完整流程：解析市场 → 赎回 Tokens
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("💸 测试代币赎回 (redeemPositions)");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 加载部署信息
  const deploymentPath = path.join(__dirname, "../deployments/amoy-full-system.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const adapterPath = path.join(__dirname, "../deployments/amoy-test-uma.json");
  const adapterDeployment = JSON.parse(fs.readFileSync(adapterPath, "utf8"));

  const CONTRACTS = {
    fullCtf: deployment.contracts.fullConditionalTokens.address,
    mockUSDC: deployment.contracts.collateral.address,
    adapter: adapterDeployment.contracts.testUmaCTFAdapter.address,
    mockOracle: adapterDeployment.contracts.mockOptimisticOracle.address
  };

  console.log("\n合约地址:");
  console.log("  FullCTF:", CONTRACTS.fullCtf);
  console.log("  Mock USDC:", CONTRACTS.mockUSDC);
  console.log("  Adapter:", CONTRACTS.adapter);
  console.log("  Oracle:", CONTRACTS.mockOracle);

  // 加载合约
  const fullCtfArtifact = require("../artifacts/contracts/FullConditionalTokens.sol/FullConditionalTokens.json");
  const usdcArtifact = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json");
  const adapterArtifact = require("../artifacts/contracts/TestUmaCTFAdapter.sol/TestUmaCTFAdapter.json");
  const oracleArtifact = require("../artifacts/contracts/MockOptimisticOracle.sol/MockOptimisticOracle.json");

  const ctf = new ethers.Contract(CONTRACTS.fullCtf, fullCtfArtifact.abi, deployer);
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, usdcArtifact.abi, deployer);
  const adapter = new ethers.Contract(CONTRACTS.adapter, adapterArtifact.abi, deployer);
  const oracle = new ethers.Contract(CONTRACTS.mockOracle, oracleArtifact.abi, deployer);

  // ========================================
  // 步骤 1: 获取市场
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📊 步骤 1: 获取市场");
  console.log("=".repeat(70));

  const marketList = await adapter.getMarketList(0, 1);
  const questionId = marketList[0];
  const market = await adapter.getMarket(questionId);

  console.log("\n使用市场:");
  console.log("  标题:", market.title);
  console.log("  已解析:", market.resolved);
  console.log("  Condition ID:", market.conditionId.substring(0, 20) + "...");

  // 计算 Position IDs
  const parentCollectionId = ethers.constants.HashZero;
  const yesCollectionId = await ctf.getCollectionId(parentCollectionId, market.conditionId, 1);
  const noCollectionId = await ctf.getCollectionId(parentCollectionId, market.conditionId, 2);
  const yesPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, yesCollectionId);
  const noPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, noCollectionId);

  // 检查 Token 余额
  const yesBalance = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalance = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n当前 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalance, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalance, 6));

  if (yesBalance.eq(0) && noBalance.eq(0)) {
    console.log("\n⚠️  没有 Tokens，请先运行:");
    console.log("  npx hardhat run scripts/test-split-position.js --network amoy");
    return;
  }

  // ========================================
  // 步骤 2: 解析市场 (如果尚未解析)
  // ========================================
  if (!market.resolved) {
    console.log("\n" + "=".repeat(70));
    console.log("🎯 步骤 2: 解析市场");
    console.log("=".repeat(70));

    console.log("\n⏳ 设置 Oracle 价格 (YES 获胜)...");
    const setPriceTx = await oracle.setPrice(ethers.utils.parseEther("1"));
    await setPriceTx.wait();
    console.log("✅ 价格已设置: 1e18 (YES)");

    const setHasTx = await oracle.setHasPrice(true);
    await setHasTx.wait();
    console.log("✅ hasPrice 已设置");

    console.log("\n⏳ 解析市场...");
    const resolveTx = await adapter.resolve(questionId);
    const resolveReceipt = await resolveTx.wait();
    console.log("✅ 市场已解析 (Gas:", resolveReceipt.gasUsed.toString(), ")");
  } else {
    console.log("\n✅ 市场已解析，跳过解析步骤");
  }

  // 获取解析后的市场
  const resolvedMarket = await adapter.getMarket(questionId);
  console.log("\n解析结果:");
  console.log("  Payouts:", resolvedMarket.payouts.map(p => p.toString()).join(", "));
  console.log("  YES:", resolvedMarket.payouts[0].toString() === "1" ? "✅ 获胜" : "❌ 失败");
  console.log("  NO:", resolvedMarket.payouts[1].toString() === "1" ? "✅ 获胜" : "❌ 失败");

  // 检查 FullCTF 是否已报告结果
  const isResolved = await ctf.isResolved(market.conditionId);
  console.log("\nFullCTF 解析状态:", isResolved ? "✅ 已解析" : "❌ 未解析");

  if (!isResolved) {
    console.log("\n⚠️  需要在 FullCTF 上报告结果...");
    const reportTx = await ctf.reportPayouts(questionId, resolvedMarket.payouts);
    await reportTx.wait();
    console.log("✅ 结果已报告到 FullCTF");
  }

  // ========================================
  // 步骤 3: 赎回代币
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("💸 步骤 3: 赎回代币");
  console.log("=".repeat(70));

  const usdcBefore = await usdc.balanceOf(deployer.address);
  console.log("\n赎回前 USDC:", ethers.utils.formatUnits(usdcBefore, 6));

  console.log("\n⏳ 赎回 Outcome Tokens...");
  const redeemTx = await ctf.redeemPositions(
    CONTRACTS.mockUSDC,
    parentCollectionId,
    market.conditionId,
    [1, 2] // 赎回 YES 和 NO
  );
  const redeemReceipt = await redeemTx.wait();
  console.log("✅ 赎回成功");
  console.log("   交易:", redeemReceipt.transactionHash);
  console.log("   Gas:", redeemReceipt.gasUsed.toString());

  const usdcAfter = await usdc.balanceOf(deployer.address);
  const yesBalanceAfter = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalanceAfter = await ctf.balanceOf(deployer.address, noPositionId);

  console.log("\n赎回后余额:");
  console.log("  USDC:", ethers.utils.formatUnits(usdcAfter, 6));
  console.log("  YES Token:", ethers.utils.formatUnits(yesBalanceAfter, 6));
  console.log("  NO Token:", ethers.utils.formatUnits(noBalanceAfter, 6));

  const usdcGained = usdcAfter.sub(usdcBefore);
  console.log("\n📈 收益:");
  console.log("  USDC 变化: +", ethers.utils.formatUnits(usdcGained, 6), "USDC");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 测试完成");
  console.log("=".repeat(70));

  console.log("\n测试结果:");
  console.log("  ✅ 市场解析成功");
  console.log("  ✅ 代币赎回成功");
  console.log("  ✅ 收回", ethers.utils.formatUnits(usdcGained, 6), "USDC");

  console.log("\n💡 说明:");
  if (resolvedMarket.payouts[0].toString() === "1") {
    console.log("  - YES 获胜，YES Tokens 赎回为 USDC");
    console.log("  - NO Tokens 失去价值");
  } else {
    console.log("  - NO 获胜，NO Tokens 赎回为 USDC");
    console.log("  - YES Tokens 失去价值");
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error);
    process.exit(1);
  });







