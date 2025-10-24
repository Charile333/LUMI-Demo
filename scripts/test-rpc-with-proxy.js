/**
 * 使用代理测试Mumbai RPC连接
 */
const { ethers } = require("ethers");
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const PROXY = "http://127.0.0.1:7890";

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
    name: "Ankr",
    url: "https://rpc.ankr.com/polygon_mumbai"
  }
];

async function testRPCWithProxy(rpcUrl, name) {
  try {
    console.log(`\n🔍 测试: ${name}`);
    console.log(`   URL: ${rpcUrl}`);
    console.log(`   代理: ${PROXY}`);
    
    // 创建代理agent
    const agent = new HttpsProxyAgent(PROXY);
    
    // 配置provider使用代理
    const provider = new ethers.providers.JsonRpcProvider({
      url: rpcUrl,
      fetchOptions: {
        agent: agent
      }
    });
    
    // 测试连接
    const network = await Promise.race([
      provider.getNetwork(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('超时')), 10000)
      )
    ]);
    
    console.log(`   ✅ 连接成功！Chain ID: ${network.chainId}`);
    
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ 最新区块: ${blockNumber}`);
    
    return { success: true, url: rpcUrl };
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return { success: false, url: rpcUrl };
  }
}

async function main() {
  console.log("🌐 使用代理测试Mumbai RPC连接\n");
  console.log(`🔌 代理地址: ${PROXY}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // 先检查https-proxy-agent是否安装
  try {
    require.resolve('https-proxy-agent');
  } catch (e) {
    console.log("\n⚠️  需要安装 https-proxy-agent\n");
    console.log("请运行:");
    console.log("npm install https-proxy-agent\n");
    return;
  }
  
  const results = [];
  
  for (const rpc of RPC_URLS) {
    const result = await testRPCWithProxy(rpc.url, rpc.name);
    results.push({ ...rpc, ...result });
    
    if (result.success) {
      // 找到一个可用的就停止
      console.log("\n✅ 找到可用的RPC节点！");
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const working = results.find(r => r.success);
  
  if (working) {
    console.log("\n✅ 推荐使用的RPC:");
    console.log(`   ${working.name}: ${working.url}\n`);
    console.log("现在可以部署了！");
    console.log("运行以下命令:\n");
    console.log(`$env:HTTP_PROXY="${PROXY}"; $env:HTTPS_PROXY="${PROXY}"; npx hardhat run scripts/deploy-to-mumbai.js --network mumbai`);
  } else {
    console.log("\n❌ 所有RPC都不可用");
    console.log("\n可能的原因:");
    console.log("1. 代理端口不正确（请确认是7890）");
    console.log("2. VPN未正确运行");
    console.log("3. Mumbai测试网临时故障");
    console.log("\n建议:");
    console.log("• 确认VPN正在运行");
    console.log("• 检查代理端口：7890");
    console.log("• 或者先继续本地开发");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

