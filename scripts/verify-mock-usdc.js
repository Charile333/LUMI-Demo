const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🔍 验证 Mock USDC 配置");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 账户:", deployer.address);

  // 读取部署文件
  const mockUsdcPath = path.join(__dirname, '../deployments/mock-usdc.json');
  
  if (!fs.existsSync(mockUsdcPath)) {
    console.log("❌ mock-usdc.json 文件不存在！");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(mockUsdcPath, 'utf8'));
  const usdcAddress = deployment.mockUSDC.address;

  console.log("📍 Mock USDC 地址:", usdcAddress);
  console.log("   (来自 mock-usdc.json)\n");

  // 验证合约代码
  const code = await hre.ethers.provider.getCode(usdcAddress);
  if (code === '0x') {
    console.log("❌ 该地址没有合约代码！Mock USDC 未部署或地址错误");
    return;
  }
  console.log("✅ 合约已部署\n");

  // 连接合约
  const USDC_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  try {
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    const balance = await usdc.balanceOf(deployer.address);
    const totalSupply = await usdc.totalSupply();

    console.log("📊 合约信息:");
    console.log("   名称:", name);
    console.log("   符号:", symbol);
    console.log("   精度:", decimals);
    console.log("   总供应:", hre.ethers.utils.formatUnits(totalSupply, decimals));
    console.log("\n💰 您的余额:", hre.ethers.utils.formatUnits(balance, decimals), symbol);

    if (balance.eq(0)) {
      console.log("\n❌ 余额为 0！需要铸造 Mock USDC");
      console.log("\n💡 运行以下命令铸造 1000 USDC:");
      console.log("   npx hardhat run scripts/mint-mock-usdc.js --network amoy");
    } else {
      console.log("\n✅ Mock USDC 配置正常！");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 前端配置检查");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("前端应该使用的地址:");
    console.log(`mockUSDC: '${usdcAddress}'`);
    console.log("\n如果前端地址不一致，请更新 app/admin/test-market/page.tsx\n");

  } catch (error) {
    console.log("❌ 无法读取合约信息:", error.message);
    console.log("   可能不是有效的 ERC20 合约");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

