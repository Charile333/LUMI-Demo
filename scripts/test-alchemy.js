/**
 * 测试Alchemy API连接
 */
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const { URL } = require('url');

async function testAlchemy() {
  console.log("🧪 测试Alchemy API连接\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 从环境变量读取URL
  const rpcUrl = process.env.MUMBAI_RPC_URL || process.env.NEXT_PUBLIC_MUMBAI_RPC_URL;
  
  if (!rpcUrl) {
    console.log("❌ 错误：未找到MUMBAI_RPC_URL环境变量\n");
    console.log("请检查 .env.local 文件是否包含：");
    console.log("MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY\n");
    return false;
  }
  
  console.log("📍 RPC URL:", rpcUrl.replace(/\/v2\/.*/, '/v2/***'));
  console.log("");
  
  return new Promise((resolve) => {
    try {
      const url = new URL(rpcUrl);
      
      // 准备请求数据
      const postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1
      });
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      // 如果有代理设置
      if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        console.log("🔌 使用代理:", proxy);
        
        const { HttpsProxyAgent } = require('https-proxy-agent');
        options.agent = new HttpsProxyAgent(proxy);
      }
      
      console.log("📡 发送测试请求...\n");
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.error) {
              console.log("❌ API返回错误:");
              console.log(JSON.stringify(response.error, null, 2));
              resolve(false);
            } else if (response.result) {
              const chainId = parseInt(response.result, 16);
              console.log("✅ 连接成功！");
              console.log("📊 Chain ID:", chainId);
              
              if (chainId === 80001) {
                console.log("✅ 确认：这是Polygon Mumbai测试网");
                console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                console.log("🎉 Alchemy API配置正确！可以开始部署了。\n");
                console.log("运行以下命令部署：");
                console.log("npx hardhat run scripts/deploy-to-mumbai.js --network mumbai\n");
                resolve(true);
              } else {
                console.log(`⚠️  警告：Chain ID不匹配 (期望:80001, 实际:${chainId})`);
                resolve(false);
              }
            } else {
              console.log("❌ 未知响应格式:");
              console.log(data);
              resolve(false);
            }
          } catch (error) {
            console.log("❌ 解析响应失败:", error.message);
            console.log("原始响应:", data);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log("❌ 连接失败:", error.message);
        console.log("\n可能的原因：");
        console.log("1. VPN未正确运行");
        console.log("2. 代理配置不正确");
        console.log("3. Alchemy API密钥无效");
        console.log("\n请检查：");
        console.log("• VPN是否连接");
        console.log("• 代理端口是否是7890");
        console.log("• API密钥是否正确");
        resolve(false);
      });
      
      req.setTimeout(10000, () => {
        console.log("❌ 请求超时");
        req.destroy();
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.log("❌ 错误:", error.message);
      resolve(false);
    }
  });
}

// 运行测试
testAlchemy().then(success => {
  process.exit(success ? 0 : 1);
});










