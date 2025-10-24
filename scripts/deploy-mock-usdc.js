const hre = require("hardhat");

async function main() {
  console.log("\n🪙 部署 Mock USDC");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);

  // 部署 Mock USDC
  console.log("\n📝 部署 MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.deployed();

  console.log("✅ MockUSDC 已部署");
  console.log("📍 地址:", usdc.address);
  console.log("🔗 查看:", `https://amoy.polygonscan.com/address/${usdc.address}`);

  // 等待确认
  console.log("\n⏳ 等待区块确认...");
  await usdc.deployTransaction.wait(2);
  console.log("✅ 已确认\n");

  // 铸造 1000 USDC 给部署者
  console.log("💰 铸造 1000 USDC 给自己...");
  const mintAmount = hre.ethers.utils.parseUnits("1000", 6);
  const mintTx = await usdc.faucet(mintAmount);
  await mintTx.wait();
  console.log("✅ 铸造成功\n");

  // 检查余额
  const balance = await usdc.balanceOf(deployer.address);
  console.log("💵 您的 Mock USDC 余额:", hre.ethers.utils.formatUnits(balance, 6), "USDC");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 部署完成！\n");
  console.log("📋 Mock USDC 信息:");
  console.log("   地址:", usdc.address);
  console.log("   名称: Mock USDC");
  console.log("   符号: USDC");
  console.log("   小数: 6");
  console.log("   初始余额:", hre.ethers.utils.formatUnits(balance, 6), "USDC");

  console.log("\n💡 下一步:");
  console.log("   1. 更新 CTFExchange 使用这个 USDC 地址");
  console.log("   2. 或者重新部署 CTFExchange");
  console.log("   3. 创建测试市场");

  console.log("\n🔧 如需更多 USDC:");
  console.log(`   usdc.faucet(amount) - 铸造任意数量`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 保存地址
  const fs = require('fs');
  const path = require('path');
  const deploymentData = {
    mockUSDC: {
      address: usdc.address,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    }
  };
  fs.writeFileSync(
    path.join(__dirname, '../deployments/mock-usdc.json'),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("📝 地址已保存到: deployments/mock-usdc.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

