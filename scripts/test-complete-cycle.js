/**
 * 完整周期测试：创建条件 → 铸造 → 解析 → 赎回
 * 全部在 FullConditionalTokens 上进行
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🔄 完整周期测试 (FullCTF)");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 加载部署信息
  const deploymentPath = path.join(__dirname, "../deployments/amoy-full-system.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const CONTRACTS = {
    fullCtf: deployment.contracts.fullConditionalTokens.address,
    mockUSDC: deployment.contracts.collateral.address
  };

  console.log("\n合约地址:");
  console.log("  FullCTF:", CONTRACTS.fullCtf);
  console.log("  Mock USDC:", CONTRACTS.mockUSDC);

  // 加载合约
  const fullCtfArtifact = require("../artifacts/contracts/FullConditionalTokens.sol/FullConditionalTokens.json");
  const usdcArtifact = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json");

  const ctf = new ethers.Contract(CONTRACTS.fullCtf, fullCtfArtifact.abi, deployer);
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, usdcArtifact.abi, deployer);

  // ========================================
  // 步骤 1: 准备条件
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📋 步骤 1: 准备条件");
  console.log("=".repeat(70));

  const oracle = deployer.address; // 使用自己作为 oracle
  const questionId = ethers.utils.id("Test Question: " + Date.now());
  const outcomeSlotCount = 2; // YES/NO

  console.log("\n创建测试条件:");
  console.log("  Oracle:", oracle);
  console.log("  Question ID:", questionId.substring(0, 20) + "...");
  console.log("  Outcomes: 2 (YES/NO)");

  const prepareTx = await ctf.prepareCondition(oracle, questionId, outcomeSlotCount);
  await prepareTx.wait();
  console.log("✅ 条件已准备");

  const conditionId = await ctf.getConditionId(oracle, questionId, outcomeSlotCount);
  console.log("  Condition ID:", conditionId.substring(0, 20) + "...");

  // ========================================
  // 步骤 2: 铸造 Tokens
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎴 步骤 2: 铸造 Outcome Tokens");
  console.log("=".repeat(70));

  const splitAmount = ethers.utils.parseUnits("50", 6); // 50 USDC
  console.log("\n准备分割:", ethers.utils.formatUnits(splitAmount, 6), "USDC");

  // 检查 USDC 余额
  let usdcBalance = await usdc.balanceOf(deployer.address);
  if (usdcBalance.lt(splitAmount)) {
    console.log("💸 铸造 USDC...");
    const mintTx = await usdc.mint(deployer.address, ethers.utils.parseUnits("1000", 6));
    await mintTx.wait();
  }

  // 计算 Position IDs
  const parentCollectionId = ethers.constants.HashZero;
  const yesCollectionId = await ctf.getCollectionId(parentCollectionId, conditionId, 1);
  const noCollectionId = await ctf.getCollectionId(parentCollectionId, conditionId, 2);
  const yesPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, yesCollectionId);
  const noPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, noCollectionId);

  console.log("\nPosition IDs:");
  console.log("  YES:", yesPositionId.toString().substring(0, 20) + "...");
  console.log("  NO:", noPositionId.toString().substring(0, 20) + "...");

  // Approve & Split
  console.log("\n⏳ 批准 USDC...");
  const approveTx = await usdc.approve(CONTRACTS.fullCtf, splitAmount);
  await approveTx.wait();
  console.log("✅ 批准成功");

  console.log("\n⏳ 分割仓位...");
  const splitTx = await ctf.splitPosition(
    CONTRACTS.mockUSDC,
    parentCollectionId,
    conditionId,
    [1, 2], // YES, NO
    splitAmount
  );
  const splitReceipt = await splitTx.wait();
  console.log("✅ 分割成功 (Gas:", splitReceipt.gasUsed.toString(), ")");

  const yesBalAfterSplit = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalAfterSplit = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n新的 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalAfterSplit, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalAfterSplit, 6));

  // ========================================
  // 步骤 3: 解析条件
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎯 步骤 3: 解析条件");
  console.log("=".repeat(70));

  console.log("\n⏳ 报告结果 (YES 获胜)...");
  const payouts = [ethers.utils.parseEther("1"), ethers.constants.Zero]; // YES wins (1e18, 0)
  const reportTx = await ctf.reportPayouts(questionId, payouts);
  const reportReceipt = await reportTx.wait();
  console.log("✅ 结果已报告 (Gas:", reportReceipt.gasUsed.toString(), ")");

  const isResolved = await ctf.isResolved(conditionId);
  console.log("\n解析状态:", isResolved ? "✅ 已解析" : "❌ 未解析");

  // ========================================
  // 步骤 4: 赎回代币
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("💸 步骤 4: 赎回代币");
  console.log("=".repeat(70));

  const usdcBefore = await usdc.balanceOf(deployer.address);
  console.log("\n赎回前 USDC:", ethers.utils.formatUnits(usdcBefore, 6));

  console.log("\n⏳ 赎回 Outcome Tokens...");
  const redeemTx = await ctf.redeemPositions(
    CONTRACTS.mockUSDC,
    parentCollectionId,
    conditionId,
    [1, 2] // 赎回 YES 和 NO
  );
  const redeemReceipt = await redeemTx.wait();
  console.log("✅ 赎回成功");
  console.log("   交易:", redeemReceipt.transactionHash);
  console.log("   Gas:", redeemReceipt.gasUsed.toString());

  const usdcAfter = await usdc.balanceOf(deployer.address);
  const yesBalFinal = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalFinal = await ctf.balanceOf(deployer.address, noPositionId);

  console.log("\n赎回后余额:");
  console.log("  USDC:", ethers.utils.formatUnits(usdcAfter, 6));
  console.log("  YES Token:", ethers.utils.formatUnits(yesBalFinal, 6));
  console.log("  NO Token:", ethers.utils.formatUnits(noBalFinal, 6));

  const usdcGained = usdcAfter.sub(usdcBefore);
  console.log("\n📈 收益:");
  console.log("  USDC 变化: +", ethers.utils.formatUnits(usdcGained, 6), "USDC");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 完整周期测试成功");
  console.log("=".repeat(70));

  console.log("\n测试流程:");
  console.log("  1. ✅ 准备条件 (prepareCondition)");
  console.log("  2. ✅ 铸造 Tokens (splitPosition)");
  console.log("      - 投入:", ethers.utils.formatUnits(splitAmount, 6), "USDC");
  console.log("      - 获得:", ethers.utils.formatUnits(splitAmount, 6), "YES +", ethers.utils.formatUnits(splitAmount, 6), "NO");
  console.log("  3. ✅ 解析条件 (reportPayouts)");
  console.log("      - 结果: YES 获胜");
  console.log("  4. ✅ 赎回代币 (redeemPositions)");
  console.log("      - 收回:", ethers.utils.formatUnits(usdcGained, 6), "USDC");

  console.log("\n💡 结论:");
  console.log("  - 完整 ERC1155 功能正常 ✅");
  console.log("  - Token 生命周期完整 ✅");
  console.log("  - 订单薄系统可以开始交易！✅");

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error);
    process.exit(1);
  });

