const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n📊 检查 MetaMask 余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [signer] = await hre.ethers.getSigners();
  const metamaskAddress = "0x6830271111dc9814b3bEd0E4a8307E75AC571f95";

  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("🎯 MetaMask 地址:", metamaskAddress);
  console.log("💵 Mock USDC 合约:", usdcAddress);
  console.log();

  // 检查 POL 余额
  const polBalance = await hre.ethers.provider.getBalance(metamaskAddress);
  console.log("⛽ POL 余额:", hre.ethers.utils.formatEther(polBalance), "POL");

  // 检查 USDC 余额
  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, signer);
  const usdcBalance = await usdc.balanceOf(metamaskAddress);
  
  console.log("💵 Mock USDC 余额:", hre.ethers.utils.formatUnits(usdcBalance, 6), "USDC");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (usdcBalance.gt(0)) {
    console.log("✅ 成功！MetaMask 有 USDC 了！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("🚀 现在可以在前端创建市场了：");
    console.log("   http://localhost:3000/admin/test-market");
    console.log("\n💡 提示：");
    console.log("   1. 刷新浏览器页面 (Ctrl+Shift+R)");
    console.log("   2. 确认钱包已连接");
    console.log("   3. 尝试创建市场");
  } else {
    console.log("❌ USDC 余额为 0");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

