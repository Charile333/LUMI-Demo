/**
 * 在 FullConditionalTokens 上准备条件
 * 让已创建的市场可以在新的 CTF 上铸造 Token
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🔧 在 FullConditionalTokens 上准备条件");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 账户:", deployer.address);

  // 加载部署信息
  const deploymentPath = path.join(__dirname, "../deployments/amoy-full-system.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const adapterPath = path.join(__dirname, "../deployments/amoy-test-uma.json");
  const adapterDeployment = JSON.parse(fs.readFileSync(adapterPath, "utf8"));

  const CONTRACTS = {
    fullCtf: deployment.contracts.fullConditionalTokens.address,
    adapter: adapterDeployment.contracts.testUmaCTFAdapter.address
  };

  console.log("\n合约地址:");
  console.log("  FullCTF:", CONTRACTS.fullCtf);
  console.log("  Adapter:", CONTRACTS.adapter);

  // 加载合约
  const fullCtfArtifact = require("../artifacts/contracts/FullConditionalTokens.sol/FullConditionalTokens.json");
  const adapterArtifact = require("../artifacts/contracts/TestUmaCTFAdapter.sol/TestUmaCTFAdapter.json");

  const ctf = new ethers.Contract(CONTRACTS.fullCtf, fullCtfArtifact.abi, deployer);
  const adapter = new ethers.Contract(CONTRACTS.adapter, adapterArtifact.abi, deployer);

  // 获取所有市场
  const marketCount = await adapter.getMarketCount();
  console.log("\n市场数量:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场");
    return;
  }

  const marketList = await adapter.getMarketList(0, marketCount);
  console.log("\n准备在 FullCTF 上创建条件...\n");

  for (let i = 0; i < marketList.length; i++) {
    const questionId = marketList[i];
    const market = await adapter.getMarket(questionId);

    console.log(`市场 #${i + 1}:`, market.title);
    console.log("  Question ID:", questionId.substring(0, 20) + "...");
    console.log("  Condition ID:", market.conditionId.substring(0, 20) + "...");

    // 检查条件是否已准备
    const outcomeSlotCount = await ctf.conditionOutcomeSlotCounts(market.conditionId);
    
    if (outcomeSlotCount.gt(0)) {
      console.log("  ✅ 条件已准备 (Outcome Count:", outcomeSlotCount.toString(), ")");
      continue;
    }

    // 准备条件
    console.log("  ⏳ 准备条件...");
    try {
      const tx = await ctf.prepareCondition(
        CONTRACTS.adapter, // oracle = adapter 地址
        questionId,
        market.outcomeSlotCount
      );
      const receipt = await tx.wait();
      console.log("  ✅ 条件已准备 (Gas:", receipt.gasUsed.toString(), ")");
    } catch (error) {
      console.log("  ❌ 失败:", error.message);
    }

    console.log();
  }

  console.log("=".repeat(70));
  console.log("✅ 完成");
  console.log("=".repeat(70));

  console.log("\n现在可以测试 Token 铸造:");
  console.log("npx hardhat run scripts/test-split-position.js --network amoy\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 失败:", error.message);
    console.error(error);
    process.exit(1);
  });







