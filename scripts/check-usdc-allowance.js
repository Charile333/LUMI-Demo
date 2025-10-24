const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🔍 检查 USDC 授权和余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  // 读取地址
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );

  const usdcAddress = mockUsdcDeployment.mockUSDC.address;
  const adapterAddress = umaDeployment.contracts.realUmaCTFAdapter.address;

  console.log("👤 账户:", deployer.address);
  console.log("💵 Mock USDC:", usdcAddress);
  console.log("📍 Adapter:", adapterAddress);
  console.log();

  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  // 1. 检查用户余额
  const userBalance = await usdc.balanceOf(deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  用户余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("💰 您的 USDC:", hre.ethers.utils.formatUnits(userBalance, 6), "USDC");

  // 2. 检查 Adapter 持有的 USDC
  const adapterBalance = await usdc.balanceOf(adapterAddress);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  Adapter 持有的 USDC");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("💼 Adapter USDC:", hre.ethers.utils.formatUnits(adapterBalance, 6), "USDC");
  console.log("   (已锁定在创建的市场中)");

  // 3. 检查授权额度
  const allowance = await usdc.allowance(deployer.address, adapterAddress);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  授权额度");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ 已授权给 Adapter:", hre.ethers.utils.formatUnits(allowance, 6), "USDC");

  // 4. 分析
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  分析");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const userBalanceNum = parseFloat(hre.ethers.utils.formatUnits(userBalance, 6));
  const allowanceNum = parseFloat(hre.ethers.utils.formatUnits(allowance, 6));

  if (userBalanceNum === 0) {
    console.log("❌ 您的 USDC 余额为 0！");
    console.log("   所有 USDC 可能已用于创建市场");
  } else if (userBalanceNum < 100) {
    console.log("⚠️  USDC 余额较少（< 100 USDC）");
    console.log("   建议创建奖励较小的市场（如 10 USDC）");
  } else {
    console.log("✅ USDC 余额充足");
  }

  if (allowanceNum > 0) {
    console.log(`ℹ️  当前已有 ${allowanceNum} USDC 的授权额度`);
    console.log("   可以直接创建市场（不需要再次 approve）");
  } else {
    console.log("ℹ️  没有授权额度，创建市场时需要先 approve");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

