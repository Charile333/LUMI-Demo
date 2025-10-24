const hre = require("hardhat");

/**
 * 等待 USDC 到账并自动检查
 */
async function main() {
  console.log("\n⏳ 等待 USDC 到账...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 账户地址:", deployer.address);

  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const usdc = new hre.ethers.Contract(USDC_ADDRESS, USDC_ABI, deployer);

  let attempts = 0;
  const maxAttempts = 30; // 最多检查 30 次（约 5 分钟）
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const balance = await usdc.balanceOf(deployer.address);
      const decimals = await usdc.decimals();
      const formattedBalance = hre.ethers.utils.formatUnits(balance, decimals);

      console.log(`\n[${attempts}/${maxAttempts}] 检查中...`);
      console.log(`   USDC 余额: ${formattedBalance} USDC`);

      if (balance.gt(0)) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 USDC 已到账！");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("💰 最终余额:", formattedBalance, "USDC");
        console.log("\n✅ 现在可以创建市场了！");
        console.log("\n💡 下一步:");
        console.log("   npx hardhat run scripts/create-first-market.js --network amoy");
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        return;
      }

      // 等待 10 秒后继续检查
      if (attempts < maxAttempts) {
        console.log("   ⏳ 等待 10 秒后继续检查...");
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

    } catch (error) {
      console.error(`   ❌ 检查失败:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log("\n⚠️  已达到最大检查次数");
  console.log("   交易可能需要更长时间");
  console.log("   请访问区块链浏览器查看:");
  console.log(`   https://amoy.polygonscan.com/address/${deployer.address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

