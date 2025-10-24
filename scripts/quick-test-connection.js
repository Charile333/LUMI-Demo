/**
 * 快速测试 Amoy 连接
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔍 快速连接测试...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("余额:", ethers.utils.formatEther(balance), "POL");
  
  const network = await ethers.provider.getNetwork();
  console.log("网络:", network.name, "| Chain ID:", network.chainId);
  
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("最新区块:", blockNumber);
  
  console.log("\n✅ 连接正常！\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 连接失败:", error.message);
    process.exit(1);
  });







