/**
 * 产品场景测试 - Conditional Tokens
 * 测试实际产品中的使用场景
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

// BSC 主网真实合约地址
const REAL_CONTRACT_ADDRESS = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";

const CONDITIONAL_TOKENS_ABI = [
  "function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external",
  "function getConditionId(address oracle, bytes32 questionId, uint outcomeSlotCount) external pure returns (bytes32)",
  "function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)",
  "function payoutNumerators(bytes32 conditionId, uint index) external view returns (uint)",
  "function payoutDenominator(bytes32 conditionId) external view returns (uint)"
];

describe("产品场景测试", function () {
  let contract;
  let oracle;
  let gasReports = [];

  before(async function () {
    [oracle] = await ethers.getSigners();
    
    contract = new ethers.Contract(
      REAL_CONTRACT_ADDRESS,
      CONDITIONAL_TOKENS_ABI,
      oracle
    );
    
    console.log("\n🔗 连接到 BSC 合约");
    console.log("📍 合约地址:", REAL_CONTRACT_ADDRESS);
    console.log("🔮 Oracle:", oracle.address);
    
    const balance = await oracle.getBalance();
    console.log("💰 余额:", ethers.utils.formatEther(balance), "BNB\n");
  });

  after(function () {
    if (gasReports.length > 0) {
      console.log("\n📊 Gas 消耗报告:");
      console.log("═══════════════════════════════════════════════");
      gasReports.forEach(report => {
        const bnbCost = report.gas * 5 / 1e9; // 5 Gwei
        const usdCost = bnbCost * 300; // BNB @ $300
        console.log(`${report.scenario}`);
        console.log(`  Gas: ${report.gas.toLocaleString()}`);
        console.log(`  成本: ${bnbCost.toFixed(6)} BNB (~$${usdCost.toFixed(3)})`);
        console.log("───────────────────────────────────────────────");
      });
      
      const totalGas = gasReports.reduce((sum, r) => sum + r.gas, 0);
      const avgGas = totalGas / gasReports.length;
      const totalBnb = totalGas * 5 / 1e9;
      const totalUsd = totalBnb * 300;
      
      console.log(`总计: ${totalGas.toLocaleString()} gas`);
      console.log(`平均: ${avgGas.toLocaleString()} gas/市场`);
      console.log(`总成本: ${totalBnb.toFixed(6)} BNB (~$${totalUsd.toFixed(2)})`);
      console.log("═══════════════════════════════════════════════\n");
    }
  });

  describe("1. 体育与游戏场景", function () {
    
    it("场景 1.1: NBA 总冠军预测 (30 支球队)", async function () {
      const questionId = ethers.utils.formatBytes32String(`nba-champion-${Date.now()}`);
      const outcomeCount = 30; // 30 支 NBA 球队
      
      console.log("\n🏀 NBA 总冠军预测");
      console.log("  Question ID:", questionId);
      console.log("  球队数量:", outcomeCount);
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "NBA 总冠军 (30 选项)", gas: gasEstimate.toNumber() });
        
        // 注意：如果不想真实创建，可以只估算 Gas
        // 如果要真实创建，取消下面的注释
        /*
        const tx = await contract.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount,
          { gasLimit: gasEstimate.mul(120).div(100) }
        );
        const receipt = await tx.wait();
        console.log("  ✅ 创建成功，实际 Gas:", receipt.gasUsed.toString());
        */
        
      } catch (error) {
        if (error.message.includes("insufficient funds")) {
          console.log("  ⚠️ 余额不足（仅估算 Gas）");
        } else {
          console.error("  ❌ 错误:", error.message);
        }
      }
    });

    it("场景 1.2: 足球比赛胜负平 (3 选项)", async function () {
      const questionId = ethers.utils.formatBytes32String(`football-${Date.now()}`);
      const outcomeCount = 3; // 胜/平/负
      
      console.log("\n⚽ 足球比赛胜负平");
      console.log("  结果选项: 胜 / 平 / 负");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "足球比赛 (3 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });
  });

  describe("2. 科技与 AI 场景", function () {
    
    it("场景 2.1: iPhone 18 发布日期 (4 个季度)", async function () {
      const questionId = ethers.utils.formatBytes32String(`iphone18-${Date.now()}`);
      const outcomeCount = 4; // Q1, Q2, Q3, Q4
      
      console.log("\n📱 iPhone 18 发布日期预测");
      console.log("  选项: Q1 2025 / Q2 2025 / Q3 2025 / Q4 2025");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "iPhone 发布日期 (4 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });

    it("场景 2.2: 特斯拉销量突破 (YES/NO)", async function () {
      const questionId = ethers.utils.formatBytes32String(`tesla-sales-${Date.now()}`);
      const outcomeCount = 2; // YES/NO
      
      console.log("\n🚗 特斯拉年销量突破 200 万辆");
      console.log("  选项: YES / NO");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "特斯拉销量 (2 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });
  });

  describe("3. 经济与金融场景", function () {
    
    it("场景 3.1: 比特币价格区间 (5 个区间)", async function () {
      const questionId = ethers.utils.formatBytes32String(`btc-price-${Date.now()}`);
      const outcomeCount = 5; // <50k, 50k-75k, 75k-100k, 100k-150k, >150k
      
      console.log("\n₿ 比特币 2024 年底价格区间");
      console.log("  区间: <50k | 50k-75k | 75k-100k | 100k-150k | >150k");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "BTC 价格区间 (5 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });

    it("场景 3.2: 美联储利率决策 (3 选项)", async function () {
      const questionId = ethers.utils.formatBytes32String(`fed-rate-${Date.now()}`);
      const outcomeCount = 3; // 加息/维持/降息
      
      console.log("\n📊 美联储下次会议决策");
      console.log("  选项: 加息 / 维持不变 / 降息");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "美联储利率 (3 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });
  });

  describe("4. 娱乐场景", function () {
    
    it("场景 4.1: 奥斯卡最佳影片 (10 提名)", async function () {
      const questionId = ethers.utils.formatBytes32String(`oscar-${Date.now()}`);
      const outcomeCount = 10; // 10 部提名影片
      
      console.log("\n🎬 奥斯卡最佳影片预测");
      console.log("  提名数量:", outcomeCount);
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ 预估 Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "奥斯卡最佳影片 (10 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ⚠️", error.message);
      }
    });
  });

  describe("5. 批量创建场景", function () {
    
    it("场景 5.1: 模拟一天创建 10 个市场", async function () {
      console.log("\n📦 批量创建 10 个市场");
      
      const markets = [
        { name: "NBA 比赛 1", outcomes: 2 },
        { name: "NBA 比赛 2", outcomes: 2 },
        { name: "足球比赛 1", outcomes: 3 },
        { name: "足球比赛 2", outcomes: 3 },
        { name: "加密货币价格 1", outcomes: 5 },
        { name: "加密货币价格 2", outcomes: 5 },
        { name: "科技新品发布", outcomes: 4 },
        { name: "经济数据预测", outcomes: 3 },
        { name: "娱乐活动", outcomes: 6 },
        { name: "政治事件", outcomes: 2 },
      ];
      
      let totalGas = 0;
      
      for (let i = 0; i < markets.length; i++) {
        const market = markets[i];
        const questionId = ethers.utils.formatBytes32String(`batch-${Date.now()}-${i}`);
        
        try {
          const gasEstimate = await contract.estimateGas.prepareCondition(
            oracle.address,
            questionId,
            market.outcomes
          );
          
          totalGas += gasEstimate.toNumber();
          console.log(`  ${i + 1}. ${market.name} (${market.outcomes} 选项): ${gasEstimate.toString()} gas`);
          
        } catch (error) {
          console.log(`  ${i + 1}. ${market.name}: ❌ ${error.message}`);
        }
      }
      
      const totalBnb = totalGas * 5 / 1e9;
      const totalUsd = totalBnb * 300;
      
      console.log("\n  ═══════════════════════════════════════");
      console.log(`  总 Gas: ${totalGas.toLocaleString()}`);
      console.log(`  总成本: ${totalBnb.toFixed(6)} BNB (~$${totalUsd.toFixed(2)})`);
      console.log(`  平均: ${(totalGas / markets.length).toLocaleString()} gas/市场`);
      console.log("  ═══════════════════════════════════════");
      
      gasReports.push({ scenario: "批量创建 10 个市场", gas: totalGas });
    });
  });

  describe("6. 边界情况测试", function () {
    
    it("场景 6.1: 最小市场 (2 选项)", async function () {
      const questionId = ethers.utils.formatBytes32String(`min-${Date.now()}`);
      const outcomeCount = 2; // 最小值
      
      console.log("\n🔬 最小市场 (2 选项)");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "最小市场 (2 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ❌", error.message);
      }
    });

    it("场景 6.2: 大型市场 (100 选项)", async function () {
      const questionId = ethers.utils.formatBytes32String(`large-${Date.now()}`);
      const outcomeCount = 100; // 大量选项
      
      console.log("\n🔬 大型市场 (100 选项)");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "大型市场 (100 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ❌", error.message);
      }
    });

    it("场景 6.3: 超大市场 (256 选项)", async function () {
      const questionId = ethers.utils.formatBytes32String(`xlarge-${Date.now()}`);
      const outcomeCount = 256; // 可能的最大值
      
      console.log("\n🔬 超大市场 (256 选项)");
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          outcomeCount
        );
        
        console.log("  ⛽ Gas:", gasEstimate.toString());
        gasReports.push({ scenario: "超大市场 (256 选项)", gas: gasEstimate.toNumber() });
        
      } catch (error) {
        console.log("  ❌", error.message);
        expect(error.message).to.include("revert"); // 预期会失败
      }
    });
  });

  describe("7. 查询功能测试", function () {
    
    it("场景 7.1: 批量查询条件 ID", async function () {
      console.log("\n🔍 批量查询条件 ID");
      
      const testCases = [
        { id: "test-1", outcomes: 2 },
        { id: "test-2", outcomes: 3 },
        { id: "test-3", outcomes: 5 },
      ];
      
      for (const testCase of testCases) {
        const questionId = ethers.utils.formatBytes32String(testCase.id);
        
        const conditionId = await contract.getConditionId(
          oracle.address,
          questionId,
          testCase.outcomes
        );
        
        console.log(`  ${testCase.id} (${testCase.outcomes} 选项): ${conditionId}`);
        expect(conditionId).to.not.equal(ethers.constants.HashZero);
      }
    });

    it("场景 7.2: 查询不存在的条件", async function () {
      const fakeConditionId = ethers.utils.formatBytes32String("nonexistent");
      
      const slotCount = await contract.getOutcomeSlotCount(fakeConditionId);
      
      console.log("\n🔍 查询不存在的条件");
      console.log("  结果数量:", slotCount.toString());
      
      expect(slotCount.toNumber()).to.equal(0);
    });
  });
});

describe("8. 性能基准测试", function () {
  let contract, oracle;

  before(async function () {
    [oracle] = await ethers.getSigners();
    contract = new ethers.Contract(
      REAL_CONTRACT_ADDRESS,
      CONDITIONAL_TOKENS_ABI,
      oracle
    );
  });

  it("基准 8.1: 不同选项数量的 Gas 对比", async function () {
    console.log("\n📊 Gas 消耗与选项数量关系");
    console.log("═══════════════════════════════════════════");
    
    const outcomeCounts = [2, 3, 5, 10, 20, 30, 50];
    const results = [];
    
    for (const count of outcomeCounts) {
      const questionId = ethers.utils.formatBytes32String(`benchmark-${count}`);
      
      try {
        const gasEstimate = await contract.estimateGas.prepareCondition(
          oracle.address,
          questionId,
          count
        );
        
        const gas = gasEstimate.toNumber();
        const bnbCost = gas * 5 / 1e9;
        const usdCost = bnbCost * 300;
        
        results.push({ count, gas, bnbCost, usdCost });
        
        console.log(`${String(count).padStart(3)} 选项: ${String(gas).padStart(7)} gas | ${bnbCost.toFixed(6)} BNB | $${usdCost.toFixed(3)}`);
        
      } catch (error) {
        console.log(`${String(count).padStart(3)} 选项: ❌ 失败`);
      }
    }
    
    console.log("═══════════════════════════════════════════");
    
    // 分析 Gas 增长率
    if (results.length > 1) {
      const gasPerOption = (results[results.length - 1].gas - results[0].gas) / 
                          (results[results.length - 1].count - results[0].count);
      console.log(`\n每增加 1 个选项约增加: ${gasPerOption.toFixed(0)} gas`);
    }
  });
});

