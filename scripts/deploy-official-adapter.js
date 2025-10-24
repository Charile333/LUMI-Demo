/**
 * 部署官方 UMA-CTF-Adapter 到测试网
 * 
 * 注意：此脚本用于部署官方版本的 Adapter
 * 当前的简化版本仍然保留，两个版本可以并存
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Amoy 测试网上的 UMA Optimistic Oracle V3 地址
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a";

async function main() {
  console.log("🚀 部署官方 UMA-CTF-Adapter 到 Polygon Amoy\n");
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
  
  // 检查官方合约是否存在
  const officialAdapterPath = path.join(__dirname, '..', 'contracts', 'official', 'UmaCTFAdapter.sol');
  
  if (!fs.existsSync(officialAdapterPath)) {
    console.log("❌ 官方合约未找到！");
    console.log("");
    console.log("请先运行集成脚本：");
    console.log("  node scripts/integrate-official-adapter.js");
    console.log("");
    return;
  }
  
  console.log("✅ 找到官方合约文件\n");
  
  // 读取当前部署信息
  const currentDeploymentPath = path.join(__dirname, '..', 'deployments', 'amoy.json');
  let currentDeployment = null;
  
  if (fs.existsSync(currentDeploymentPath)) {
    currentDeployment = JSON.parse(fs.readFileSync(currentDeploymentPath, 'utf8'));
    console.log("📋 当前部署信息:");
    console.log("   简化版 Adapter:", currentDeployment.contracts.umaCTFAdapter.address);
    console.log("   CTF:", currentDeployment.contracts.conditionalTokens.address);
    console.log("");
  }
  
  // 使用现有的 CTF 合约（如果存在）
  let ctfAddress;
  
  if (currentDeployment && currentDeployment.contracts.conditionalTokens.address) {
    ctfAddress = currentDeployment.contracts.conditionalTokens.address;
    console.log("📝 使用现有的 ConditionalTokens 合约");
    console.log("   地址:", ctfAddress);
    console.log("");
  } else {
    // 部署新的 CTF
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
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 部署官方版本的 UmaCTFAdapter
  console.log("📝 步骤 2: 部署官方版 UmaCTFAdapter 合约...\n");
  console.log("   使用 CTF:", ctfAddress);
  console.log("   使用 UMA Oracle:", UMA_ORACLE_AMOY);
  console.log("");
  
  // 注意：这里需要根据官方合约的实际构造函数参数进行调整
  // 官方版本可能有不同的构造函数签名
  
  try {
    const OfficialAdapter = await hre.ethers.getContractFactory("UmaCTFAdapter", {
      // 可能需要链接库
      // libraries: {
      //   LibraryName: libraryAddress
      // }
    });
    
    console.log("   正在部署...");
    
    // 根据官方合约调整构造函数参数
    // 这里使用与简化版相同的参数，实际使用时可能需要调整
    const officialAdapter = await OfficialAdapter.deploy(
      ctfAddress,
      UMA_ORACLE_AMOY
      // 可能需要更多参数，如：
      // factoryAddress,
      // rewardTokenAddress,
      // 等等
    );
    
    await officialAdapter.deployed();
    
    console.log("   ✅ 官方版 UmaCTFAdapter 已部署");
    console.log("   📍 地址:", officialAdapter.address);
    console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${officialAdapter.address}\n`);
    
    console.log("   ⏳ 等待区块确认...");
    await officialAdapter.deployTransaction.wait(3);
    console.log("   ✅ 已确认\n");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // 保存部署信息
    console.log("📝 步骤 3: 保存部署信息...\n");
    
    const deployment = {
      network: "amoy",
      chainId: 80002,
      deployer: deployer.address,
      version: "official",
      contracts: {
        conditionalTokens: {
          address: ctfAddress,
          version: currentDeployment ? "reused" : "new"
        },
        umaCTFAdapterOfficial: {
          address: officialAdapter.address,
          deployTx: officialAdapter.deployTransaction.hash,
          blockNumber: officialAdapter.deployTransaction.blockNumber,
          version: "official"
        },
        umaCTFAdapterSimple: currentDeployment ? {
          address: currentDeployment.contracts.umaCTFAdapter.address,
          version: "simple"
        } : null,
        umaOracle: UMA_ORACLE_AMOY
      },
      timestamp: new Date().toISOString(),
      balance: balanceInPOL + " POL",
      note: "官方版本部署，简化版本仍然保留"
    };
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // 保存官方版本的部署信息
    const officialDeploymentPath = path.join(deploymentsDir, 'amoy-official.json');
    fs.writeFileSync(officialDeploymentPath, JSON.stringify(deployment, null, 2));
    
    console.log("   ✅ 官方版本部署信息已保存到:", officialDeploymentPath);
    console.log("");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // 打印摘要
    console.log("🎉 部署完成！\n");
    console.log("📋 部署摘要:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("   ConditionalTokens:");
    console.log("     地址:", ctfAddress);
    console.log("     状态:", currentDeployment ? "复用现有" : "新部署");
    console.log("");
    console.log("   UmaCTFAdapter (简化版):");
    if (currentDeployment) {
      console.log("     地址:", currentDeployment.contracts.umaCTFAdapter.address);
      console.log("     状态: 保留，继续可用");
    } else {
      console.log("     状态: 未部署");
    }
    console.log("");
    console.log("   UmaCTFAdapter (官方版):");
    console.log("     地址:", officialAdapter.address);
    console.log("     状态: 新部署");
    console.log("");
    console.log("   UMA Oracle:");
    console.log("     地址:", UMA_ORACLE_AMOY);
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("💡 下一步:");
    console.log("");
    console.log("   1. 更新前端配置，添加官方版本的合约地址");
    console.log("   2. 创建版本切换开关，让用户选择使用哪个版本");
    console.log("   3. 测试官方版本的所有功能");
    console.log("   4. 对比两个版本的性能和 Gas 消耗");
    console.log("   5. 确认无误后，考虑迁移");
    console.log("");
    console.log("📖 查看详细的集成指南:");
    console.log("   code INTEGRATE_OFFICIAL_UMA_ADAPTER.md");
    console.log("");
    
  } catch (error) {
    console.error("❌ 部署失败:", error.message);
    console.error("");
    console.error("可能的原因:");
    console.error("  1. 官方合约的构造函数参数与简化版不同");
    console.error("  2. 需要先部署其他依赖合约（如 Factory）");
    console.error("  3. 需要链接库文件");
    console.error("");
    console.error("请查看官方仓库的部署脚本获取正确的部署方法:");
    console.error("  E:\\uma-ctf-adapter\\scripts\\");
    console.error("");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  });

