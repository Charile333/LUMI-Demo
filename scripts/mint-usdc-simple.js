const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n💰 铸造 Mock USDC 给 MetaMask 地址");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const [deployer] = await hre.ethers.getSigners();
    
    const mockUsdcDeployment = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
    );

    const usdcAddress = mockUsdcDeployment.mockUSDC.address;
    const metamaskAddress = "0x6830271111dc9814b3bEd0E4a8307E75AC571f95";

    console.log("👤 部署者:", deployer.address);
    console.log("💵 Mock USDC:", usdcAddress);
    console.log("🎯 接收地址 (MetaMask):", metamaskAddress);

    // 检查部署者 POL 余额
    const polBalance = await deployer.getBalance();
    const polBalanceFormatted = hre.ethers.utils.formatEther(polBalance);
    console.log("⛽ 部署者 POL 余额:", polBalanceFormatted, "POL");

    if (parseFloat(polBalanceFormatted) < 0.01) {
      console.log("\n❌ POL 余额不足！需要至少 0.01 POL");
      console.log("💡 请访问水龙头获取 POL:");
      console.log("   https://faucet.polygon.technology/");
      process.exit(1);
    }

    console.log();

    const USDC_ABI = [
      "function faucet(uint256 amount) public",
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];

    const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

    // 检查 MetaMask 当前余额
    const currentBalance = await usdc.balanceOf(metamaskAddress);
    console.log("📊 MetaMask 当前 USDC 余额:", hre.ethers.utils.formatUnits(currentBalance, 6), "USDC");

    // 检查部署者 USDC 余额
    const deployerBalance = await usdc.balanceOf(deployer.address);
    console.log("📊 部署者 USDC 余额:", hre.ethers.utils.formatUnits(deployerBalance, 6), "USDC");

    const amount = 1000; // 1000 USDC
    const transferAmount = hre.ethers.utils.parseUnits(amount.toString(), 6);

    // 如果部署者余额不足，先铸造
    if (deployerBalance.lt(transferAmount)) {
      console.log(`\n💰 铸造 ${amount} USDC 给部署者...`);
      const mintTx = await usdc.faucet(amount);
      console.log("   ⏳ 交易哈希:", mintTx.hash);
      await mintTx.wait();
      console.log("   ✅ 铸造成功");
    } else {
      console.log(`\n✅ 部署者 USDC 余额充足，跳过铸造`);
    }

    console.log(`\n📤 转账 ${amount} USDC 到 MetaMask...`);
    const transferTx = await usdc.transfer(metamaskAddress, transferAmount);
    console.log("   ⏳ 交易哈希:", transferTx.hash);
    await transferTx.wait();
    console.log("   ✅ 转账成功");

    // 检查新余额
    const newBalance = await usdc.balanceOf(metamaskAddress);
    console.log("\n📊 MetaMask 新 USDC 余额:", hre.ethers.utils.formatUnits(newBalance, 6), "USDC");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ 完成！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎊 MetaMask 地址现在有", amount, "USDC 了！");
    console.log("\n🚀 下一步:");
    console.log("   1. 刷新前端页面 (Ctrl+Shift+R)");
    console.log("   2. 重新尝试创建市场");
    console.log("   3. http://localhost:3000/admin/test-market\n");

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    
    if (error.message.includes("private key")) {
      console.log("\n💡 配置问题：私钥格式不正确");
      console.log("   请检查 .env.local 文件中的 PRIVATE_KEY");
      console.log("   格式应该是: 0x + 64个十六进制字符");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 POL 余额不足");
      console.log("   请访问水龙头获取 POL:");
      console.log("   https://faucet.polygon.technology/");
    } else {
      console.log("\n详细信息:", error);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

