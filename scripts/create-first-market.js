const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🎯 创建第一个测试市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 创建者:", deployer.address);

  // 读取部署信息
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const adapterAddress = umaDeployment.contracts.realUmaCTFAdapter.address;
  const usdcAddress = mockUsdcDeployment.mockUSDC.address;

  // 合约实例
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

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 检查 USDC 余额
  const balance = await usdc.balanceOf(deployer.address);
  console.log("💰 您的 USDC 余额:", hre.ethers.utils.formatUnits(balance, 6), "USDC\n");

  if (balance.lt(hre.ethers.utils.parseUnits("100", 6))) {
    console.log("⚠️  USDC 余额不足 100");
    console.log("   建议至少有 100 USDC 用于奖励\n");
    return;
  }

  // 市场参数
  const title = "特朗普会赢得2024年美国总统选举吗？";
  const description = "预测2024年美国总统选举结果。如果特朗普获胜则结果为 YES，否则为 NO。";
  const reward = hre.ethers.utils.parseUnits("100", 6); // 100 USDC
  
  // 生成唯一的 questionId
  const questionId = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes(title + Date.now())
  );

  console.log("📝 市场信息:");
  console.log("   标题:", title);
  console.log("   描述:", description);
  console.log("   奖励:", hre.ethers.utils.formatUnits(reward, 6), "USDC");
  console.log("   结果数: 2 (YES/NO)");
  console.log("   挑战期: 2小时\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Step 1: Approve USDC
  console.log("📝 步骤 1: Approve USDC...");
  const approveTx = await usdc.approve(adapterAddress, reward);
  console.log("   交易哈希:", approveTx.hash);
  await approveTx.wait();
  console.log("   ✅ Approve 成功\n");

  // Step 2: 创建市场
  console.log("📝 步骤 2: 创建市场...");
  console.log("   (这可能需要 10-30 秒...)");
  
  const tx = await adapter.initialize(
    questionId,
    title,
    description,
    2, // YES/NO
    usdcAddress,
    reward,
    0, // 默认挑战期 (2小时)
    {
      gasLimit: 1000000, // 设置足够的 gas
      gasPrice: hre.ethers.utils.parseUnits("30", "gwei") // Amoy 最低要求 25 Gwei
    }
  );

  console.log("   交易哈希:", tx.hash);
  console.log("   ⏳ 等待确认...");
  
  const receipt = await tx.wait();
  console.log("   ✅ 市场创建成功！");
  console.log("   Gas 使用:", receipt.gasUsed.toString());

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 市场创建完成！\n");

  // 查询市场总数
  const marketCount = await adapter.getMarketCount();
  console.log("📊 总市场数:", marketCount.toString());
  console.log("📍 Question ID:", questionId);

  console.log("\n💡 下一步:");
  console.log("   1. 访问前端查看市场:");
  console.log("      http://localhost:3000/admin/blockchain-markets");
  console.log("   2. 等待 UMA Oracle 解析 (约2小时)");
  console.log("   3. 测试订单簿交易:");
  console.log("      http://localhost:3000/trade/[marketId]");

  console.log("\n⚠️  提醒:");
  console.log("   • 市场刚创建，需要等待 UMA Oracle 提案");
  console.log("   • 挑战期约 2 小时");
  console.log("   • 挑战期结束后才能解析市场");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 保存市场信息
  const marketData = {
    questionId,
    title,
    description,
    reward: hre.ethers.utils.formatUnits(reward, 6),
    creator: deployer.address,
    timestamp: new Date().toISOString(),
    txHash: receipt.transactionHash
  };

  fs.writeFileSync(
    path.join(__dirname, '../deployments/first-market.json'),
    JSON.stringify(marketData, null, 2)
  );
  console.log("📝 市场信息已保存到: deployments/first-market.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

