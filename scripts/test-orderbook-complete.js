const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🧪 完整订单薄测试流程");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();

  // 读取部署信息
  const testDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-test-uma.json'), 'utf8')
  );
  const exchangeDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-exchange.json'), 'utf8')
  );
  const mockUsdcDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/mock-usdc.json'), 'utf8')
  );

  const ctfAddress = testDeployment.contracts.conditionalTokens.address;
  const exchangeAddress = exchangeDeployment.contracts.ctfExchange.address;
  const mockUsdcAddress = mockUsdcDeployment.mockUSDC.address;
  const adapterAddress = testDeployment.contracts.testUmaCTFAdapter.address;

  console.log("📋 合约地址:");
  console.log("   ConditionalTokens:", ctfAddress);
  console.log("   CTFExchange:", exchangeAddress);
  console.log("   Mock USDC:", mockUsdcAddress);
  console.log("   Test Adapter:", adapterAddress);
  console.log("   账户:", deployer.address);
  console.log();

  // ABIs
  const CTF_ABI = [
    "function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] partition, uint256 amount) external",
    "function balanceOf(address owner, uint256 positionId) view returns (uint256)",
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address owner, address operator) view returns (bool)"
  ];

  const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const ADAPTER_ABI = [
    "function getMarketCount() view returns (uint256)",
    "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
  ];

  const ctf = new hre.ethers.Contract(ctfAddress, CTF_ABI, deployer);
  const usdc = new hre.ethers.Contract(mockUsdcAddress, USDC_ABI, deployer);
  const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, deployer);

  // ========== 步骤 1: 检查余额 ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 1: 检查余额");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const usdcBalance = await usdc.balanceOf(deployer.address);
  console.log("💵 USDC 余额:", hre.ethers.utils.formatUnits(usdcBalance, 6), "USDC");

  const polBalance = await deployer.getBalance();
  console.log("⛽ POL 余额:", hre.ethers.utils.formatEther(polBalance), "POL");

  // ========== 步骤 2: 获取市场信息 ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 2: 获取市场信息");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const marketCount = await adapter.getMarketCount();
  console.log("📊 市场总数:", marketCount.toString());

  if (marketCount.eq(0)) {
    console.log("\n❌ 没有市场可供测试");
    console.log("💡 请先创建市场: http://localhost:3000/admin/test-market");
    return;
  }

  const marketIds = await adapter.getMarketList(0, 1);
  const questionId = marketIds[0];
  const market = await adapter.getMarket(questionId);

  console.log("🎯 使用市场:");
  console.log("   标题:", market.title);
  console.log("   Condition ID:", market.conditionId);
  console.log("   已解析:", market.resolved ? "是" : "否");

  if (market.resolved) {
    console.log("\n⚠️  市场已解析，无法交易");
    return;
  }

  // ========== 步骤 3: 计算 Position IDs ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 3: 计算 Outcome Token IDs");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 计算 collectionId
  const collectionIdYes = hre.ethers.utils.keccak256(
    hre.ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "uint256"],
      [market.conditionId, 1] // indexSet = 1 (binary: 01)
    )
  );

  const collectionIdNo = hre.ethers.utils.keccak256(
    hre.ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "uint256"],
      [market.conditionId, 2] // indexSet = 2 (binary: 10)
    )
  );

  // 计算 positionId (直接计算，不调用合约)
  // positionId = uint(keccak256(abi.encodePacked(collateralToken, collectionId)))
  const positionIdYes = hre.ethers.BigNumber.from(
    hre.ethers.utils.keccak256(
      hre.ethers.utils.defaultAbiCoder.encode(
        ["address", "bytes32"],
        [mockUsdcAddress, collectionIdYes]
      )
    )
  );

  const positionIdNo = hre.ethers.BigNumber.from(
    hre.ethers.utils.keccak256(
      hre.ethers.utils.defaultAbiCoder.encode(
        ["address", "bytes32"],
        [mockUsdcAddress, collectionIdNo]
      )
    )
  );

  console.log("Token IDs:");
  console.log("   YES Token:", positionIdYes.toString());
  console.log("   NO  Token:", positionIdNo.toString());

  // 检查 token 余额
  const balanceYes = await ctf.balanceOf(deployer.address, positionIdYes);
  const balanceNo = await ctf.balanceOf(deployer.address, positionIdNo);

  console.log("\n当前 Token 余额:");
  console.log("   YES:", hre.ethers.utils.formatUnits(balanceYes, 6));
  console.log("   NO: ", hre.ethers.utils.formatUnits(balanceNo, 6));

  // ========== 步骤 4: 铸造 Outcome Tokens (如果需要) ==========
  if (balanceYes.eq(0) && balanceNo.eq(0)) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("步骤 4: 铸造 Outcome Tokens");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const splitAmount = hre.ethers.utils.parseUnits("100", 6); // 100 USDC

    console.log("💰 将铸造 100 USDC 等值的 Outcome Tokens");

    // Approve USDC to CTF
    console.log("\n1️⃣  Approve USDC 给 ConditionalTokens...");
    const allowance = await usdc.allowance(deployer.address, ctfAddress);
    
    if (allowance.lt(splitAmount)) {
      const approveTx = await usdc.approve(ctfAddress, splitAmount);
      console.log("   ⏳ 交易:", approveTx.hash);
      await approveTx.wait();
      console.log("   ✅ Approved");
    } else {
      console.log("   ✅ 已有足够授权");
    }

    // Split position
    console.log("\n2️⃣  Split Position (铸造 Tokens)...");
    const partition = [1, 2]; // [YES, NO]
    
    try {
      const splitTx = await ctf.splitPosition(
        mockUsdcAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000000", // parentCollectionId
        market.conditionId,
        partition,
        splitAmount,
        {
          gasLimit: 500000
        }
      );

      console.log("   ⏳ 交易:", splitTx.hash);
      await splitTx.wait();
      console.log("   ✅ Tokens 铸造成功！");

      // 重新检查余额
      const newBalanceYes = await ctf.balanceOf(deployer.address, positionIdYes);
      const newBalanceNo = await ctf.balanceOf(deployer.address, positionIdNo);

      console.log("\n新 Token 余额:");
      console.log("   YES:", hre.ethers.utils.formatUnits(newBalanceYes, 6));
      console.log("   NO: ", hre.ethers.utils.formatUnits(newBalanceNo, 6));

    } catch (error) {
      console.error("   ❌ 铸造失败:", error.message);
      return;
    }
  } else {
    console.log("\n✅ 已有 Outcome Tokens，跳过铸造");
  }

  // ========== 步骤 5: 授权 CTFExchange ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("步骤 5: 授权 CTFExchange");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const isApproved = await ctf.isApprovedForAll(deployer.address, exchangeAddress);

  if (!isApproved) {
    console.log("设置 ApprovalForAll...");
    const approvalTx = await ctf.setApprovalForAll(exchangeAddress, true);
    console.log("   ⏳ 交易:", approvalTx.hash);
    await approvalTx.wait();
    console.log("   ✅ 已授权");
  } else {
    console.log("✅ CTFExchange 已有授权");
  }

  // ========== 总结 ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 测试准备完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 测试数据:");
  console.log("   Condition ID:", market.conditionId);
  console.log("   YES Token ID:", positionIdYes.toString());
  console.log("   NO Token ID:", positionIdNo.toString());

  console.log("\n🎯 下一步:");
  console.log("   1. 访问交易页面:");
  console.log(`      http://localhost:3000/trade/${market.conditionId}`);
  console.log();
  console.log("   2. 在页面上:");
  console.log("      - 查看 Token 余额");
  console.log("      - 创建买单/卖单");
  console.log("      - 查看订单薄");
  console.log();
  console.log("   3. 或继续使用脚本:");
  console.log("      npx hardhat run scripts/create-test-orders.js --network amoy");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

