/**
 * 部署 ConditionalTokens 合约到本地 Hardhat 网络
 */

const hre = require("hardhat");

async function main() {
  console.log("\n🚀 开始部署 ConditionalTokens 合约到本地网络...\n");

  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 账户余额:", hre.ethers.utils.formatEther(balance), "ETH\n");

  // 部署合约
  console.log("📦 部署合约中...");
  const ConditionalTokens = await hre.ethers.getContractFactory("ConditionalTokens");
  const conditionalTokens = await ConditionalTokens.deploy();
  await conditionalTokens.deployed();

  console.log("\n✅ 部署成功!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 合约地址:", conditionalTokens.address);
  console.log("🌐 网络:", hre.network.name);
  console.log("⛓️  Chain ID:", hre.network.config.chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 测试合约
  console.log("🧪 测试合约功能...\n");
  
  const questionId = hre.ethers.utils.formatBytes32String("test-market");
  const outcomeSlotCount = 2;
  
  console.log("1️⃣ 创建测试市场...");
  const tx = await conditionalTokens.prepareCondition(
    deployer.address,
    questionId,
    outcomeSlotCount
  );
  
  await tx.wait();
  console.log("   ✅ 市场创建成功");
  
  const conditionId = await conditionalTokens.getConditionId(
    deployer.address,
    questionId,
    outcomeSlotCount
  );
  
  console.log("   🎯 Condition ID:", conditionId);
  
  const slotCount = await conditionalTokens.getOutcomeSlotCount(conditionId);
  console.log("   📊 结果数量:", slotCount.toString());
  
  console.log("\n✅ 合约测试通过!\n");
  
  // 保存部署信息
  const fs = require('fs');
  const deployInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: conditionalTokens.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment-local.json',
    JSON.stringify(deployInfo, null, 2)
  );
  
  console.log("💾 部署信息已保存到 deployment-local.json\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 下一步:");
  console.log("1. 在 MetaMask 中添加 Hardhat 本地网络");
  console.log("2. 导入测试账户私钥");
  console.log("3. 更新前端配置使用此合约地址");
  console.log("4. 访问 http://localhost:3004/test-contract");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });


















