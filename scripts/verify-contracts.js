/**
 * 验证合约部署状态
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

const CONTRACTS = {
  ctf: "0xeB4F3700FE422c1618B449763d423687D5ad0950",
  adapter: "0x5D440c98B55000087a8b0C164f1690551d18CfcC",
  mockOracle: "0x378fA22104E4c735680772Bf18C5195778a55b33",
  mockUSDC: "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a"
};

async function checkContract(address, name) {
  const provider = ethers.provider;
  const code = await provider.getCode(address);
  
  if (code === "0x") {
    console.log(`❌ ${name}: 没有代码 (未部署或错误地址)`);
    return false;
  } else {
    console.log(`✅ ${name}: 已部署 (代码长度: ${code.length} 字节)`);
    return true;
  }
}

async function main() {
  console.log("\n🔍 验证合约部署状态...\n");

  await checkContract(CONTRACTS.ctf, "ConditionalTokens");
  await checkContract(CONTRACTS.adapter, "TestUmaCTFAdapter");
  await checkContract(CONTRACTS.mockOracle, "MockOptimisticOracle");
  await checkContract(CONTRACTS.mockUSDC, "MockUSDC");

  // 尝试读取 Adapter 的 owner
  console.log("\n尝试调用 TestUmaCTFAdapter...");
  try {
    const adapter = new ethers.Contract(
      CONTRACTS.adapter,
      ["function owner() view returns (address)"],
      ethers.provider
    );
    const owner = await adapter.owner();
    console.log("✅ owner():", owner);
  } catch (error) {
    console.log("❌ owner() 调用失败:", error.message);
  }

  // 尝试读取市场数量
  console.log("\n尝试调用 getMarketCount()...");
  try {
    const adapter = new ethers.Contract(
      CONTRACTS.adapter,
      ["function getMarketCount() view returns (uint256)"],
      ethers.provider
    );
    const count = await adapter.getMarketCount();
    console.log("✅ getMarketCount():", count.toString());
  } catch (error) {
    console.log("❌ getMarketCount() 调用失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

