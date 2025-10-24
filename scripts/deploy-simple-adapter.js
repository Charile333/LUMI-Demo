/**
 * 部署极简版市场适配器到 Polygon Amoy 测试网
 * 
 * 特点：
 * - 不依赖 UMA Oracle
 * - 由管理员手动解析市场
 * - 极简实现，易于理解
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 部署极简版市场适配器到 Polygon Amoy\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  const balanceInPOL = hre.ethers.utils.formatEther(balance);
  console.log("💰 账户余额:", balanceInPOL, "POL\n");
  
  if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.log("⚠️  余额不足！建议至少有 0.5 POL");
    console.log("📝 请访问水龙头获取测试币：");
    console.log("   https://faucet.polygon.technology/\n");
    return;
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 检查是否已有 CTF 部署
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy.json');
  let ctfAddress;
  
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    if (deployment.contracts && deployment.contracts.conditionalTokens) {
      ctfAddress = deployment.contracts.conditionalTokens.address;
      console.log("📝 使用现有的 ConditionalTokens 合约");
      console.log("   地址:", ctfAddress);
      console.log("");
    }
  }
  
  // 如果没有 CTF，则部署新的
  if (!ctfAddress) {
    console.log("📝 步骤 1: 部署 ConditionalTokens 合约...\n");
    const CTF = await hre.ethers.getContractFactory("ConditionalTokens");
    console.log("   正在部署...");
    const ctf = await CTF.deploy();
    await ctf.deployed();
    
    console.log("   ✅ ConditionalTokens 已部署");
    console.log("   📍 地址:", ctf.address);
    console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${ctf.address}\n`);
    
    console.log("   ⏳ 等待区块确认...");
    await ctf.deployTransaction.wait(3);
    console.log("   ✅ 已确认\n");
    
    ctfAddress = ctf.address;
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
  
  // 部署极简版适配器
  console.log("📝 步骤 2: 部署 SimpleMarketAdapter 合约...\n");
  console.log("   使用 CTF:", ctfAddress);
  console.log("");
  
  const SimpleAdapter = await hre.ethers.getContractFactory("SimpleMarketAdapter");
  console.log("   正在部署...");
  const simpleAdapter = await SimpleAdapter.deploy(ctfAddress);
  await simpleAdapter.deployed();
  
  console.log("   ✅ SimpleMarketAdapter 已部署");
  console.log("   📍 地址:", simpleAdapter.address);
  console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${simpleAdapter.address}\n`);
  
  console.log("   ⏳ 等待区块确认...");
  await simpleAdapter.deployTransaction.wait(3);
  console.log("   ✅ 已确认\n");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 保存部署信息
  console.log("📝 步骤 3: 保存部署信息...\n");
  
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "simple",
    contracts: {
      conditionalTokens: {
        address: ctfAddress,
        version: "standard"
      },
      simpleMarketAdapter: {
        address: simpleAdapter.address,
        deployTx: simpleAdapter.deployTransaction.hash,
        blockNumber: simpleAdapter.deployTransaction.blockNumber,
        version: "simple-no-oracle"
      }
    },
    timestamp: new Date().toISOString(),
    balance: balanceInPOL + " POL",
    note: "极简版 - 不依赖 Oracle，由管理员手动解析"
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const simpleDeploymentPath = path.join(deploymentsDir, 'amoy-simple.json');
  fs.writeFileSync(simpleDeploymentPath, JSON.stringify(deployment, null, 2));
  
  console.log("   ✅ 部署信息已保存到:", simpleDeploymentPath);
  console.log("");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 打印摘要
  console.log("🎉 部署完成！\n");
  console.log("📋 部署摘要:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("   ConditionalTokens:");
  console.log("     地址:", ctfAddress);
  console.log("");
  console.log("   SimpleMarketAdapter:");
  console.log("     地址:", simpleAdapter.address);
  console.log("     所有者:", deployer.address);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("💡 特点:");
  console.log("");
  console.log("   ✅ 不依赖 UMA Oracle");
  console.log("   ✅ 代码极简，易于理解");
  console.log("   ✅ 由管理员手动解析市场");
  console.log("   ✅ 适合学习和测试");
  console.log("");
  
  console.log("📖 使用方法:");
  console.log("");
  console.log("   1. 创建市场:");
  console.log("      adapter.createMarket(questionId, title, description, 2)");
  console.log("");
  console.log("   2. 解析市场（仅所有者）:");
  console.log("      adapter.resolveMarket(questionId, [1, 0])  // YES 获胜");
  console.log("      adapter.resolveMarket(questionId, [0, 1])  // NO 获胜");
  console.log("");
  console.log("   3. 查询市场:");
  console.log("      adapter.getMarket(questionId)");
  console.log("      adapter.getMarketCount()");
  console.log("");
  
  console.log("🔧 下一步:");
  console.log("");
  console.log("   1. 更新前端配置使用新地址");
  console.log("   2. 测试创建市场功能");
  console.log("   3. 测试解析市场功能");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  });


