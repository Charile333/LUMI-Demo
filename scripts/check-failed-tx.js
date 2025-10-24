const hre = require("hardhat");

async function main() {
  console.log("\n🔍 分析失败的交易");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const txHash = "0xe872932134149b310582c7dbb37ff8c9b8d3036dd704fdef1c4a09fd1b5fe806";
  
  console.log("📍 交易哈希:", txHash);
  console.log("🌍 查看详情:");
  console.log("   https://www.oklink.com/amoy/tx/" + txHash);
  console.log();

  try {
    const tx = await hre.ethers.provider.getTransaction(txHash);
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("交易信息");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("状态:", receipt.status === 1 ? "✅ 成功" : "❌ 失败");
    console.log("Gas 使用:", receipt.gasUsed.toString());
    console.log("Gas Limit:", tx.gasLimit.toString());
    console.log("区块:", receipt.blockNumber);
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("可能的失败原因");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (receipt.status === 0) {
      console.log("❌ 交易执行失败（status: 0）\n");
      console.log("可能原因:");
      console.log("  1. Mock USDC 不在 UMA Oracle 白名单中");
      console.log("     → UMA Oracle 只接受特定的代币作为奖励");
      console.log();
      console.log("  2. 奖励金额不足");
      console.log("     → UMA Oracle 可能要求最小奖励金额");
      console.log();
      console.log("  3. Oracle 配置问题");
      console.log("     → 可能需要先在 Oracle 中注册");
      console.log();
      console.log("💡 解决方案:");
      console.log("  • 使用 Amoy 上的真实 USDC (需要从水龙头获取)");
      console.log("  • 或者使用更简单的 Mock Oracle (已在 simple 版本中实现)");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("❌ 无法获取交易信息:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

