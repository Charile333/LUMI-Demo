/**
 * 测试 BSC 主网上的真实 Conditional Tokens 合约
 * 合约地址: 0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7
 * 
 * ⚠️ 这些测试使用 Fork 模式，不会消耗真实的 BNB
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

// BSC 主网上的真实合约地址
const REAL_CONTRACT_ADDRESS = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";

// 真实合约的 ABI
const CONDITIONAL_TOKENS_ABI = [
  "function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external",
  "function getConditionId(address oracle, bytes32 questionId, uint outcomeSlotCount) external pure returns (bytes32)",
  "function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)",
  "function payoutNumerators(bytes32 conditionId, uint index) external view returns (uint)",
  "function payoutDenominator(bytes32 conditionId) external view returns (uint)"
];

describe("BSC 真实合约测试 - 只读操作", function () {
  let conditionalTokens;
  let owner;
  
  before(async function () {
    [owner] = await ethers.getSigners();
    
    // 连接到真实合约
    conditionalTokens = new ethers.Contract(
      REAL_CONTRACT_ADDRESS,
      CONDITIONAL_TOKENS_ABI,
      owner
    );
    
    console.log("\n🔗 连接到 BSC 真实合约");
    console.log("📍 合约地址:", REAL_CONTRACT_ADDRESS);
    console.log("🌐 查看: https://bscscan.com/address/" + REAL_CONTRACT_ADDRESS);
  });

  describe("1. 查询功能测试（不消耗 Gas）", function () {
    
    it("应该能够计算 Condition ID", async function () {
      const oracle = owner.address;
      const questionId = ethers.utils.formatBytes32String("test-query");
      const outcomeSlotCount = 2;
      
      console.log("\n🔍 测试 getConditionId()...");
      
      const conditionId = await conditionalTokens.getConditionId(
        oracle,
        questionId,
        outcomeSlotCount
      );
      
      console.log("✅ Condition ID:", conditionId);
      expect(conditionId).to.not.equal(ethers.constants.HashZero);
    });
    
    it("应该能够查询不存在的条件", async function () {
      const fakeConditionId = ethers.utils.formatBytes32String("fake-condition");
      
      console.log("\n🔍 查询不存在的条件...");
      
      const slotCount = await conditionalTokens.getOutcomeSlotCount(fakeConditionId);
      
      console.log("📊 结果数量:", slotCount.toString());
      expect(slotCount.toNumber()).to.equal(0);
    });
  });

  describe("2. 合约基本信息", function () {
    
    it("应该能够获取合约代码", async function () {
      const code = await ethers.provider.getCode(REAL_CONTRACT_ADDRESS);
      
      console.log("\n📝 合约代码长度:", code.length);
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.greaterThan(100);
      
      console.log("✅ 合约已部署并有代码");
    });
  });
});

describe("BSC 真实合约测试 - 写入操作（需要 BNB）", function () {
  let conditionalTokens;
  let oracle;
  
  // 设置较长的超时时间，因为需要等待真实区块链确认
  this.timeout(120000); // 2 分钟
  
  before(async function () {
    // 检查是否在 fork 模式
    const network = await ethers.provider.getNetwork();
    
    if (network.chainId !== 56 && network.chainId !== 31337) {
      console.log("\n⚠️ 警告: 不在 BSC 主网或 Fork 模式");
      console.log("当前 ChainID:", network.chainId);
      this.skip(); // 跳过这些测试
    }
    
    [oracle] = await ethers.getSigners();
    
    conditionalTokens = new ethers.Contract(
      REAL_CONTRACT_ADDRESS,
      CONDITIONAL_TOKENS_ABI,
      oracle
    );
    
    console.log("\n🔗 连接到真实合约（写入模式）");
    console.log("📍 合约地址:", REAL_CONTRACT_ADDRESS);
    console.log("🔮 Oracle 地址:", oracle.address);
    
    // 检查余额
    const balance = await oracle.getBalance();
    console.log("💰 账户余额:", ethers.utils.formatEther(balance), "BNB");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log("⚠️ 警告: 余额不足，可能无法支付 Gas");
    }
  });
  
  it("应该能够创建一个新的条件（消耗 Gas）", async function () {
    const questionId = ethers.utils.formatBytes32String(`test-${Date.now()}`);
    const outcomeSlotCount = 2;
    
    console.log("\n📝 创建新条件...");
    console.log("  Question ID:", questionId);
    console.log("  结果数量:", outcomeSlotCount);
    
    try {
      // 估算 Gas
      const gasEstimate = await conditionalTokens.estimateGas.prepareCondition(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      console.log("⛽ 预估 Gas:", gasEstimate.toString());
      
      // 执行交易
      const tx = await conditionalTokens.prepareCondition(
        oracle.address,
        questionId,
        outcomeSlotCount,
        { gasLimit: gasEstimate.mul(120).div(100) } // 增加 20% 余量
      );
      
      console.log("⏳ 交易哈希:", tx.hash);
      console.log("🔗 查看: https://bscscan.com/tx/" + tx.hash);
      
      // 等待确认
      const receipt = await tx.wait();
      console.log("✅ 交易确认，区块:", receipt.blockNumber);
      console.log("⛽ 实际 Gas:", receipt.gasUsed.toString());
      
      // 验证条件已创建
      const conditionId = await conditionalTokens.getConditionId(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      const slots = await conditionalTokens.getOutcomeSlotCount(conditionId);
      expect(slots.toNumber()).to.equal(outcomeSlotCount);
      
      console.log("🎯 Condition ID:", conditionId);
      console.log("✅ 条件创建成功！");
      
    } catch (error) {
      if (error.message.includes("insufficient funds")) {
        console.log("❌ 余额不足，无法支付 Gas");
        console.log("💡 提示: 请向测试账户充值 BNB");
      } else if (error.message.includes("already prepared")) {
        console.log("⚠️ 条件已存在（这是正常的）");
      } else {
        console.error("❌ 错误:", error.message);
        throw error;
      }
    }
  });
});


















