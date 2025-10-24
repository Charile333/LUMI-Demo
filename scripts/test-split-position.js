/**
 * 测试 Token 铸造功能 (splitPosition)
 * 完整版 ConditionalTokens 支持
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🎴 测试 Token 铸造 (splitPosition)");
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
    adapter: adapterDeployment.contracts.testUmaCTFAdapter.address
  };

  console.log("\n合约地址:");
  console.log("  FullCTF:", CONTRACTS.fullCtf);
  console.log("  Mock USDC:", CONTRACTS.mockUSDC);
  console.log("  Adapter:", CONTRACTS.adapter);

  // 加载合约
  const fullCtfArtifact = require("../artifacts/contracts/FullConditionalTokens.sol/FullConditionalTokens.json");
  const usdcArtifact = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json");
  const adapterArtifact = require("../artifacts/contracts/TestUmaCTFAdapter.sol/TestUmaCTFAdapter.json");

  const ctf = new ethers.Contract(CONTRACTS.fullCtf, fullCtfArtifact.abi, deployer);
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, usdcArtifact.abi, deployer);
  const adapter = new ethers.Contract(CONTRACTS.adapter, adapterArtifact.abi, deployer);

  // ========================================
  // 步骤 1: 获取市场
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📊 步骤 1: 获取市场");
  console.log("=".repeat(70));

  const marketCount = await adapter.getMarketCount();
  console.log("\n市场数量:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场，请先创建市场");
    return;
  }

  const marketList = await adapter.getMarketList(0, 1);
  const questionId = marketList[0];
  const market = await adapter.getMarket(questionId);

  console.log("\n使用市场:");
  console.log("  标题:", market.title);
  console.log("  Condition ID:", market.conditionId.substring(0, 20) + "...");

  // ========================================
  // 步骤 2: 检查 USDC 余额
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("💰 步骤 2: 检查 USDC 余额");
  console.log("=".repeat(70));

  let usdcBalance = await usdc.balanceOf(deployer.address);
  console.log("\nUSDC 余额:", ethers.utils.formatUnits(usdcBalance, 6));

  if (usdcBalance.lt(ethers.utils.parseUnits("100", 6))) {
    console.log("\n💸 余额不足，铸造 1000 USDC...");
    const mintTx = await usdc.mint(deployer.address, ethers.utils.parseUnits("1000", 6));
    await mintTx.wait();
    usdcBalance = await usdc.balanceOf(deployer.address);
    console.log("✅ 新余额:", ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  }

  // ========================================
  // 步骤 3: 铸造 Outcome Tokens
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎴 步骤 3: 铸造 Outcome Tokens");
  console.log("=".repeat(70));

  const splitAmount = ethers.utils.parseUnits("100", 6); // 100 USDC
  console.log("\n准备分割:", ethers.utils.formatUnits(splitAmount, 6), "USDC");

  // 计算 Position IDs
  const parentCollectionId = ethers.constants.HashZero;
  const partition = [1, 2]; // YES, NO

  const yesCollectionId = ctf.getCollectionId(parentCollectionId, market.conditionId, 1);
  const noCollectionId = ctf.getCollectionId(parentCollectionId, market.conditionId, 2);
  const yesPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, yesCollectionId);
  const noPositionId = await ctf.getPositionId(CONTRACTS.mockUSDC, noCollectionId);

  console.log("\nPosition IDs:");
  console.log("  YES:", yesPositionId.toString().substring(0, 20) + "...");
  console.log("  NO:", noPositionId.toString().substring(0, 20) + "...");

  // 检查当前 Token 余额
  const yesBalBefore = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalBefore = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n当前 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalBefore, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalBefore, 6));

  // Approve USDC
  console.log("\n⏳ 批准 USDC...");
  const approveTx = await usdc.approve(CONTRACTS.fullCtf, splitAmount);
  await approveTx.wait();
  console.log("✅ 批准成功");

  // Split Position
  console.log("\n⏳ 分割仓位...");
  const splitTx = await ctf.splitPosition(
    CONTRACTS.mockUSDC,
    parentCollectionId,
    market.conditionId,
    partition,
    splitAmount
  );
  const receipt = await splitTx.wait();
  console.log("✅ 分割成功");
  console.log("   交易:", receipt.transactionHash);
  console.log("   Gas:", receipt.gasUsed.toString());

  // 检查新余额
  const yesBalAfter = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalAfter = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n新的 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalAfter, 6), "(+", ethers.utils.formatUnits(yesBalAfter.sub(yesBalBefore), 6), ")");
  console.log("  NO:", ethers.utils.formatUnits(noBalAfter, 6), "(+", ethers.utils.formatUnits(noBalAfter.sub(noBalBefore), 6), ")");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 测试完成");
  console.log("=".repeat(70));

  console.log("\n测试结果:");
  console.log("  ✅ Token 铸造成功");
  console.log("  ✅ 获得", ethers.utils.formatUnits(splitAmount, 6), "YES Tokens");
  console.log("  ✅ 获得", ethers.utils.formatUnits(splitAmount, 6), "NO Tokens");

  console.log("\n💡 说明:");
  console.log("  - 投入 100 USDC");
  console.log("  - 获得 100 YES + 100 NO Tokens");
  console.log("  - 现在可以在订单薄交易这些 Tokens！");

  console.log("\n🔧 下一步:");
  console.log("  测试订单薄交易:");
  console.log("  npx hardhat run scripts/test-orderbook-trade.js --network amoy");

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error);
    process.exit(1);
  });







