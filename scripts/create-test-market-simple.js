const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🎯 创建测试市场（使用 Mock Oracle）");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  // 读取部署信息
  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const adapterAddress = testDeployment.contracts.testUmaCTFAdapter.address;
  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  console.log("👤 创建者:", deployer.address);
  console.log("📍 Test Adapter:", adapterAddress);
  console.log("💵 Mock USDC:", usdcAddress);

  const ADAPTER_ABI = [
    "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
    "function getMarketCount() view returns (uint256)"
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
  const title = "特朗普会赢得2024年选举吗？";
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

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("开始创建市场...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Step 1: Approve USDC
    console.log("📝 Step 1/2: Approve USDC");
    const approveTx = await usdc.approve(adapterAddress, reward);
    console.log("   ⏳ 交易哈希:", approveTx.hash);
    console.log("   ⏳ 等待确认...");
    await approveTx.wait();
    console.log("   ✅ Approved\n");

    // Step 2: Create Market
    console.log("📝 Step 2/2: 创建市场");
    const tx = await adapter.initialize(
      questionId,
      title,
      description,
      2, // YES/NO
      usdcAddress,
      reward,
      0 // 默认挑战期
    );

    console.log("   ⏳ 交易哈希:", tx.hash);
    console.log("   ⏳ 等待确认...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("   ✅ 市场创建成功！");
      console.log("   📦 区块:", receipt.blockNumber);
      console.log("   ⛽ Gas 使用:", receipt.gasUsed.toString());

      // 查询市场数量
      const count = await adapter.getMarketCount();
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ 完成！");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      console.log("📊 当前系统状态:");
      console.log("   市场总数:", count.toString());
      console.log("   Question ID:", questionId);

      console.log("\n🎊 现在可以在前端查看这个市场:");
      console.log("   http://localhost:3000/admin/test-market\n");

      console.log("💡 提示: 刷新浏览器页面 (Ctrl+Shift+R) 查看新市场\n");

    } else {
      console.log("   ❌ 市场创建失败");
      console.log("   查看交易:", `https://www.oklink.com/amoy/tx/${tx.hash}`);
    }

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    
    if (error.error) {
      console.error("详细信息:", error.error);
    }
    
    if (error.message.includes("nonce")) {
      console.log("\n💡 Nonce 冲突！可能有未确认的交易。");
      console.log("   请在钱包中取消所有待处理的交易，然后重试。");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

