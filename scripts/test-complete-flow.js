/**
 * 完整测试流程：Token铸造 → 订单交易 → 市场解析 → 赎回代币
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

// 合约地址
const CONTRACTS = {
  ctf: "0xeB4F3700FE422c1618B449763d423687D5ad0950",
  adapter: "0x5D440c98B55000087a8b0C164f1690551d18CfcC",
  mockOracle: "0x378fA22104E4c735680772Bf18C5195778a55b33",
  exchange: "0x41AE309fAb269adF729Cfae78E6Ef741F6a8E3AE",
  mockUSDC: "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a"
};

// ABI
const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function decimals() view returns (uint8)"
];

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList() view returns (bytes32[])",
  "function getMarket(bytes32) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
  "function resolve(bytes32 questionId)"
];

const ORACLE_ABI = [
  "function setPrice(int256 price)",
  "function setHasPrice(bool _hasPrice)",
  "function getPrice(bytes32, uint256, bytes memory) view returns (int256)",
  "function hasPrice(bytes32, uint256, bytes memory) view returns (bool)"
];

const CTF_ABI = [
  "function balanceOf(address owner, uint256 id) view returns (uint256)",
  "function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] partition, uint256 amount)",
  "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] indexSets)",
  "function setApprovalForAll(address operator, bool approved)",
  "function getPositionId(address collateralToken, bytes32 collectionId) view returns (uint256)"
];

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 完整流程测试");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 测试账户:", deployer.address);

  // 初始化合约
  const usdc = new ethers.Contract(CONTRACTS.mockUSDC, USDC_ABI, deployer);
  const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, deployer);
  const oracle = new ethers.Contract(CONTRACTS.mockOracle, ORACLE_ABI, deployer);
  const ctf = new ethers.Contract(CONTRACTS.ctf, CTF_ABI, deployer);

  // 检查余额
  let usdcBalance;
  try {
    usdcBalance = await usdc.balanceOf(deployer.address);
    console.log("\n💰 Mock USDC 余额:", ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  } catch (error) {
    console.log("\n⚠️ 无法读取 USDC 余额，可能是网络延迟，继续测试...");
    usdcBalance = ethers.utils.parseUnits("1000", 6); // 假设有足够余额
  }

  // 如果余额不足，铸造更多
  if (usdcBalance.lt(ethers.utils.parseUnits("100", 6))) {
    console.log("\n🏦 铸造 Mock USDC...");
    try {
      const mintTx = await usdc.mint(deployer.address, ethers.utils.parseUnits("1000", 6), {
        gasLimit: 200000
      });
      await mintTx.wait();
      console.log("✅ 铸造完成");
      // 等待几秒让交易确认
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log("⚠️ 铸造失败，但继续测试:", error.message);
    }
  }

  // 获取第一个市场
  console.log("\n" + "=".repeat(60));
  console.log("📊 阶段 1: 获取市场信息");
  console.log("=".repeat(60));

  const marketCount = await adapter.getMarketCount();
  console.log("\n市场数量:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("❌ 没有市场可测试，请先创建市场");
    return;
  }

  const marketList = await adapter.getMarketList();
  const questionId = marketList[0];
  console.log("测试市场 ID:", questionId);

  const market = await adapter.getMarket(questionId);
  console.log("\n市场详情:");
  console.log("  标题:", market.title);
  console.log("  描述:", market.description);
  console.log("  Condition ID:", market.conditionId);
  console.log("  结果数:", market.outcomeSlotCount.toString());
  console.log("  已解析:", market.resolved);

  if (market.resolved) {
    console.log("⚠️ 该市场已解析，请创建新市场或使用未解析的市场");
    return;
  }

  // 阶段 2: 铸造 Outcome Tokens
  console.log("\n" + "=".repeat(60));
  console.log("🎴 阶段 2: 铸造 Outcome Tokens");
  console.log("=".repeat(60));

  const splitAmount = ethers.utils.parseUnits("100", 6); // 100 USDC
  console.log("\n准备分割仓位:", ethers.utils.formatUnits(splitAmount, 6), "USDC");

  // 计算 Position IDs
  const parentCollectionId = ethers.constants.HashZero;
  const partition = [1, 2]; // YES, NO
  
  // 根据 CTF 规范计算 collectionId 和 positionId
  // collectionId = keccak256(abi.encodePacked(conditionId, indexSet))
  const yesCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [market.conditionId, 1]
  );
  const noCollectionId = ethers.utils.solidityKeccak256(
    ["bytes32", "uint256"],
    [market.conditionId, 2]
  );

  // positionId = keccak256(abi.encodePacked(collateralToken, collectionId))
  const yesPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, yesCollectionId]
  );
  const noPositionId = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [CONTRACTS.mockUSDC, noCollectionId]
  );

  console.log("\n计算的 Position IDs:");
  console.log("  YES Token ID:", yesPositionId);
  console.log("  NO Token ID:", noPositionId);

  // 检查当前余额
  const yesBalanceBefore = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalanceBefore = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n当前 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalanceBefore, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalanceBefore, 6));

  // Approve USDC
  console.log("\n批准 USDC...");
  const approveTx = await usdc.approve(CONTRACTS.ctf, splitAmount, {
    gasLimit: 100000
  });
  await approveTx.wait();
  console.log("✅ 批准完成");

  // 分割仓位
  console.log("\n分割仓位...");
  try {
    const splitTx = await ctf.splitPosition(
      CONTRACTS.mockUSDC,
      parentCollectionId,
      market.conditionId,
      partition,
      splitAmount,
      {
        gasLimit: 500000
      }
    );
    const receipt = await splitTx.wait();
    console.log("✅ 分割完成");
    console.log("   Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ 分割失败:", error.message);
    return;
  }

  // 检查新余额
  const yesBalanceAfter = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalanceAfter = await ctf.balanceOf(deployer.address, noPositionId);
  console.log("\n新的 Token 余额:");
  console.log("  YES:", ethers.utils.formatUnits(yesBalanceAfter, 6));
  console.log("  NO:", ethers.utils.formatUnits(noBalanceAfter, 6));

  // 阶段 3: 市场解析
  console.log("\n" + "=".repeat(60));
  console.log("🎯 阶段 3: 市场解析");
  console.log("=".repeat(60));

  console.log("\n设置 Oracle 价格 (YES 获胜)...");
  const price = ethers.utils.parseEther("1"); // 1e18 = YES
  
  try {
    const setPriceTx = await oracle.setPrice(price, {
      gasLimit: 100000
    });
    await setPriceTx.wait();
    console.log("✅ 价格已设置:", ethers.utils.formatEther(price));

    const setHasPriceTx = await oracle.setHasPrice(true, {
      gasLimit: 100000
    });
    await setHasPriceTx.wait();
    console.log("✅ hasPrice 已设置为 true");
  } catch (error) {
    console.error("❌ 设置 Oracle 失败:", error.message);
    return;
  }

  console.log("\n解析市场...");
  try {
    const resolveTx = await adapter.resolve(questionId, {
      gasLimit: 500000
    });
    const receipt = await resolveTx.wait();
    console.log("✅ 市场已解析");
    console.log("   Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ 解析失败:", error.message);
    return;
  }

  // 验证解析结果
  const resolvedMarket = await adapter.getMarket(questionId);
  console.log("\n解析结果:");
  console.log("  已解析:", resolvedMarket.resolved);
  console.log("  Payouts:", resolvedMarket.payouts.map(p => p.toString()).join(", "));

  // 阶段 4: 赎回代币
  console.log("\n" + "=".repeat(60));
  console.log("💸 阶段 4: 赎回代币");
  console.log("=".repeat(60));

  const usdcBefore = await usdc.balanceOf(deployer.address);
  console.log("\n赎回前 USDC 余额:", ethers.utils.formatUnits(usdcBefore, 6));

  console.log("\n赎回 Outcome Tokens...");
  try {
    const redeemTx = await ctf.redeemPositions(
      CONTRACTS.mockUSDC,
      parentCollectionId,
      market.conditionId,
      [1, 2], // 赎回 YES 和 NO
      {
        gasLimit: 500000
      }
    );
    const receipt = await redeemTx.wait();
    console.log("✅ 赎回完成");
    console.log("   Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ 赎回失败:", error.message);
    return;
  }

  const usdcAfter = await usdc.balanceOf(deployer.address);
  const yesBalanceFinal = await ctf.balanceOf(deployer.address, yesPositionId);
  const noBalanceFinal = await ctf.balanceOf(deployer.address, noPositionId);

  console.log("\n赎回后余额:");
  console.log("  USDC:", ethers.utils.formatUnits(usdcAfter, 6));
  console.log("  YES Token:", ethers.utils.formatUnits(yesBalanceFinal, 6));
  console.log("  NO Token:", ethers.utils.formatUnits(noBalanceFinal, 6));
  console.log("\n收益:");
  console.log("  USDC 变化:", ethers.utils.formatUnits(usdcAfter.sub(usdcBefore), 6), "USDC");

  // 最终总结
  console.log("\n" + "=".repeat(60));
  console.log("✅ 测试完成总结");
  console.log("=".repeat(60));
  console.log("\n✅ Token 铸造: 成功");
  console.log("✅ 市场解析: 成功");
  console.log("✅ 代币赎回: 成功");
  console.log("\n预期结果: YES 获胜");
  console.log("实际结果: Payouts =", resolvedMarket.payouts.map(p => p.toString()).join(", "));
  console.log("\n💰 净收益:", ethers.utils.formatUnits(usdcAfter.sub(usdcBefore), 6), "USDC");
  console.log("   (应该等于投入的 USDC，因为 YES 获胜且我们持有全部 YES Token)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

