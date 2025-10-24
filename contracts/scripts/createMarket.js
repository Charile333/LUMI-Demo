/**
 * 创建市场脚本
 * 使用 Conditional Tokens Framework 在 BSC 上创建预测市场
 * 
 * 运行方式：
 * npx hardhat run contracts/scripts/createMarket.js --network bscTestnet
 */

const { ethers } = require("hardhat");

// Conditional Tokens 合约地址
const CONDITIONAL_TOKENS_ADDRESS = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";

// ABI
const CONDITIONAL_TOKENS_ABI = [
  "function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external",
  "function getConditionId(address oracle, bytes32 questionId, uint outcomeSlotCount) external pure returns (bytes32)",
  "function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)"
];

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 创建预测市场");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("📝 账户地址:", deployer.address);
  
  // 获取余额
  const balance = await deployer.getBalance();
  console.log("💰 BNB 余额:", ethers.utils.formatEther(balance), "BNB\n");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.log("⚠️  警告：余额较低，可能无法支付 Gas 费用");
    console.log("💡 BSC Testnet 水龙头: https://testnet.binance.org/faucet-smart\n");
  }
  
  // 连接合约
  const conditionalTokens = new ethers.Contract(
    CONDITIONAL_TOKENS_ADDRESS,
    CONDITIONAL_TOKENS_ABI,
    deployer
  );
  
  console.log("📄 Conditional Tokens 合约:", CONDITIONAL_TOKENS_ADDRESS);
  console.log("🔗 BSCScan:", `https://bscscan.com/address/${CONDITIONAL_TOKENS_ADDRESS}\n`);
  
  // 市场信息
  const market = {
    title: "湖人队能否进入 2024-25 赛季 NBA 季后赛？",
    description: "洛杉矶湖人队能否在 2024-25 赛季成功进入季后赛",
    oracle: deployer.address, // 使用当前账户作为 oracle
    questionId: ethers.utils.formatBytes32String(`nba-lakers-${Date.now()}`),
    outcomeSlotCount: 2, // YES/NO
    outcomes: ["YES - 进入季后赛", "NO - 未进入季后赛"]
  };
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 市场详情");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("标题:", market.title);
  console.log("描述:", market.description);
  console.log("Oracle:", market.oracle);
  console.log("Question ID:", market.questionId);
  console.log("结果数量:", market.outcomeSlotCount);
  console.log("结果选项:");
  market.outcomes.forEach((outcome, index) => {
    console.log(`  ${index + 1}. ${outcome}`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 确认
  console.log("⏳ 准备创建市场...\n");
  
  try {
    // 估算 Gas
    console.log("📊 估算 Gas...");
    const gasEstimate = await conditionalTokens.estimateGas.prepareCondition(
      market.oracle,
      market.questionId,
      market.outcomeSlotCount
    );
    console.log("⛽ 预估 Gas:", gasEstimate.toString());
    
    const gasPrice = await deployer.getGasPrice();
    const estimatedCost = gasEstimate.mul(gasPrice);
    console.log("💵 预估费用:", ethers.utils.formatEther(estimatedCost), "BNB\n");
    
    // 创建条件
    console.log("🚀 发送交易...");
    const tx = await conditionalTokens.prepareCondition(
      market.oracle,
      market.questionId,
      market.outcomeSlotCount,
      {
        gasLimit: gasEstimate.mul(120).div(100) // +20% buffer
      }
    );
    
    console.log("📤 交易哈希:", tx.hash);
    console.log("🔗 BSCScan:", `https://bscscan.com/tx/${tx.hash}`);
    console.log("\n⏳ 等待确认...");
    
    const receipt = await tx.wait();
    
    console.log("\n✅ 交易确认成功！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("区块高度:", receipt.blockNumber);
    console.log("Gas 使用:", receipt.gasUsed.toString());
    console.log("实际费用:", ethers.utils.formatEther(
      receipt.gasUsed.mul(receipt.effectiveGasPrice)
    ), "BNB");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // 获取 conditionId
    console.log("🔑 获取 Condition ID...");
    const conditionId = await conditionalTokens.getConditionId(
      market.oracle,
      market.questionId,
      market.outcomeSlotCount
    );
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 市场创建成功！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Condition ID:", conditionId);
    console.log("交易哈希:", receipt.transactionHash);
    console.log("查看交易:", `https://bscscan.com/tx/${receipt.transactionHash}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // 验证条件
    const slotCount = await conditionalTokens.getOutcomeSlotCount(conditionId);
    console.log("✅ 验证通过 - 结果数量:", slotCount.toString());
    
    // 保存结果
    const result = {
      title: market.title,
      description: market.description,
      conditionId: conditionId,
      oracle: market.oracle,
      questionId: market.questionId,
      outcomeSlotCount: market.outcomeSlotCount,
      outcomes: market.outcomes,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString()
    };
    
    console.log("\n📝 市场信息（保存到数据库）:");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    
    if (error.code === "INSUFFICIENT_FUNDS") {
      console.log("\n💡 解决方案：");
      console.log("   1. 确保钱包有足够的 BNB");
      console.log("   2. BSC Testnet 水龙头: https://testnet.binance.org/faucet-smart");
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


















