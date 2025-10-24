/**
 * 部署到Polygon Amoy测试网（新测试网，替代Mumbai）
 */
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Amoy测试网上的UMA Optimistic Oracle V3地址
// 注意：如果UMA还未部署到Amoy，可能需要使用Mock Oracle
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a"; // 待确认

async function main() {
  console.log("🚀 开始部署到Polygon Amoy测试网\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  const balanceInPOL = hre.ethers.utils.formatEther(balance);
  console.log("💰 账户余额:", balanceInPOL, "POL\n");
  
  if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.log("⚠️  余额不足！建议至少有0.5 POL");
    console.log("📝 请访问水龙头获取测试币：");
    console.log("   https://faucet.polygon.technology/\n");
    return;
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 部署ConditionalTokens
  console.log("📝 步骤1：部署ConditionalTokens合约...\n");
  const CTF = await hre.ethers.getContractFactory("ConditionalTokens");
  console.log("   正在部署...");
  const ctf = await CTF.deploy();
  await ctf.deployed();
  
  console.log("   ✅ ConditionalTokens已部署");
  console.log("   📍 地址:", ctf.address);
  console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${ctf.address}\n`);
  
  console.log("   ⏳ 等待区块确认...");
  await ctf.deployTransaction.wait(3);
  console.log("   ✅ 已确认\n");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 部署UmaCTFAdapter
  console.log("📝 步骤2：部署UmaCTFAdapter合约...\n");
  console.log("   使用UMA Oracle:", UMA_ORACLE_AMOY);
  
  const Adapter = await hre.ethers.getContractFactory("UmaCTFAdapter");
  console.log("   正在部署...");
  const adapter = await Adapter.deploy(ctf.address, UMA_ORACLE_AMOY);
  await adapter.deployed();
  
  console.log("   ✅ UmaCTFAdapter已部署");
  console.log("   📍 地址:", adapter.address);
  console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${adapter.address}\n`);
  
  console.log("   ⏳ 等待区块确认...");
  await adapter.deployTransaction.wait(3);
  console.log("   ✅ 已确认\n");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 保存部署信息
  console.log("📝 步骤3：保存部署信息...\n");
  
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    contracts: {
      conditionalTokens: {
        address: ctf.address,
        deployTx: ctf.deployTransaction.hash,
        blockNumber: ctf.deployTransaction.blockNumber
      },
      umaCTFAdapter: {
        address: adapter.address,
        deployTx: adapter.deployTransaction.hash,
        blockNumber: adapter.deployTransaction.blockNumber
      },
      umaOracle: UMA_ORACLE_AMOY
    },
    timestamp: new Date().toISOString(),
    balance: balanceInPOL + " POL"
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, 'amoy.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  
  console.log("   ✅ 部署信息已保存到:", deploymentPath);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("🎉 部署完成！\n");
  console.log("📋 部署摘要:\n");
  console.log(JSON.stringify(deployment, null, 2));
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🎯 下一步操作:\n");
  console.log("1. 在浏览器查看:");
  console.log(`   CTF: https://amoy.polygonscan.com/address/${ctf.address}`);
  console.log(`   Adapter: https://amoy.polygonscan.com/address/${adapter.address}\n`);
  
  console.log("2. 创建测试市场:");
  console.log(`   npx hardhat run scripts/create-test-market.js --network amoy\n`);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ 部署成功完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error.message);
    console.error(error);
    process.exit(1);
  });










