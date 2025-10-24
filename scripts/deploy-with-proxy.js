/**
 * 使用代理部署到Mumbai测试网
 */
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 配置代理
const PROXY = process.env.HTTPS_PROXY || "http://127.0.0.1:7890";
const UMA_ORACLE_MUMBAI = "0x263351499f82C107e540B01F0Ca959843e22464a";

// 配置全局代理
if (PROXY) {
  const agent = new HttpsProxyAgent(PROXY);
  global.agent = agent;
  console.log(`🔌 使用代理: ${PROXY}\n`);
}

async function main() {
  console.log("🚀 开始部署到Polygon Mumbai测试网\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  // 检查余额
  try {
    const balance = await deployer.getBalance();
    const balanceInPOL = hre.ethers.utils.formatEther(balance);
    console.log("💰 账户余额:", balanceInPOL, "POL\n");
    
    if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
      console.log("⚠️  余额不足！建议至少有0.5 POL");
      console.log("📝 请访问水龙头获取测试币：https://mumbaifaucet.com/\n");
      return;
    }
  } catch (error) {
    console.log("⚠️  无法获取余额，可能是网络连接问题");
    console.log("错误:", error.message);
    console.log("\n请检查:");
    console.log("1. VPN是否正在运行");
    console.log("2. 代理端口是否正确（7890）");
    console.log("3. Alchemy API密钥是否正确\n");
    return;
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // ========== 1. 部署ConditionalTokens ==========
  console.log("📝 步骤1：部署ConditionalTokens合约...\n");
  
  const CTF = await hre.ethers.getContractFactory("ConditionalTokens");
  console.log("   正在部署...");
  
  try {
    const ctf = await CTF.deploy();
    await ctf.deployed();
    
    console.log("   ✅ ConditionalTokens已部署");
    console.log("   📍 地址:", ctf.address);
    console.log("   🔗 查看:", `https://mumbai.polygonscan.com/address/${ctf.address}\n`);
    
    // 等待几个区块确认
    console.log("   ⏳ 等待区块确认...");
    await ctf.deployTransaction.wait(3);
    console.log("   ✅ 已确认\n");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // ========== 2. 部署UmaCTFAdapter ==========
    console.log("📝 步骤2：部署UmaCTFAdapter合约...\n");
    console.log("   使用UMA Oracle:", UMA_ORACLE_MUMBAI);
    
    const Adapter = await hre.ethers.getContractFactory("UmaCTFAdapter");
    console.log("   正在部署...");
    const adapter = await Adapter.deploy(ctf.address, UMA_ORACLE_MUMBAI);
    await adapter.deployed();
    
    console.log("   ✅ UmaCTFAdapter已部署");
    console.log("   📍 地址:", adapter.address);
    console.log("   🔗 查看:", `https://mumbai.polygonscan.com/address/${adapter.address}\n`);
    
    // 等待几个区块确认
    console.log("   ⏳ 等待区块确认...");
    await adapter.deployTransaction.wait(3);
    console.log("   ✅ 已确认\n");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // ========== 3. 保存部署信息 ==========
    console.log("📝 步骤3：保存部署信息...\n");
    
    const balance = await deployer.getBalance();
    const deployment = {
      network: "mumbai",
      chainId: 80001,
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
        umaOracle: UMA_ORACLE_MUMBAI
      },
      timestamp: new Date().toISOString(),
      balance: hre.ethers.utils.formatEther(balance) + " POL"
    };
    
    // 确保deployments目录存在
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // 保存部署信息
    const deploymentPath = path.join(deploymentsDir, 'mumbai.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    
    console.log("   ✅ 部署信息已保存到:", deploymentPath);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // ========== 4. 显示摘要 ==========
    console.log("🎉 部署完成！\n");
    console.log("📋 部署摘要:\n");
    console.log(JSON.stringify(deployment, null, 2));
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // ========== 5. 下一步提示 ==========
    console.log("🎯 下一步操作:\n");
    console.log("1. 验证合约（可选）:");
    console.log(`   npx hardhat verify --network mumbai ${ctf.address}`);
    console.log(`   npx hardhat verify --network mumbai ${adapter.address} ${ctf.address} ${UMA_ORACLE_MUMBAI}\n`);
    
    console.log("2. 创建测试市场:");
    console.log(`   npx hardhat run scripts/create-test-market.js --network mumbai\n`);
    
    console.log("3. 在浏览器查看:");
    console.log(`   CTF: https://mumbai.polygonscan.com/address/${ctf.address}`);
    console.log(`   Adapter: https://mumbai.polygonscan.com/address/${adapter.address}\n`);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("✅ 部署成功完成！");
    
  } catch (error) {
    console.error("\n❌ 部署失败:", error.message);
    console.error("\n详细错误信息:");
    console.error(error);
    
    console.log("\n💡 可能的解决方案:");
    console.log("1. 检查VPN是否正常运行");
    console.log("2. 确认代理端口是否正确（7890）");
    console.log("3. 验证Alchemy API密钥");
    console.log("4. 检查钱包是否有足够的POL");
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error.message);
    console.error(error);
    process.exit(1);
  });










