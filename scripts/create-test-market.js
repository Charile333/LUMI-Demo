const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🎯 创建测试市场（使用 Mock USDC）");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  // 读取部署信息
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );

  const adapterAddress = umaDeployment.contracts.realUmaCTFAdapter.address;
  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("👤 创建者:", deployer.address);
  console.log("📍 Adapter:", adapterAddress);
  console.log("💵 Mock USDC:", usdcAddress);

  // 获取合约
  const ADAPTER_ABI = [
    "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)"
  ];

  const USDC_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ];

  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);
  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  // 检查余额
  const balance = await usdc.balanceOf(deployer.address);
  console.log("\n💰 USDC 余额:", hre.ethers.utils.formatUnits(balance, 6), "USDC");

  // 市场参数
  const title = "测试市场：特朗普会赢得2024年选举吗？";
  const description = "预测2024年美国总统选举结果";
  const reward = hre.ethers.utils.parseUnits("10", 6); // 10 USDC

  console.log("\n📝 市场信息:");
  console.log("   标题:", title);
  console.log("   描述:", description);
  console.log("   奖励: 10 USDC");

  // 生成 question ID
  const questionId = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes(title + Date.now())
  );

  console.log("   Question ID:", questionId);

  // 获取 Gas Price
  const gasPrice = await deployer.provider.getGasPrice();
  const gasPriceGwei = hre.ethers.utils.formatUnits(gasPrice, "gwei");
  console.log("\n⛽ Gas Price:", gasPriceGwei, "Gwei");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("开始创建市场...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Step 1: Approve USDC
    console.log("📝 Step 1: Approve USDC");
    const approveTx = await usdc.approve(adapterAddress, reward, {
      gasLimit: 100000,
      gasPrice: gasPrice
    });
    console.log("   ⏳ 交易哈希:", approveTx.hash);
    await approveTx.wait();
    console.log("   ✅ Approved\n");

    // Step 2: Create Market
    console.log("📝 Step 2: 创建市场");
    const tx = await adapter.initialize(
      questionId,
      title,
      description,
      2, // YES/NO
      usdcAddress,
      reward,
      0, // 默认挑战期
      {
        gasLimit: 1200000,
        gasPrice: gasPrice
      }
    );

    console.log("   ⏳ 交易哈希:", tx.hash);
    console.log("   ⏳ 等待确认...");
    
    const receipt = await tx.wait();
    console.log("   ✅ 市场创建成功！");
    console.log("   📦 区块:", receipt.blockNumber);
    console.log("   ⛽ Gas 使用:", receipt.gasUsed.toString());

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ 完成！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎊 现在可以在前端查看这个市场:");
    console.log("   http://localhost:3000/admin/test-market\n");

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    if (error.error) {
      console.error("详细:", error.error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

