const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🔍 完整诊断：Gas 费用问题");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );

  const adapterAddress = umaDeployment.contracts.realUmaCTFAdapter.address;
  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("👤 账户地址:", deployer.address);

  // 1. 检查 POL 余额
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  POL 余额检查");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const polBalance = await deployer.getBalance();
  const polBalanceFormatted = hre.ethers.utils.formatEther(polBalance);
  console.log("💰 POL 余额:", polBalanceFormatted, "POL");
  
  const minRequired = "0.05";
  if (parseFloat(polBalanceFormatted) < parseFloat(minRequired)) {
    console.log("❌ POL 余额不足（需要至少", minRequired, "POL）");
  } else {
    console.log("✅ POL 余额充足");
  }

  // 2. 检查 Mock USDC 余额
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  Mock USDC 余额检查");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);
  const usdcBalance = await usdc.balanceOf(deployer.address);
  const usdcBalanceFormatted = hre.ethers.utils.formatUnits(usdcBalance, 6);
  
  console.log("💵 Mock USDC 余额:", usdcBalanceFormatted, "USDC");
  console.log("📍 Mock USDC 地址:", usdcAddress);
  
  if (parseFloat(usdcBalanceFormatted) < 100) {
    console.log("⚠️  USDC 余额少于 100");
  } else {
    console.log("✅ USDC 余额充足");
  }

  // 3. 检查网络配置
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  网络配置检查");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const network = await deployer.provider.getNetwork();
  console.log("🌍 网络:", network.name);
  console.log("🔢 Chain ID:", network.chainId);
  
  if (network.chainId !== 80002) {
    console.log("❌ 网络错误！应该是 Amoy (80002)");
  } else {
    console.log("✅ 网络正确");
  }

  // 4. 检查 Gas Price
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  Gas Price 检查");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const gasPrice = await deployer.provider.getGasPrice();
  const gasPriceGwei = hre.ethers.utils.formatUnits(gasPrice, "gwei");
  console.log("⛽ 当前 Gas Price:", gasPriceGwei, "Gwei");
  
  const minGasPrice = 25;
  if (parseFloat(gasPriceGwei) < minGasPrice) {
    console.log("⚠️  Gas Price 低于最低要求 (25 Gwei)");
  } else {
    console.log("✅ Gas Price 正常");
  }

  // 5. 估算交易费用
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("5️⃣  交易费用估算");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const approveGas = 60000;
  const createGas = 1000000;
  const totalGas = approveGas + createGas;
  
  const approveCost = hre.ethers.BigNumber.from(approveGas).mul(gasPrice);
  const createCost = hre.ethers.BigNumber.from(createGas).mul(gasPrice);
  const totalCost = approveCost.add(createCost);

  console.log("📝 Approve USDC:");
  console.log("   Gas:", approveGas.toLocaleString());
  console.log("   费用:", hre.ethers.utils.formatEther(approveCost), "POL");

  console.log("\n📝 创建市场:");
  console.log("   Gas:", createGas.toLocaleString());
  console.log("   费用:", hre.ethers.utils.formatEther(createCost), "POL");

  console.log("\n📊 总计:");
  console.log("   总 Gas:", totalGas.toLocaleString());
  console.log("   总费用:", hre.ethers.utils.formatEther(totalCost), "POL");

  // 6. 最终判断
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("6️⃣  最终诊断");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const totalCostFormatted = parseFloat(hre.ethers.utils.formatEther(totalCost));
  const polBalanceNum = parseFloat(polBalanceFormatted);

  if (polBalanceNum > totalCostFormatted) {
    console.log("✅ 所有检查通过！应该可以创建市场");
    console.log("\n💡 如果前端仍然失败，可能原因:");
    console.log("   1. 钱包 Gas Price 设置过高");
    console.log("   2. 钱包估算 Gas 过高");
    console.log("   3. 网络连接问题");
    console.log("\n建议:");
    console.log("   • 在钱包中手动降低 Gas Price 到 30-35 Gwei");
    console.log("   • 或使用脚本创建市场（绕过钱包估算）");
  } else {
    console.log("❌ POL 余额不足");
    console.log(`   需要: ${totalCostFormatted.toFixed(6)} POL`);
    console.log(`   当前: ${polBalanceNum} POL`);
    console.log(`   缺少: ${(totalCostFormatted - polBalanceNum).toFixed(6)} POL`);
    console.log("\n💡 解决方案:");
    console.log("   访问水龙头获取 POL:");
    console.log("   https://faucet.polygon.technology/");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

