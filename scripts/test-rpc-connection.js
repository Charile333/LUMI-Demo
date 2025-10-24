/**
 * 测试不同的Mumbai RPC节点连接
 */
const { ethers } = require("ethers");

const RPC_URLS = [
  {
    name: "Alchemy Public",
    url: "https://polygon-mumbai.g.alchemy.com/v2/demo"
  },
  {
    name: "Polygon公共RPC",
    url: "https://rpc-mumbai.polygon.technology"
  },
  {
    name: "MaticVigil",
    url: "https://rpc-mumbai.maticvigil.com"
  },
  {
    name: "Ankr",
    url: "https://rpc.ankr.com/polygon_mumbai"
  },
  {
    name: "Chainstack",
    url: "https://polygon-mumbai-bor.publicnode.com"
  }
];

async function testRPC(rpcUrl, name) {
  try {
    console.log(`\n🔍 测试: ${name}`);
    console.log(`   URL: ${rpcUrl}`);
    
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // 测试获取链ID
    const network = await provider.getNetwork();
    console.log(`   ✅ 连接成功！Chain ID: ${network.chainId}`);
    
    // 测试获取最新区块
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ 最新区块: ${blockNumber}`);
    
    // 测试获取Gas价格
    const gasPrice = await provider.getGasPrice();
    console.log(`   ✅ Gas价格: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🌐 测试Mumbai测试网RPC连接\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const results = [];
  
  for (const rpc of RPC_URLS) {
    const success = await testRPC(rpc.url, rpc.name);
    results.push({ ...rpc, success });
    
    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 测试结果汇总:\n");
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log("✅ 可用的RPC节点:");
    working.forEach(r => {
      console.log(`   • ${r.name}: ${r.url}`);
    });
  }
  
  if (failed.length > 0) {
    console.log("\n❌ 不可用的RPC节点:");
    failed.forEach(r => {
      console.log(`   • ${r.name}`);
    });
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (working.length > 0) {
    console.log("\n💡 建议使用的RPC:");
    console.log(`\n将以下内容添加到 .env.local:`);
    console.log(`MUMBAI_RPC_URL=${working[0].url}`);
  } else {
    console.log("\n⚠️  所有RPC都不可用，可能的原因:");
    console.log("   1. 网络防火墙阻止");
    console.log("   2. 需要配置代理");
    console.log("   3. Mumbai测试网临时故障");
    console.log("\n建议:");
    console.log("   • 检查网络连接");
    console.log("   • 尝试使用VPN");
    console.log("   • 或先在本地环境继续开发前端");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });










