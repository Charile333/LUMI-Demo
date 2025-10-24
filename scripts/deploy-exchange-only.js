/**
 * 只部署 CTFExchange
 * (FullConditionalTokens 已部署: 0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2)
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 部署 CTFExchange (订单薄)");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "POL");

  // 已部署的 FullConditionalTokens
  const fullCtfAddress = "0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2";
  
  // Mock USDC
  const mockUsdcPath = path.join(__dirname, "../deployments/mock-usdc.json");
  const mockUsdcData = JSON.parse(fs.readFileSync(mockUsdcPath, "utf8"));
  const collateralToken = mockUsdcData.mockUSDC.address;
  
  // 手续费接收地址
  const feeRecipient = deployer.address;

  console.log("\n配置:");
  console.log("  FullCTF:", fullCtfAddress);
  console.log("  抵押品:", collateralToken, "(Mock USDC)");
  console.log("  手续费接收:", feeRecipient);

  // 部署 CTFExchange
  console.log("\n⏳ 正在部署 CTFExchange...");
  
  const CTFExchange = await ethers.getContractFactory("CTFExchange");
  const exchange = await CTFExchange.deploy(fullCtfAddress, collateralToken, feeRecipient);
  await exchange.deployed();

  console.log("\n✅ CTFExchange 已部署");
  console.log("   地址:", exchange.address);
  console.log("   部署交易:", exchange.deployTransaction.hash);

  // 验证
  console.log("\n🔍 验证部署...");
  const ctfAddress = await exchange.ctf();
  const collateral = await exchange.collateral();
  const paused = await exchange.paused();
  const feeRecipientAddr = await exchange.feeRecipient();

  console.log("\n验证结果:");
  console.log("  CTF:", ctfAddress === fullCtfAddress ? "✅" : "❌");
  console.log("  抵押品:", collateral === collateralToken ? "✅" : "❌");
  console.log("  手续费接收:", feeRecipientAddr === feeRecipient ? "✅" : "❌");
  console.log("  暂停状态:", paused ? "⚠️ 是" : "✅ 否");

  // 保存部署信息
  console.log("\n💾 保存部署信息...");

  const deploymentData = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "full-polymarket-v1",
    contracts: {
      fullConditionalTokens: {
        address: fullCtfAddress,
        deployTx: "0x3e6808a965a2b97fccf661c25c33f4052fa8c2c8514221b365b01b6fea5c0a94",
        version: "full-erc1155"
      },
      ctfExchange: {
        address: exchange.address,
        deployTx: exchange.deployTransaction.hash,
        version: "polymarket-orderbook-v2"
      },
      collateral: {
        address: collateralToken,
        symbol: "USDC",
        decimals: 6,
        type: "Mock"
      },
      config: {
        feeRecipient: feeRecipient,
        paused: paused
      }
    },
    timestamp: new Date().toISOString(),
    balance: ethers.utils.formatEther(await deployer.getBalance()) + " POL",
    note: "完整版 Polymarket 系统 - 支持 Token 铸造和订单薄交易"
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  const outputPath = path.join(deploymentsDir, "amoy-full-system.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));

  console.log("✅ 已保存:", outputPath);

  // 总结
  console.log("\n" + "=".repeat(70));
  console.log("🎉 部署完成");
  console.log("=".repeat(70));

  console.log("\n📋 完整系统合约:");
  console.log("  1. FullConditionalTokens:", fullCtfAddress);
  console.log("     ✅ 支持 ERC1155");
  console.log("     ✅ 支持 splitPosition (铸造 Token)");
  console.log("     ✅ 支持 redeemPositions (赎回)");
  console.log();
  console.log("  2. CTFExchange:", exchange.address);
  console.log("     ✅ Polymarket 订单薄");
  console.log("     ✅ EIP-712 签名");
  console.log("     ✅ 手续费:", feeRecipient.substring(0, 10) + "...");
  console.log();
  console.log("  3. Mock USDC:", collateralToken);

  console.log("\n🔧 下一步:");
  console.log("  1. 测试 Token 铸造:");
  console.log("     npx hardhat run scripts/test-split-position.js --network amoy");
  console.log();
  console.log("  2. 测试订单薄交易:");
  console.log("     npx hardhat run scripts/test-orderbook-trade.js --network amoy");

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error.message);
    console.error(error);
    process.exit(1);
  });







