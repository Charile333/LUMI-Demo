const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n💰 铸造 Mock USDC (正确数量)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const usdcAddress = mockUsdcDeployment.mockUSDC.address;
  const metamaskAddress = deployer.address; // 当前签名者就是 MetaMask

  console.log("👤 MetaMask 地址:", metamaskAddress);
  console.log("💵 Mock USDC:", usdcAddress);
  console.log();

  const USDC_ABI = [
    "function faucet(uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  // 检查当前余额
  const currentBalance = await usdc.balanceOf(metamaskAddress);
  console.log("📊 当前余额:", hre.ethers.utils.formatUnits(currentBalance, 6), "USDC");

  // 铸造 1000 USDC (需要考虑 6 位小数)
  const amount = hre.ethers.utils.parseUnits("1000", 6);
  
  console.log("\n💰 铸造 1000 USDC...");
  console.log("   原始数量:", amount.toString());
  
  const tx = await usdc.faucet(amount, {
    gasLimit: 100000
  });
  
  console.log("   ⏳ 交易哈希:", tx.hash);
  await tx.wait();
  console.log("   ✅ 铸造成功");

  // 检查新余额
  const newBalance = await usdc.balanceOf(metamaskAddress);
  console.log("\n📊 新余额:", hre.ethers.utils.formatUnits(newBalance, 6), "USDC");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎊 MetaMask 现在有", hre.ethers.utils.formatUnits(newBalance, 6), "USDC！");
  console.log("\n🚀 下一步:");
  console.log("   1. 刷新浏览器 (Ctrl+Shift+R)");
  console.log("   2. 访问: http://localhost:3000/admin/test-market");
  console.log("   3. 创建市场\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

