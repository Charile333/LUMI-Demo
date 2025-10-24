/**
 * 部署真实 UMA Oracle 集成的适配器
 * 
 * 特点：
 * - 使用真实的 UMA Optimistic Oracle V2
 * - 支持完整的提案/争议机制
 * - 可配置的挑战期
 * - 真实的代币奖励
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Polygon Amoy 测试网的 UMA Oracle 地址
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a";

async function main() {
  console.log("🚀 部署真实 UMA Oracle 集成的适配器\n");
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
  
  // 部署真实 UMA 适配器
  console.log("📝 步骤 2: 部署 RealUmaCTFAdapter 合约...\n");
  console.log("   使用 CTF:", ctfAddress);
  console.log("   使用 UMA Oracle:", UMA_ORACLE_AMOY);
  console.log("");
  
  const RealAdapter = await hre.ethers.getContractFactory("RealUmaCTFAdapter");
  console.log("   正在部署...");
  const realAdapter = await RealAdapter.deploy(ctfAddress, UMA_ORACLE_AMOY);
  await realAdapter.deployed();
  
  console.log("   ✅ RealUmaCTFAdapter 已部署");
  console.log("   📍 地址:", realAdapter.address);
  console.log("   🔗 查看:", `https://amoy.polygonscan.com/address/${realAdapter.address}\n`);
  
  console.log("   ⏳ 等待区块确认...");
  await realAdapter.deployTransaction.wait(3);
  console.log("   ✅ 已确认\n");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 保存部署信息
  console.log("📝 步骤 3: 保存部署信息...\n");
  
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "real-uma",
    contracts: {
      conditionalTokens: {
        address: ctfAddress,
        version: "standard"
      },
      realUmaCTFAdapter: {
        address: realAdapter.address,
        deployTx: realAdapter.deployTransaction.hash,
        blockNumber: realAdapter.deployTransaction.blockNumber,
        version: "real-uma-oracle"
      },
      umaOptimisticOracle: {
        address: UMA_ORACLE_AMOY,
        version: "v2"
      }
    },
    timestamp: new Date().toISOString(),
    balance: balanceInPOL + " POL",
    note: "真实 UMA Oracle 集成 - 替换了 Mock Oracle"
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const realDeploymentPath = path.join(deploymentsDir, 'amoy-real-uma.json');
  fs.writeFileSync(realDeploymentPath, JSON.stringify(deployment, null, 2));
  
  console.log("   ✅ 部署信息已保存到:", realDeploymentPath);
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
  console.log("   RealUmaCTFAdapter:");
  console.log("     地址:", realAdapter.address);
  console.log("     所有者:", deployer.address);
  console.log("");
  console.log("   UMA Optimistic Oracle V2:");
  console.log("     地址:", UMA_ORACLE_AMOY);
  console.log("     类型: 真实的 UMA Oracle");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("✨ 主要改进:");
  console.log("");
  console.log("   ✅ 使用真实的 UMA Optimistic Oracle V2");
  console.log("   ✅ 支持完整的提案/争议机制");
  console.log("   ✅ 可配置的挑战期（默认2小时）");
  console.log("   ✅ 真实的代币奖励系统");
  console.log("   ✅ 去中心化的价格解析");
  console.log("");
  
  console.log("📖 使用方法:");
  console.log("");
  console.log("   1. 准备白名单代币（如 USDC）:");
  console.log("      Amoy USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582");
  console.log("");
  console.log("   2. 创建市场:");
  console.log("      adapter.initialize(");
  console.log("        questionId,");
  console.log("        \"市场标题\",");
  console.log("        \"市场描述\",");
  console.log("        2,                    // YES/NO");
  console.log("        usdcAddress,          // 奖励代币");
  console.log("        ethers.utils.parseUnits(\"100\", 6),  // 100 USDC 奖励");
  console.log("        0                     // 使用默认挑战期");
  console.log("      )");
  console.log("");
  console.log("   3. 等待提案和挑战期（约2小时）");
  console.log("");
  console.log("   4. 解析市场:");
  console.log("      adapter.resolve(questionId)");
  console.log("");
  
  console.log("⚠️  重要提示:");
  console.log("");
  console.log("   • 奖励代币必须在 UMA 白名单中");
  console.log("   • 创建市场前需要 approve 奖励代币");
  console.log("   • 挑战期结束前无法解析市场");
  console.log("   • 这是真实的 Oracle，会有实际的挑战期");
  console.log("");
  
  console.log("🔧 下一步:");
  console.log("");
  console.log("   1. 获取测试 USDC:");
  console.log("      https://faucet.polygon.technology/");
  console.log("");
  console.log("   2. 更新前端配置:");
  console.log("      使用 deployments/amoy-real-uma.json 中的地址");
  console.log("");
  console.log("   3. 测试完整的 Oracle 流程:");
  console.log("      创建市场 → 等待提案 → 挑战期 → 解析");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  });


