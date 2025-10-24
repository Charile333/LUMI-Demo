const hre = require("hardhat");

/**
 * 部署 CTFExchange 合约
 * 基于 Polymarket 架构的订单簿交易所
 */
async function main() {
  console.log("\n🚀 部署 CTF Exchange 合约");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 账户余额:", hre.ethers.utils.formatEther(balance), "POL\n");

  if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
    console.log("⚠️  余额不足！建议至少有 0.1 POL");
    console.log("📝 请访问水龙头获取测试币：");
    console.log("   https://faucet.polygon.technology/\n");
    return;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 读取现有部署信息
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments/amoy-real-uma.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ 未找到部署文件：deployments/amoy-real-uma.json");
    console.log("请先部署 RealUmaCTFAdapter");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const ctfAddress = deployment.contracts.conditionalTokens.address;

  console.log("📝 使用现有的 ConditionalTokens 合约");
  console.log("   地址:", ctfAddress, "\n");

  // 配置参数
  const COLLATERAL_TOKEN = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"; // Amoy USDC
  const FEE_RECIPIENT = deployer.address; // 手续费接收地址（可修改）

  console.log("📝 步骤 1: 部署 CTFExchange 合约...\n");
  console.log("   CTF 地址:", ctfAddress);
  console.log("   Collateral (USDC):", COLLATERAL_TOKEN);
  console.log("   手续费接收:", FEE_RECIPIENT, "\n");

  // 部署 CTFExchange
  const CTFExchange = await hre.ethers.getContractFactory("CTFExchange");
  const exchange = await CTFExchange.deploy(
    ctfAddress,
    COLLATERAL_TOKEN,
    FEE_RECIPIENT
  );

  await exchange.deployed();
  console.log("   ✅ CTFExchange 已部署");
  console.log("   📍 地址:", exchange.address);
  console.log("   🔗 查看: https://amoy.polygonscan.com/address/" + exchange.address, "\n");

  // 等待区块确认
  console.log("   ⏳ 等待区块确认...");
  await exchange.deployTransaction.wait(2);
  console.log("   ✅ 已确认\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 保存部署信息
  console.log("📝 步骤 2: 保存部署信息...\n");

  const exchangeDeployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "ctf-exchange-v1",
    contracts: {
      conditionalTokens: {
        address: ctfAddress,
        version: "standard"
      },
      ctfExchange: {
        address: exchange.address,
        deployTx: exchange.deployTransaction.hash,
        blockNumber: exchange.deployTransaction.blockNumber,
        version: "1.0"
      },
      collateral: {
        address: COLLATERAL_TOKEN,
        symbol: "USDC",
        decimals: 6
      }
    },
    config: {
      feeRecipient: FEE_RECIPIENT,
      paused: false
    },
    timestamp: new Date().toISOString(),
    balance: hre.ethers.utils.formatEther(balance) + " POL",
    note: "基于 Polymarket 架构的 CTF 订单簿交易所"
  };

  const exchangeDeploymentPath = path.join(__dirname, '../deployments/amoy-exchange.json');
  fs.writeFileSync(
    exchangeDeploymentPath,
    JSON.stringify(exchangeDeployment, null, 2)
  );
  console.log("   ✅ 部署信息已保存到:", exchangeDeploymentPath, "\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 部署摘要
  console.log("🎉 部署完成！\n");
  console.log("📋 部署摘要:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("   ConditionalTokens:");
  console.log("     地址:", ctfAddress, "\n");
  console.log("   CTFExchange:");
  console.log("     地址:", exchange.address);
  console.log("     所有者:", deployer.address, "\n");
  console.log("   Collateral Token (USDC):");
  console.log("     地址:", COLLATERAL_TOKEN, "\n");
  console.log("   配置:");
  console.log("     手续费接收:", FEE_RECIPIENT);
  console.log("     状态: 活跃");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✨ 订单簿交易所功能:\n");
  console.log("   ✅ EIP-712 签名订单");
  console.log("   ✅ 链下订单匹配");
  console.log("   ✅ 链上最终结算");
  console.log("   ✅ 批量填充订单");
  console.log("   ✅ 订单取消");
  console.log("   ✅ 手续费系统");
  console.log("   ✅ 重入保护");

  console.log("\n📖 下一步:\n");
  console.log("   1. 集成 Polymarket CLOB API");
  console.log("   2. 实现前端交易界面");
  console.log("   3. 创建订单簿组件");
  console.log("   4. 测试完整交易流程");

  console.log("\n⚠️  重要提示:\n");
  console.log("   • 用户需要 approve CTFExchange 才能交易");
  console.log("   • Approve CTF 代币（ERC1155）");
  console.log("   • Approve Collateral 代币（USDC）");
  console.log("   • 订单在链下签名和匹配");
  console.log("   • 仅最终结算在链上执行");

  console.log("\n🔧 配置提示:\n");
  console.log("   • 手续费率在订单中设置（基点）");
  console.log("   • 默认手续费接收地址:", FEE_RECIPIENT);
  console.log("   • 可通过 setFeeRecipient() 修改");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

