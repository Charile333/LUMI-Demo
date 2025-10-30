const hre = require("hardhat");

async function main() {
  console.log("\n🔍 测试网络连接和配置\n");
  
  try {
    // 测试 provider
    console.log("📡 测试 RPC 连接...");
    const network = await hre.ethers.provider.getNetwork();
    console.log(`   ✅ 网络: ${network.name} (chainId: ${network.chainId})`);
    
    // 测试 signer
    console.log("\n🔑 测试账户配置...");
    const signers = await hre.ethers.getSigners();
    console.log(`   找到 ${signers.length} 个账户`);
    
    if (signers.length === 0) {
      console.log("   ❌ 没有找到账户！请检查 PRIVATE_KEY 配置");
      return;
    }
    
    const deployer = signers[0];
    console.log(`   ✅ 账户地址: ${deployer.address}`);
    
    // 测试余额
    console.log("\n💰 查询余额...");
    const balance = await deployer.getBalance();
    const balanceInPOL = hre.ethers.utils.formatEther(balance);
    console.log(`   余额: ${balanceInPOL} POL`);
    
    if (balance.eq(0)) {
      console.log("   ⚠️  余额为 0，请访问水龙头获取测试币");
      console.log("   https://faucet.polygon.technology/");
    } else {
      console.log("   ✅ 余额充足，可以开始部署");
    }
    
    console.log("\n✅ 所有检查通过！\n");
    
  } catch (error) {
    console.log("\n❌ 检查失败:");
    console.error(error.message);
    console.log("\n💡 建议:");
    console.log("   1. 检查 .env.local 文件中的 PRIVATE_KEY");
    console.log("   2. 确保私钥不包含 0x 前缀");
    console.log("   3. 检查网络连接");
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

