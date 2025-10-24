/**
 * 部署完整版 ConditionalTokens + CTFExchange
 * 基于 Polymarket 官方架构
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 部署完整版 Polymarket 订单薄系统");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("\n📍 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(balance), "POL");

  // ========================================
  // 1. 部署完整版 ConditionalTokens
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📦 步骤 1: 部署 FullConditionalTokens");
  console.log("=".repeat(70));

  const FullCTF = await ethers.getContractFactory("FullConditionalTokens");
  console.log("\n⏳ 正在部署...");
  
  const fullCtf = await FullCTF.deploy();
  await fullCtf.deployed();

  console.log("✅ FullConditionalTokens 已部署");
  console.log("   地址:", fullCtf.address);
  console.log("   部署交易:", fullCtf.deployTransaction.hash);

  // ========================================
  // 2. 部署 CTFExchange (使用新的 CTF)
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("📦 步骤 2: 部署 CTFExchange");
  console.log("=".repeat(70));

  // 使用 Mock USDC 作为抵押品
  const mockUsdcPath = path.join(__dirname, "../deployments/mock-usdc.json");
  const mockUsdcData = JSON.parse(fs.readFileSync(mockUsdcPath, "utf8"));
  const collateralToken = mockUsdcData.mockUSDC.address;

  const feeRecipient = deployer.address; // 手续费接收地址

  console.log("\n配置:");
  console.log("  CTF 地址:", fullCtf.address);
  console.log("  抵押品:", collateralToken, "(Mock USDC)");
  console.log("  手续费接收:", feeRecipient);

  const CTFExchange = await ethers.getContractFactory("CTFExchange");
  console.log("\n⏳ 正在部署...");
  
  const exchange = await CTFExchange.deploy(fullCtf.address, collateralToken, feeRecipient);
  await exchange.deployed();

  console.log("✅ CTFExchange 已部署");
  console.log("   地址:", exchange.address);
  console.log("   部署交易:", exchange.deployTransaction.hash);

  // ========================================
  // 3. 验证部署
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("✅ 步骤 3: 验证部署");
  console.log("=".repeat(70));

  const ctfAddress = await exchange.ctf();
  const collateral = await exchange.collateral();
  const paused = await exchange.paused();

  console.log("\n验证结果:");
  console.log("  CTF 地址:", ctfAddress, ctfAddress === fullCtf.address ? "✅" : "❌");
  console.log("  抵押品:", collateral, collateral === collateralToken ? "✅" : "❌");
  console.log("  暂停状态:", paused ? "⚠️ 是" : "✅ 否");

  // ========================================
  // 4. 保存部署信息
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("💾 步骤 4: 保存部署信息");
  console.log("=".repeat(70));

  const deploymentData = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "full-polymarket-v1",
    contracts: {
      fullConditionalTokens: {
        address: fullCtf.address,
        deployTx: fullCtf.deployTransaction.hash,
        version: "full-erc1155"
      },
      ctfExchange: {
        address: exchange.address,
        deployTx: exchange.deployTransaction.hash,
        version: "polymarket-orderbook"
      },
      collateral: {
        address: collateralToken,
        symbol: "USDC",
        decimals: 6,
        type: "Mock"
      }
    },
    timestamp: new Date().toISOString(),
    balance: ethers.utils.formatEther(await deployer.getBalance()) + " POL",
    note: "完整版 Polymarket 系统 - 支持 Token 铸造和订单薄交易"
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const outputPath = path.join(deploymentsDir, "amoy-full-system.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));

  console.log("\n✅ 部署信息已保存:", outputPath);

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(70));
  console.log("🎉 部署完成总结");
  console.log("=".repeat(70));

  console.log("\n📋 部署的合约:");
  console.log("  1. FullConditionalTokens:", fullCtf.address);
  console.log("     - 支持 ERC1155 ✅");
  console.log("     - 支持 splitPosition ✅");
  console.log("     - 支持 redeemPositions ✅");
  console.log();
  console.log("  2. CTFExchange:", exchange.address);
  console.log("     - 基于 Polymarket 架构 ✅");
  console.log("     - EIP-712 订单签名 ✅");
  console.log("     - Off-chain 撮合 ✅");
  console.log();
  console.log("  3. 抵押品: Mock USDC");
  console.log("     - 地址:", collateralToken);

  console.log("\n🔧 下一步:");
  console.log("  1. 更新 TestUmaCTFAdapter 使用新的 CTF 地址");
  console.log("  2. 测试完整流程 (Token 铸造 + 订单交易 + 赎回)");
  console.log("  3. 更新前端配置");

  console.log("\n💰 Gas 费用:");
  const finalBalance = await deployer.getBalance();
  const spent = balance.sub(finalBalance);
  console.log("  消耗:", ethers.utils.formatEther(spent), "POL");
  console.log("  剩余:", ethers.utils.formatEther(finalBalance), "POL");

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error.message);
    console.error(error);
    process.exit(1);
  });

