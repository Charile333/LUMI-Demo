/**
 * 简单测试Amoy RPC
 */
const https = require('https');
const { URL } = require('url');
const { HttpsProxyAgent } = require('https-proxy-agent');

const PROXY = "http://127.0.0.1:7890";

const AMOY_RPC_URLS = [
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy.g.alchemy.com/v2/demo",
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy-bor-rpc.publicnode.com"
];

function testRPC(rpcUrl) {
  return new Promise((resolve) => {
    try {
      const url = new URL(rpcUrl);
      const postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1
      });
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        agent: new HttpsProxyAgent(PROXY)
      };
      
      console.log(`\n🔍 测试: ${rpcUrl}`);
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.result) {
              const chainId = parseInt(response.result, 16);
              console.log(`   ✅ 成功！Chain ID: ${chainId}`);
              if (chainId === 80002) {
                console.log(`   ✅ 确认：Polygon Amoy测试网`);
                resolve({ success: true, url: rpcUrl });
              } else {
                console.log(`   ⚠️  Chain ID不匹配`);
                resolve({ success: false });
              }
            } else {
              console.log(`   ❌ 响应错误:`, response.error || 'Unknown');
              resolve({ success: false });
            }
          } catch (e) {
            console.log(`   ❌ 解析失败:`, e.message);
            resolve({ success: false });
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ 连接失败:`, error.message);
        resolve({ success: false });
      });
      
      req.setTimeout(10000, () => {
        console.log(`   ❌ 超时`);
        req.destroy();
        resolve({ success: false });
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.log(`   ❌ 错误:`, error.message);
      resolve({ success: false });
    }
  });
}

async function main() {
  console.log("🌐 测试Polygon Amoy测试网RPC\n");
  console.log(`🔌 代理: ${PROXY}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  for (const rpcUrl of AMOY_RPC_URLS) {
    const result = await testRPC(rpcUrl);
    
    if (result.success) {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n✅ 找到可用的Amoy RPC！\n");
      console.log("📝 添加到 .env.local:");
      console.log(`AMOY_RPC_URL=${result.url}\n`);
      console.log("🚀 运行部署:");
      console.log(`$env:HTTPS_PROXY="${PROXY}"; npx hardhat run scripts/deploy-to-amoy.js --network amoy\n`);
      return true;
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n❌ 所有Amoy RPC都不可用\n");
  console.log("这意味着：");
  console.log("1. Amoy测试网可能还不够稳定");
  console.log("2. 或者网络环境限制\n");
  console.log("💡 强烈建议：切换到本地开发");
  console.log("   更稳定、更快速、功能完全一样\n");
  console.log("运行: npx hardhat run scripts/test-uma-integration.js\n");
  
  return false;
}

main().then(success => process.exit(success ? 0 : 1));










