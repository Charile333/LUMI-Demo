const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n💰 铸造 Mock USDC 给 MetaMask 地址");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const usdcAddress = mockUsdcDeployment.mockUSDC.address;
  const metamaskAddress = "0x6830271111dc9814b3bEd0E4a8307E75AC571f95";

  console.log("👤 部署者:", deployer.address);
  console.log("💵 Mock USDC:", usdcAddress);
  console.log("🎯 接收地址 (MetaMask):", metamaskAddress);
  console.log();

  const USDC_ABI = [
    "function faucet(uint256 amount) public",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  // 检查当前余额
  const currentBalance = await usdc.balanceOf(metamaskAddress);
  console.log("📊 MetaMask 当前余额:", hre.ethers.utils.formatUnits(currentBalance, 6), "USDC");

  // 铸造并转移 USDC
  const amount = 1000; // 1000 USDC

  console.log(`\n💰 铸造 ${amount} USDC...`);
  const mintTx = await usdc.faucet(amount);
  await mintTx.wait();
  console.log("✅ 铸造成功");

  console.log(`\n📤 转账 ${amount} USDC 到 MetaMask...`);
  const transferAmount = hre.ethers.utils.parseUnits(amount.toString(), 6);
  const transferTx = await usdc.transfer(metamaskAddress, transferAmount);
  await transferTx.wait();
  console.log("✅ 转账成功");

  // 检查新余额
  const newBalance = await usdc.balanceOf(metamaskAddress);
  console.log("\n📊 MetaMask 新余额:", hre.ethers.utils.formatUnits(newBalance, 6), "USDC");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎊 现在 MetaMask 地址有 USDC 了！");
  console.log("   可以在前端重新尝试创建市场");
  console.log("   http://localhost:3000/admin/test-market\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

