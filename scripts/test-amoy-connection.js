/**
 * 测试 Amoy 网络连接
 * 尝试多个 RPC 端点
 */

const { ethers } = require("hardhat");

const AMOY_RPCS = [
  {
    name: "Polygon Official",
    url: "https://rpc-amoy.polygon.technology"
  },
  {
    name: "Alchemy (需要 API key)",
    url: "https://polygon-amoy.g.alchemy.com/v2/demo"
  },
  {
    name: "Ankr Public",
    url: "https://rpc.ankr.com/polygon_amoy"
  },
  {
    name: "BlockPI",
    url: "https://polygon-amoy.blockpi.network/v1/rpc/public"
  },
  {
    name: "Chainstack",
    url: "https://polygon-amoy-bor-rpc.publicnode.com"
  }
];

async function testRPC(rpcConfig) {
  console.log(`\n🔍 测试: ${rpcConfig.name}`);
  console.log(`   URL: ${rpcConfig.url}`);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcConfig.url);
    
    // 设置超时
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    // 尝试获取网络信息
    const networkPromise = provider.getNetwork();
    const network = await Promise.race([networkPromise, timeout]);
    
    console.log(`   ✅ 连接成功!`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Network: ${network.name}`);
    
    // 尝试获取最新区块
    const blockNumber = await provider.getBlockNumber();
    console.log(`   最新区块: ${blockNumber}`);
    
    // 尝试获取 Gas 价格
    const gasPrice = await provider.getGasPrice();
    console.log(`   Gas 价格: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
    
    return {
      success: true,
      ...rpcConfig,
      chainId: network.chainId,
      blockNumber,
      gasPrice: gasPrice.toString()
    };
    
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return {
      success: false,
      ...rpcConfig,
      error: error.message
    };
  }
}

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🌐 Polygon Amoy 测试网连接诊断");
  console.log("=".repeat(70));
  
  console.log("\n测试 RPC 端点...");
  
  const results = [];
  
  for (const rpc of AMOY_RPCS) {
    const result = await testRPC(rpc);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }
  
  // 总结
  console.log("\n" + "=".repeat(70));
  console.log("📊 测试结果总结");
  console.log("=".repeat(70));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ 可用 RPC (${successful.length}/${results.length}):`);
  successful.forEach(r => {
    console.log(`\n  ${r.name}`);
    console.log(`  URL: ${r.url}`);
    console.log(`  区块: ${r.blockNumber}`);
  });
  
  if (failed.length > 0) {
    console.log(`\n❌ 不可用 RPC (${failed.length}/${results.length}):`);
    failed.forEach(r => {
      console.log(`\n  ${r.name}`);
      console.log(`  原因: ${r.error}`);
    });
  }
  
  // 推荐配置
  if (successful.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("💡 推荐配置");
    console.log("=".repeat(70));
    
    const best = successful[0];
    console.log(`\n将 hardhat.config.js 中的 Amoy RPC 改为:\n`);
    console.log(`amoy: {`);
    console.log(`  url: "${best.url}",`);
    console.log(`  chainId: 80002,`);
    console.log(`  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],`);
    console.log(`  gasPrice: 30000000000,`);
    console.log(`  timeout: 120000  // 增加超时时间到 120 秒`);
    console.log(`},\n`);
    
    console.log("或者在 .env.local 中设置:\n");
    console.log(`AMOY_RPC_URL="${best.url}"`);
  } else {
    console.log("\n⚠️  所有 RPC 都无法连接！");
    console.log("\n可能的原因:");
    console.log("  1. 网络防火墙/代理问题");
    console.log("  2. Amoy 测试网暂时维护");
    console.log("  3. 本地网络问题");
    console.log("\n建议:");
    console.log("  1. 检查网络连接");
    console.log("  2. 尝试使用 VPN");
    console.log("  3. 稍后重试");
    console.log("  4. 考虑使用其他测试网 (BSC Testnet)");
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  });

