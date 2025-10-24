/**
 * 部署并测试合约
 */

async function main() {
  console.log("\n🚀 开始部署 ConditionalTokens 合约...\n");

  const [deployer] = await ethers.getSigners();

  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // 部署合约
  const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
  const conditionalTokens = await ConditionalTokens.deploy();
  await conditionalTokens.deployed();

  console.log("✅ 部署成功!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 合约地址:", conditionalTokens.address);
  console.log("🌐 网络: localhost");
  console.log("⛓️  Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 保存部署信息
  const fs = require('fs');
  const deploymentInfo = {
    address: conditionalTokens.address,
    deployer: deployer.address,
    network: "localhost",
    chainId: (await ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync('./deployment-local.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 部署信息已保存到 deployment-local.json\n");

  // 测试合约
  console.log("🧪 测试合约功能...");
  try {
    const oracle = deployer;
    const questionId = ethers.utils.formatBytes32String("test-deploy");
    const outcomeSlotCount = 2;

    console.log("  📝 创建测试市场...");
    const tx = await conditionalTokens.connect(oracle).prepareCondition(
      oracle.address,
      questionId,
      outcomeSlotCount
    );
    await tx.wait();
    console.log("  ✅ 测试市场创建成功");

    const conditionId = await conditionalTokens.getConditionId(
      oracle.address,
      questionId,
      outcomeSlotCount
    );
    console.log("  🎯 Condition ID:", conditionId);

    const slots = await conditionalTokens.getOutcomeSlotCount(conditionId);
    console.log("  📊 结果数量:", slots.toNumber());

    console.log("\n✅ 合约测试通过!\n");

  } catch (error) {
    console.error("\n❌ 合约测试失败:", error.message, "\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 合约已就绪，可以开始前端测试！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


















