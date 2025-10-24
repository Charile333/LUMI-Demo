const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🚀 部署 CTF Exchange (使用 Mock USDC)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 账户余额:", hre.ethers.utils.formatEther(balance), "POL\n");

  // 读取部署信息
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const ctfAddress = umaDeployment.contracts.conditionalTokens.address;
  const mockUsdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("📝 使用现有合约:");
  console.log("   CTF:", ctfAddress);
  console.log("   Mock USDC:", mockUsdcAddress, "⭐ NEW\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 部署 CTFExchange
  console.log("📝 部署 CTFExchange...\n");
  const CTFExchange = await hre.ethers.getContractFactory("CTFExchange");
  const exchange = await CTFExchange.deploy(
    ctfAddress,
    mockUsdcAddress,  // 使用 Mock USDC
    deployer.address  // fee recipient
  );

  await exchange.deployed();
  console.log("✅ CTFExchange 已部署");
  console.log("📍 地址:", exchange.address);
  console.log("🔗 查看:", `https://amoy.polygonscan.com/address/${exchange.address}\n`);

  // 等待确认
  console.log("⏳ 等待区块确认...");
  await exchange.deployTransaction.wait(2);
  console.log("✅ 已确认\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 保存部署信息
  const deploymentData = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "ctf-exchange-mock-usdc",
    contracts: {
      conditionalTokens: {
        address: ctfAddress
      },
      ctfExchange: {
        address: exchange.address,
        deployTx: exchange.deployTransaction.hash
      },
      mockUSDC: {
        address: mockUsdcAddress,
        symbol: "USDC",
        decimals: 6
      }
    },
    timestamp: new Date().toISOString(),
    note: "使用 Mock USDC 的 CTF Exchange"
  };

  fs.writeFileSync(
    path.join(__dirname, '../deployments/amoy-exchange-mock.json'),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("🎉 部署完成！\n");
  console.log("📋 完整系统:");
  console.log("   ConditionalTokens:", ctfAddress);
  console.log("   RealUmaCTFAdapter:", umaDeployment.contracts.realUmaCTFAdapter.address);
  console.log("   CTFExchange:", exchange.address);
  console.log("   Mock USDC:", mockUsdcAddress, "⭐");

  console.log("\n💰 您的 Mock USDC 余额: 1000 USDC");

  console.log("\n✨ 现在您可以:");
  console.log("   1. 创建测试市场");
  console.log("   2. 进行订单簿交易");
  console.log("   3. 随时铸造更多 USDC (免费!)");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

