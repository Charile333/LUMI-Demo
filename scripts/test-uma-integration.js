/**
 * UMA集成测试脚本
 * 用于本地测试UMA-CTF适配器
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🔮 UMA-CTF适配器集成测试\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 获取签名者
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  console.log("👤 用户1:", user1.address);
  console.log("👤 用户2:", user2.address);
  console.log("");
  
  // ========== 步骤1：部署合约 ==========
  console.log("📝 步骤1：部署合约...\n");
  
  // 1.1 部署ConditionalTokens
  console.log("   部署 ConditionalTokens...");
  const CTF = await ethers.getContractFactory("ConditionalTokens");
  const ctf = await CTF.deploy();
  await ctf.deployed();
  console.log("   ✅ CTF 地址:", ctf.address);
  
  // 1.2 部署Mock Oracle（本地测试用）
  console.log("\n   部署 MockOptimisticOracle...");
  const MockOracle = await ethers.getContractFactory("MockOptimisticOracle");
  const oracle = await MockOracle.deploy();
  await oracle.deployed();
  console.log("   ✅ Oracle 地址:", oracle.address);
  
  // 1.3 部署UmaCTFAdapter
  console.log("\n   部署 UmaCTFAdapter...");
  const Adapter = await ethers.getContractFactory("UmaCTFAdapter");
  const adapter = await Adapter.deploy(ctf.address, oracle.address);
  await adapter.deployed();
  console.log("   ✅ Adapter 地址:", adapter.address);
  
  console.log("\n✅ 所有合约部署完成！\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // ========== 步骤2：创建市场 ==========
  console.log("📝 步骤2：创建测试市场...\n");
  
  const questionId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Will BTC reach $100k in 2025?")
  );
  
  const title = "比特币2025年突破10万美元？";
  const description = "预测比特币价格在2025年12月31日前是否突破10万美元";
  
  console.log("   标题:", title);
  console.log("   问题ID:", questionId);
  
  // Mock USDC地址（实际使用时替换为真实地址）
  const mockUSDC = "0x" + "1".repeat(40);
  const reward = ethers.utils.parseUnits("100", 6); // 100 USDC
  
  const tx = await adapter.initialize(
    questionId,
    title,
    description,
    2, // YES/NO
    mockUSDC,
    reward
  );
  
  await tx.wait();
  console.log("\n✅ 市场创建成功！");
  
  // 获取市场信息
  const market = await adapter.getMarket(questionId);
  console.log("\n📊 市场信息:");
  console.log("   条件ID:", market.conditionId);
  console.log("   结果数量:", market.outcomeSlotCount.toString());
  console.log("   请求时间:", new Date(market.requestTimestamp * 1000).toLocaleString());
  console.log("   已解析:", market.resolved);
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // ========== 步骤3：模拟预言机返回结果 ==========
  console.log("📝 步骤3：模拟UMA预言机返回结果...\n");
  
  // 设置价格（1e18 = YES, 0 = NO, 5e17 = INVALID）
  const yesPrice = ethers.utils.parseEther("1"); // YES
  
  console.log("   设置预言机结果: YES");
  await oracle.setPrice(yesPrice);
  await oracle.setHasPrice(true);
  
  console.log("   ✅ 预言机数据已设置");
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // ========== 步骤4：解析市场 ==========
  console.log("📝 步骤4：解析市场...\n");
  
  // 检查是否可以解析
  const canResolve = await adapter.canResolve(questionId);
  console.log("   可以解析:", canResolve);
  
  if (canResolve) {
    console.log("\n   开始解析市场...");
    const resolveTx = await adapter.resolve(questionId);
    await resolveTx.wait();
    
    console.log("   ✅ 市场解析成功！");
    
    // 获取更新后的市场信息
    const resolvedMarket = await adapter.getMarket(questionId);
    console.log("\n📊 解析后的市场信息:");
    console.log("   已解析:", resolvedMarket.resolved);
    
    // 检查CTF上的条件状态
    const isResolved = await ctf.isResolved(market.conditionId);
    console.log("   CTF条件已解析:", isResolved);
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // ========== 步骤5：查询所有市场 ==========
  console.log("📝 步骤5：查询所有市场...\n");
  
  const marketCount = await adapter.getMarketCount();
  console.log("   总市场数:", marketCount.toString());
  
  if (marketCount > 0) {
    const markets = await adapter.getMarketList(0, 10);
    console.log("\n   市场列表:");
    for (let i = 0; i < markets.length; i++) {
      const m = await adapter.getMarket(markets[i]);
      console.log(`   ${i + 1}. 条件ID: ${m.conditionId.substring(0, 10)}... (已解析: ${m.resolved})`);
    }
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🎉 测试完成！\n");
  
  // 保存部署地址
  const deployment = {
    network: hre.network.name,
    ctf: ctf.address,
    oracle: oracle.address,
    adapter: adapter.address,
    testMarket: {
      questionId,
      conditionId: market.conditionId,
      title
    }
  };
  
  console.log("📋 部署信息:");
  console.log(JSON.stringify(deployment, null, 2));
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });










