const hre = require("hardhat");

async function main() {
  console.log("\n⛽ 检查 POL 余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 账户地址:", deployer.address);

  const balance = await deployer.getBalance();
  const balanceInPOL = hre.ethers.utils.formatEther(balance);
  
  console.log("\n💰 当前余额:", balanceInPOL, "POL");

  // 估算需要的 Gas
  const gasLimit = 1000000; // 1M gas
  const gasPrice = hre.ethers.utils.parseUnits("30", "gwei"); // 30 Gwei
  const estimatedCost = gasLimit * gasPrice;
  const estimatedCostInPOL = hre.ethers.utils.formatEther(estimatedCost);

  console.log("\n📊 创建市场估算:");
  console.log("   Gas Limit:", gasLimit.toLocaleString());
  console.log("   Gas Price: 30 Gwei");
  console.log("   预计费用:", estimatedCostInPOL, "POL");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const balanceNum = parseFloat(balanceInPOL);
  const costNum = parseFloat(estimatedCostInPOL);

  if (balanceNum < costNum) {
    console.log("\n❌ 余额不足！");
    console.log(`   需要: ${estimatedCostInPOL} POL`);
    console.log(`   当前: ${balanceInPOL} POL`);
    console.log(`   缺少: ${(costNum - balanceNum).toFixed(6)} POL`);
    
    console.log("\n💡 解决方案:");
    console.log("   1. 访问水龙头获取 POL:");
    console.log("      https://faucet.polygon.technology/");
    console.log("   2. 或使用更低的奖励金额（减少 10 USDC）");
  } else if (balanceNum < costNum * 2) {
    console.log("\n⚠️  余额较少，建议获取更多 POL");
    console.log(`   当前: ${balanceInPOL} POL`);
    console.log(`   建议: 至少 ${(costNum * 2).toFixed(4)} POL`);
  } else {
    console.log("\n✅ 余额充足！可以创建市场");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

