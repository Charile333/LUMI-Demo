/**
 * 简化的完整流程测试
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

const CONTRACTS = {
  ctf: "0xeB4F3700FE422c1618B449763d423687D5ad0950",
  adapter: "0x5D440c98B55000087a8b0C164f1690551d18CfcC",
  mockOracle: "0x378fA22104E4c735680772Bf18C5195778a55b33",
  mockUSDC: "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a"
};

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 完整流程测试 (简化版)");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 初始化合约
  const usdc = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)",
     "function approve(address, uint256) returns (bool)",
     "function mint(address, uint256)",
     "function decimals() view returns (uint8)"],
    CONTRACTS.mockUSDC
  );

  const adapter = await ethers.getContractAt(
    ["function getMarketCount() view returns (uint256)",
     "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
     "function getMarket(bytes32) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
     "function resolve(bytes32)"],
    CONTRACTS.adapter
  );

  const oracle = await ethers.getContractAt(
    ["function setPrice(int256)",
     "function setHasPrice(bool)"],
    CONTRACTS.mockOracle
  );

  const ctf = await ethers.getContractAt(
    ["function balanceOf(address, uint256) view returns (uint256)",
     "function splitPosition(address, bytes32, bytes32, uint256[], uint256)",
     "function redeemPositions(address, bytes32, bytes32, uint256[])",
     "function setApprovalForAll(address, bool)"],
    CONTRACTS.ctf
  );

  // ========================================
  // 阶段 1: 获取市场
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("📊 阶段 1: 获取市场信息");
  console.log("=".repeat(60));

  const marketCount = await adapter.getMarketCount();
  console.log("\n市场数量:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场，请先创建市场");
    return;
  }

  const marketList = await adapter.getMarketList(0, marketCount);
  let questionId = marketList[0];
  console.log("使用市场 ID:", questionId);

  const market = await adapter.getMarket(questionId);
  console.log("\n市场信息:");
  console.log("  标题:", market.title);
  console.log("  描述:", market.description);
  console.log("  Condition ID:", market.conditionId);
  console.log("  已解析:", market.resolved);

  let finalMarket = market;
  if (market.resolved) {
    console.log("\n⚠️  该市场已解析，尝试使用第二个市场");
    if (marketList.length > 1) {
      const questionId2 = marketList[1];
      const market2 = await adapter.getMarket(questionId2);
      if (!market2.resolved) {
        console.log("✅ 使用第二个市场:", market2.title);
        questionId = questionId2;
        finalMarket = market2;
      } else {
        console.log("⚠️  第二个市场也已解析，继续使用第一个市场进行赎回测试");
      }
    }
  }

  // ========================================
  // 阶段 2: 铸造 Outcome Tokens
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("🎴 阶段 2: 铸造 Outcome Tokens");
  console.log("=".repeat(60));

  const splitAmount = ethers.utils.parseUnits("100", 6);
  console.log("\n准备分割:", ethers.utils.formatUnits(splitAmount, 6), "USDC");

  // 计算 Position IDs
  const yesCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [finalMarket.conditionId, 1]
  );
  const noCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [finalMarket.conditionId, 2]
  );
  const yesPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, yesCollectionId]
  );
  const noPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, noCollectionId]
  );

  console.log("\nPosition IDs:");
  console.log("  YES:", yesPositionId);
  console.log("  NO:", noPositionId);

  // 检查余额
  const yesBalBefore = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalBefore = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n当前 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalBefore, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalBefore, 6));

  // Approve & Split
  console.log("\n批准 USDC...");
  const approveTx = await usdc.approve(CONTRACTS.ctf, splitAmount);
  await approveTx.wait();
  console.log("✅ 批准完成");

  console.log("\n分割仓位...");
  const splitTx = await ctf.splitPosition(
    CONTRACTS.mockUSDC,
    ethers.constants.HashZero,
    finalMarket.conditionId,
    [1, 2],
    splitAmount
  );
  await splitTx.wait();
  console.log("✅ 分割完成");

  const yesBalAfter = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalAfter = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n新的 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalAfter, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalAfter, 6));

  // ========================================
  // 阶段 3: 市场解析
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("🎯 阶段 3: 市场解析");
  console.log("=".repeat(60));

  if (finalMarket.resolved) {
    console.log("\n⏭️  市场已解析，跳过此步骤");
  } else {
    console.log("\n设置 Oracle 价格 (YES 获胜)...");
    const setPriceTx = await oracle.setPrice(ethers.utils.parseEther("1"));
    await setPriceTx.wait();
    console.log("✅ 价格已设置");

    const setHasTx = await oracle.setHasPrice(true);
    await setHasTx.wait();
    console.log("✅ hasPrice 已设置");

    console.log("\n解析市场...");
    const resolveTx = await adapter.resolve(questionId);
    await resolveTx.wait();
    console.log("✅ 市场已解析");
  }

  const resolvedMarket = await adapter.getMarket(questionId);
  console.log("\n解析结果:");
  console.log("  已解析:", resolvedMarket.resolved);
  console.log("  Payouts:", resolvedMarket.payouts.map(p => p.toString()).join(", "));

  // ========================================
  // 阶段 4: 赎回代币
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("💸 阶段 4: 赎回代币");
  console.log("=".repeat(60));

  const usdcBefore = await usdc.balanceOf(deployer.address);
  console.log("\n赎回前 USDC:", ethers.utils.formatUnits(usdcBefore, 6));

  console.log("\n赎回 Outcome Tokens...");
  const redeemTx = await ctf.redeemPositions(
    CONTRACTS.mockUSDC,
    ethers.constants.HashZero,
    finalMarket.conditionId,
    [1, 2]
  );
  await redeemTx.wait();
  console.log("✅ 赎回完成");

  const usdcAfter = await usdc.balanceOf(deployer.address);
  const yesBalFinal = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalFinal = await ctf.balanceOf(deployer.address, noPositionId);

  console.log("\n赎回后余额:");
  console.log("  USDC:", ethers.utils.formatUnits(usdcAfter, 6));
  console.log("  YES Token:", ethers.utils.formatUnits(yesBalFinal, 6));
  console.log("  NO Token:", ethers.utils.formatUnits(noBalFinal, 6));

  console.log("\n📈 收益:");
  const profit = usdcAfter.sub(usdcBefore);
  console.log("  USDC 变化:", ethers.utils.formatUnits(profit, 6), "USDC");

  // ========================================
  // 总结
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ 测试完成");
  console.log("=".repeat(60));
  console.log("\n✅ Token 铸造: 成功");
  console.log("✅ 市场解析: 成功");
  console.log("✅ 代币赎回: 成功");
  console.log("\n💰 净收益:", ethers.utils.formatUnits(profit, 6), "USDC");
  console.log("   (因为 YES 获胜，赎回了", ethers.utils.formatUnits(yesBalAfter.sub(yesBalBefore), 6), "YES Token)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 错误:", error.message);
    console.error(error);
    process.exit(1);
  });

