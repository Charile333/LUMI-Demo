const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🚀 部署测试版 UMA-CTF Adapter (使用 Mock Oracle)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署者:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 POL 余额:", hre.ethers.utils.formatEther(balance), "POL\n");

  // 读取现有的 ConditionalTokens 地址
  const umaDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/amoy-real-uma.json'), 'utf8')
  );

  const ctfAddress = umaDeployment.contracts.conditionalTokens.address;
  console.log("♻️  使用现有的 ConditionalTokens:", ctfAddress);

  // 1. 部署 MockOptimisticOracle
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  部署 Mock Oracle");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const MockOracle = await hre.ethers.getContractFactory("MockOptimisticOracle");
  const mockOracle = await MockOracle.deploy();
  await mockOracle.deployed();

  console.log("✅ Mock Oracle 已部署:", mockOracle.address);
  console.log("   📝 交易:", mockOracle.deployTransaction.hash);

  // 2. 部署 TestUmaCTFAdapter
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  部署 Test UMA-CTF Adapter");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const TestAdapter = await hre.ethers.getContractFactory("TestUmaCTFAdapter");
  const testAdapter = await TestAdapter.deploy(
    ctfAddress,
    mockOracle.address
  );
  await testAdapter.deployed();

  console.log("✅ Test Adapter 已部署:", testAdapter.address);
  console.log("   📝 交易:", testAdapter.deployTransaction.hash);

  // 3. 保存部署信息
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  保存部署信息");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const finalBalance = await deployer.getBalance();
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "test-uma-mock",
    contracts: {
      conditionalTokens: {
        address: ctfAddress,
        version: "standard"
      },
      testUmaCTFAdapter: {
        address: testAdapter.address,
        deployTx: testAdapter.deployTransaction.hash,
        blockNumber: testAdapter.deployTransaction.blockNumber,
        version: "test-with-mock-oracle"
      },
      mockOptimisticOracle: {
        address: mockOracle.address,
        deployTx: mockOracle.deployTransaction.hash,
        blockNumber: mockOracle.deployTransaction.blockNumber,
        version: "mock"
      }
    },
    timestamp: new Date().toISOString(),
    balance: hre.ethers.utils.formatEther(finalBalance) + " POL",
    note: "测试版 - 使用 Mock Oracle，支持任意 ERC20 代币作为奖励"
  };

  const deploymentPath = path.join(__dirname, '../deployments/amoy-test-uma.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  console.log("✅ 部署信息已保存到:", deploymentPath);

  // 4. 总结
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 部署完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📋 合约地址:");
  console.log("   ConditionalTokens:", ctfAddress);
  console.log("   TestUmaCTFAdapter:", testAdapter.address);
  console.log("   MockOracle:", mockOracle.address);

  console.log("\n💡 特点:");
  console.log("   ✅ 支持任意 ERC20 代币（包括 Mock USDC）");
  console.log("   ✅ 无需代币白名单");
  console.log("   ✅ 立即可用于测试");
  console.log("   ⚠️  仅用于测试，不用于生产");

  console.log("\n🎯 下一步:");
  console.log("   1. 运行测试脚本:");
  console.log("      npx hardhat run scripts/test-with-mock-oracle.js --network amoy");
  console.log();
  console.log("   2. 或在前端使用:");
  console.log("      http://localhost:3000/admin/test-market");
  console.log("      (需要更新配置文件)");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

