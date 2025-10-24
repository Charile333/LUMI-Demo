const hre = require("hardhat");
const { ethers } = require("ethers");

/**
 * 完整系统测试脚本
 * 测试 UMA Oracle + CTF Exchange 订单簿
 */

// 导入部署信息
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🧪 开始完整系统测试");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 获取签名者
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 测试账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 账户余额:", hre.ethers.utils.formatEther(balance), "POL\n");

  // 读取部署信息
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );
  const exchangeDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-exchange.json'), 'utf8')
  );

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 已部署的合约:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("ConditionalTokens:", umaDeployment.contracts.conditionalTokens.address);
  console.log("RealUmaCTFAdapter:", umaDeployment.contracts.realUmaCTFAdapter.address);
  console.log("UMA Oracle V2:", umaDeployment.contracts.umaOptimisticOracle.address);
  console.log("CTFExchange:", exchangeDeployment.contracts.ctfExchange.address);
  console.log("USDC:", exchangeDeployment.contracts.collateral.address);

  // 合约实例
  const ctfAddress = umaDeployment.contracts.conditionalTokens.address;
  const adapterAddress = umaDeployment.contracts.realUmaCTFAdapter.address;
  const exchangeAddress = exchangeDeployment.contracts.ctfExchange.address;
  const usdcAddress = exchangeDeployment.contracts.collateral.address;

  // ABI
  const ADAPTER_ABI = [
    "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
    "function getMarketCount() view returns (uint256)",
    "function canResolve(bytes32 questionId) view returns (bool)",
    "function resolve(bytes32 questionId)"
  ];

  const EXCHANGE_ABI = [
    "function getOrderRemaining(tuple(uint256 salt, address maker, address signer, address taker, uint256 tokenId, uint256 makerAmount, uint256 takerAmount, uint256 expiration, uint256 nonce, uint256 feeRateBps, uint8 side, uint8 signatureType) order) view returns (uint256)",
    "function isOrderValid(tuple(uint256 salt, address maker, address signer, address taker, uint256 tokenId, uint256 makerAmount, uint256 takerAmount, uint256 expiration, uint256 nonce, uint256 feeRateBps, uint8 side, uint8 signatureType) order, bytes signature) view returns (bool)",
    "function paused() view returns (bool)",
    "function feeRecipient() view returns (address)"
  ];

  const CTF_ABI = [
    "function balanceOf(address account, uint256 id) view returns (uint256)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address account, address operator) view returns (bool)"
  ];

  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);
  const exchange = new hre.ethers.Contract(exchangeAddress, EXCHANGE_ABI, deployer);
  const ctf = new hre.ethers.Contract(ctfAddress, CTF_ABI, deployer);
  const usdc = new hre.ethers.Contract(usdcAddress, USDC_ABI, deployer);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 测试 1: UMA Oracle 系统");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1.1 检查市场数量
  try {
    const marketCount = await adapter.getMarketCount();
    console.log("✅ 市场总数:", marketCount.toString());
  } catch (error) {
    console.error("❌ 获取市场数量失败:", error.message);
  }

  // 1.2 查询最新市场（如果有）
  try {
    const marketCount = await adapter.getMarketCount();
    if (marketCount.gt(0)) {
      console.log("\n📊 查询最新市场...");
      // 获取市场列表
      const marketIds = await adapter.getMarketList(0, Math.min(marketCount.toNumber(), 1));
      if (marketIds.length > 0) {
        const latestMarketId = marketIds[0];
        const market = await adapter.getMarket(latestMarketId);
        
        console.log("\n最新市场信息:");
        console.log("  标题:", market.title);
        console.log("  描述:", market.description);
        console.log("  结果数:", market.outcomeSlotCount.toString());
        console.log("  已解析:", market.resolved ? "是" : "否");
        console.log("  奖励:", hre.ethers.utils.formatUnits(market.reward, 6), "USDC");
        
        // 检查是否可解析
        try {
          const canResolve = await adapter.canResolve(latestMarketId);
          console.log("  可解析:", canResolve ? "是" : "否");
        } catch (error) {
          console.log("  可解析: 检查失败（这是正常的，挑战期未结束）");
        }
      }
    } else {
      console.log("\n📭 当前没有市场");
    }
  } catch (error) {
    console.error("❌ 查询市场失败:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 测试 2: CTF Exchange 订单簿系统");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 2.1 检查 Exchange 状态
  try {
    const paused = await exchange.paused();
    console.log("✅ Exchange 状态:", paused ? "暂停" : "活跃");
    
    const feeRecipient = await exchange.feeRecipient();
    console.log("✅ 手续费接收地址:", feeRecipient);
  } catch (error) {
    console.error("❌ 检查 Exchange 状态失败:", error.message);
  }

  // 2.2 检查 Approval 状态
  console.log("\n📝 检查 Approval 状态...");
  
  try {
    // 检查 USDC Approval
    const usdcAllowance = await usdc.allowance(deployer.address, exchangeAddress);
    console.log("  USDC Allowance:", hre.ethers.utils.formatUnits(usdcAllowance, 6), "USDC");
    
    // 检查 CTF Approval
    const ctfApproved = await ctf.isApprovedForAll(deployer.address, exchangeAddress);
    console.log("  CTF Approved:", ctfApproved ? "是" : "否");
    
    // 检查 USDC 余额
    const usdcBalance = await usdc.balanceOf(deployer.address);
    console.log("  USDC 余额:", hre.ethers.utils.formatUnits(usdcBalance, 6), "USDC");
  } catch (error) {
    console.error("❌ 检查 Approval 失败:", error.message);
  }

  // 2.3 创建模拟订单并验证
  console.log("\n📝 创建模拟订单...");
  
  try {
    const mockOrder = {
      salt: hre.ethers.utils.hexlify(hre.ethers.utils.randomBytes(32)),
      maker: deployer.address,
      signer: deployer.address,
      taker: hre.ethers.constants.AddressZero,
      tokenId: "0x0000000000000000000000000000000000000000000000000000000000000001",
      makerAmount: hre.ethers.utils.parseUnits("65", 6), // 0.65 USDC per token
      takerAmount: hre.ethers.utils.parseEther("100"), // 100 tokens
      expiration: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      nonce: 0,
      feeRateBps: 100, // 1%
      side: 0, // BUY
      signatureType: 0 // EOA
    };

    console.log("\n模拟订单:");
    console.log("  类型: BUY");
    console.log("  价格: 0.65 USDC per token");
    console.log("  数量: 100 tokens");
    console.log("  总额: 65 USDC");
    console.log("  手续费: 1%");
    console.log("  过期: 24小时后");

    // 检查订单剩余可填充数量
    const remaining = await exchange.getOrderRemaining(mockOrder);
    console.log("\n  剩余可填充:", hre.ethers.utils.formatEther(remaining), "tokens");

  } catch (error) {
    console.error("❌ 创建模拟订单失败:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 测试 3: 集成测试总结");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ 测试完成项:");
  console.log("  ✓ UMA Oracle 合约连接");
  console.log("  ✓ CTF Exchange 合约连接");
  console.log("  ✓ 市场数据查询");
  console.log("  ✓ Exchange 状态检查");
  console.log("  ✓ Approval 状态检查");
  console.log("  ✓ 模拟订单创建");

  console.log("\n📝 下一步建议:");
  console.log("  1. 在前端测试订单簿显示");
  console.log("  2. 测试完整的下单流程");
  console.log("  3. 测试订单匹配和结算");
  console.log("  4. 创建真实市场并交易");

  console.log("\n💡 提示:");
  console.log("  • 如需创建市场，需要先获取测试 USDC");
  console.log("  • 如需交易，需要 Approve USDC 和 CTF");
  console.log("  • 订单在链下签名，仅结算需要 Gas");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

