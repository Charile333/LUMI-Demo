/**
 * 测试Polygon Amoy公共RPC节点
 */
const { ethers } = require("ethers");
const { HttpsProxyAgent } = require('https-proxy-agent');

const PROXY = "http://127.0.0.1:7890";

const AMOY_RPC_URLS = [
  {
    name: "Polygon官方RPC",
    url: "https://rpc-amoy.polygon.technology"
  },
  {
    name: "Alchemy公共RPC",
    url: "https://polygon-amoy.g.alchemy.com/v2/demo"
  },
  {
    name: "Ankr",
    url: "https://rpc.ankr.com/polygon_amoy"
  },
  {
    name: "Chainstack",
    url: "https://polygon-amoy-bor-rpc.publicnode.com"
  },
  {
    name: "BlockPi",
    url: "https://polygon-amoy.blockpi.network/v1/rpc/public"
  }
];

async function testRPC(rpcConfig) {
  try {
    console.log(`\n🔍 测试: ${rpcConfig.name}`);
    console.log(`   URL: ${rpcConfig.url}`);
    
    // 使用代理
    const fetchRequest = new ethers.utils.FetchRequest(rpcConfig.url);
    fetchRequest.getUrlFunc = ethers.utils.FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(PROXY) });
    
    const provider = new ethers.providers.JsonRpcProvider(fetchRequest);
    
    // 设置超时
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('超时')), 15000)
    );
    
    // 测试连接
    const network = await Promise.race([
      provider.getNetwork(),
      timeoutPromise
    ]);
    
    console.log(`   ✅ 连接成功！Chain ID: ${network.chainId}`);
    
    if (network.chainId === 80002) {
      console.log(`   ✅ 确认：Polygon Amoy测试网`);
      
      // 测试获取区块
      const blockNumber = await provider.getBlockNumber();
      console.log(`   ✅ 最新区块: ${blockNumber}`);
      
      // 测试Gas价格
      const gasPrice = await provider.getGasPrice();
      console.log(`   ✅ Gas价格: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
      
      return { success: true, ...rpcConfig };
    } else {
      console.log(`   ⚠️  Chain ID不匹配: ${network.chainId} (期望: 80002)`);
      return { success: false, ...rpcConfig };
    }
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return { success: false, ...rpcConfig };
  }
}

async function main() {
  console.log("🌐 测试Polygon Amoy测试网RPC连接\n");
  console.log(`🔌 使用代理: ${PROXY}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const results = [];
  
  for (const rpc of AMOY_RPC_URLS) {
    const result = await testRPC(rpc);
    results.push(result);
    
    if (result.success) {
      console.log("\n✅ 找到可用的Amoy RPC！");
      break;
    }
    
    // 延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const working = results.find(r => r.success);
  
  if (working) {
    console.log("\n✅ 推荐使用的RPC:");
    console.log(`   ${working.name}: ${working.url}\n`);
    
    console.log("📝 配置到 .env.local:");
    console.log(`AMOY_RPC_URL=${working.url}\n`);
    
    console.log("🚀 部署命令:");
    console.log(`$env:HTTPS_PROXY="${PROXY}"; npx hardhat run scripts/deploy-to-amoy.js --network amoy\n`);
    
    return true;
  } else {
    console.log("\n❌ 所有Amoy RPC都不可用\n");
    console.log("可能的原因:");
    console.log("1. Amoy测试网刚推出，公共RPC还不稳定");
    console.log("2. 网络连接问题");
    console.log("3. 代理配置问题\n");
    
    console.log("💡 建议:");
    console.log("1. 使用本地开发（最稳定）");
    console.log("2. 等待几天后Amoy更稳定");
    console.log("3. 或直接准备主网部署\n");
    
    return false;
  }
}

main()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });










