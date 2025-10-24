/**
 * Conditional Tokens Framework 测试
 * 测试在本地 Hardhat 网络创建预测市场
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Conditional Tokens - prepareCondition 测试", function () {
  let conditionalTokens;
  let owner;
  let oracle;
  let user1;
  
  before(async function () {
    [owner, oracle, user1] = await ethers.getSigners();
    
    // 部署 Conditional Tokens 合约到本地网络
    console.log("\n📦 部署 ConditionalTokens 合约...");
    const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
    conditionalTokens = await ConditionalTokens.deploy();
    await conditionalTokens.deployed();
    
    console.log("✅ 合约地址:", conditionalTokens.address);
    console.log("📝 测试账户地址:", owner.address);
    console.log("🔮 Oracle 地址:", oracle.address);
  });

  describe("1. prepareCondition - 创建市场", function () {
    
    it("应该成功创建一个二元市场（YES/NO）", async function () {
      // 生成唯一的问题 ID
      const questionId = ethers.utils.formatBytes32String(`test-market-${Date.now()}`);
      const outcomeSlotCount = 2; // 2 个结果：YES/NO
      
      console.log("\n📝 创建市场参数:");
      console.log("  Oracle:", oracle.address);
      console.log("  Question ID:", questionId);
      console.log("  结果数量:", outcomeSlotCount);
      
      // 调用 prepareCondition
      const tx = await conditionalTokens.connect(oracle).prepareCondition(
        oracle.address,  // oracle 地址
        questionId,      // 问题 ID
        outcomeSlotCount // 结果数量
      );
      
      console.log("\n⏳ 交易哈希:", tx.hash);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log("✅ 交易确认，区块:", receipt.blockNumber);
      console.log("⛽ Gas 使用:", receipt.gasUsed.toString());
      
      // 计算 conditionId
      const conditionId = await conditionalTokens.getConditionId(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      console.log("\n🎯 Condition ID:", conditionId);
      
      // 验证条件已创建
      const slots = await conditionalTokens.getOutcomeSlotCount(conditionId);
      expect(slots.toNumber()).to.equal(outcomeSlotCount);
      
      console.log("✅ 市场创建成功！");
    });
    
    it("应该成功创建一个多结果市场（3个选项）", async function () {
      const questionId = ethers.utils.formatBytes32String(`multi-market-${Date.now()}`);
      const outcomeSlotCount = 3; // 3 个结果
      
      console.log("\n📝 创建多结果市场:");
      console.log("  结果数量:", outcomeSlotCount);
      
      const tx = await conditionalTokens.connect(oracle).prepareCondition(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      await tx.wait();
      
      const conditionId = await conditionalTokens.getConditionId(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      const slots = await conditionalTokens.getOutcomeSlotCount(conditionId);
      expect(slots.toNumber()).to.equal(outcomeSlotCount);
      
      console.log("✅ 多结果市场创建成功！");
    });
    
    it("不应该允许重复创建相同的条件", async function () {
      const questionId = ethers.utils.formatBytes32String("duplicate-test");
      const outcomeSlotCount = 2;
      
      // 第一次创建
      await conditionalTokens.connect(oracle).prepareCondition(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      // 尝试重复创建 - 应该失败
      try {
        await conditionalTokens.connect(oracle).prepareCondition(
          oracle.address,
          questionId,
          outcomeSlotCount
        );
        // 如果没有抛出错误，测试失败
        expect.fail("应该抛出错误但没有");
      } catch (error) {
        // 验证错误信息包含预期的 revert 原因
        expect(error.message).to.include("Condition already prepared");
        console.log("✅ 正确阻止了重复创建");
      }
    });
  });

  describe("2. getConditionId - 查询条件 ID", function () {
    
    it("应该能计算正确的 conditionId", async function () {
      const questionId = ethers.utils.formatBytes32String("test-123");
      const outcomeSlotCount = 2;
      
      const conditionId = await conditionalTokens.getConditionId(
        oracle.address,
        questionId,
        outcomeSlotCount
      );
      
      console.log("\n🔑 Condition ID:", conditionId);
      expect(conditionId).to.not.equal(ethers.constants.HashZero);
    });
  });

  describe("3. 完整市场创建流程", function () {
    
    it("应该完整测试市场创建到查询的流程", async function () {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 完整市场创建流程测试");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      // 步骤 1: 准备市场信息
      const marketInfo = {
        title: "湖人队能否进入 NBA 季后赛？",
        oracle: oracle.address,
        questionId: ethers.utils.formatBytes32String(`nba-lakers-${Date.now()}`),
        outcomeSlotCount: 2, // YES/NO
        outcomes: ["YES", "NO"]
      };
      
      console.log("\n1️⃣ 市场信息:");
      console.log("   标题:", marketInfo.title);
      console.log("   Oracle:", marketInfo.oracle);
      console.log("   结果:", marketInfo.outcomes.join(" / "));
      
      // 步骤 2: 创建条件
      console.log("\n2️⃣ 创建条件...");
      const tx = await conditionalTokens.connect(oracle).prepareCondition(
        marketInfo.oracle,
        marketInfo.questionId,
        marketInfo.outcomeSlotCount
      );
      
      const receipt = await tx.wait();
      console.log("   ✅ 交易确认:", receipt.transactionHash);
      
      // 步骤 3: 获取 conditionId
      console.log("\n3️⃣ 获取 Condition ID...");
      const conditionId = await conditionalTokens.getConditionId(
        marketInfo.oracle,
        marketInfo.questionId,
        marketInfo.outcomeSlotCount
      );
      console.log("   🎯 Condition ID:", conditionId);
      
      // 步骤 4: 验证条件
      console.log("\n4️⃣ 验证条件...");
      const slotCount = await conditionalTokens.getOutcomeSlotCount(conditionId);
      console.log("   ✅ 结果数量:", slotCount.toString());
      
      expect(slotCount.toNumber()).to.equal(marketInfo.outcomeSlotCount);
      
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ 完整流程测试通过！");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      // 返回市场信息（可用于后续测试）
      return {
        ...marketInfo,
        conditionId,
        transactionHash: receipt.transactionHash
      };
    });
  });
});

