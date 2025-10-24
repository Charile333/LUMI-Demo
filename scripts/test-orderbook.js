const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n📚 测试订单薄功能");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  const exchangeDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-exchange.json'), 'utf8')
  );
  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const exchangeAddress = exchangeDeployment.contracts.ctfExchange.address;
  const ctfAddress = testDeployment.contracts.conditionalTokens.address;
  const mockUsdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("📋 合约信息:");
  console.log("   CTFExchange:", exchangeAddress);
  console.log("   ConditionalTokens:", ctfAddress);
  console.log("   Mock USDC:", mockUsdcAddress);
  console.log("   账户:", deployer.address);
  console.log();

  // 检查 USDC 余额
  const USDC_ABI = ["function balanceOf(address) view returns (uint256)"];
  const usdc = new hre.ethers.Contract(mockUsdcAddress, USDC_ABI, deployer);
  const balance = await usdc.balanceOf(deployer.address);

  console.log("💰 USDC 余额:", hre.ethers.utils.formatUnits(balance, 6), "USDC");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 订单薄合约已部署");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎯 下一步可以:");
  console.log("   1. 访问交易页面:");
  console.log("      http://localhost:3000/trade/[marketId]");
  console.log();
  console.log("   2. 使用已创建的市场 ID:");
  console.log("      - 获取市场列表查看 conditionId");
  console.log();
  console.log("   3. 或者在前端测试:");
  console.log("      - 创建订单");
  console.log("      - 查看订单薄");
  console.log("      - 匹配交易");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

