const hre = require("hardhat");

/**
 * 检查账户余额
 */
async function main() {
  console.log("\n💰 检查账户余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 账户地址:", deployer.address);

  // 检查 POL 余额
  const polBalance = await deployer.getBalance();
  console.log("\n⛽ POL 余额:");
  console.log("   ", hre.ethers.utils.formatEther(polBalance), "POL");

  // USDC 合约
  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  const usdc = new hre.ethers.Contract(USDC_ADDRESS, USDC_ABI, deployer);

  try {
    const usdcBalance = await usdc.balanceOf(deployer.address);
    const decimals = await usdc.decimals();
    const symbol = await usdc.symbol();

    console.log("\n💵", symbol, "余额:");
    console.log("   ", hre.ethers.utils.formatUnits(usdcBalance, decimals), symbol);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (usdcBalance.gt(0)) {
      console.log("\n✅ 余额充足！可以开始创建市场了！");
      console.log("\n💡 下一步:");
      console.log("   npm run dev (启动前端)");
      console.log("   或");
      console.log("   npx hardhat run scripts/create-test-market.js --network amoy");
    } else {
      console.log("\n⚠️  USDC 余额为 0");
      console.log("   请从水龙头获取测试 USDC:");
      console.log("   https://faucet.polygon.technology/");
    }
    
  } catch (error) {
    console.error("❌ 检查 USDC 余额失败:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

