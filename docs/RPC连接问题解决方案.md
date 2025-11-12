// 🌐 测试 RPC 连接
// 检查哪些 RPC 端点可用

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const rpcUrls = [
  process.env.NEXT_PUBLIC_RPC_URL,
  'https://rpc-amoy.polygon.technology',
  'https://polygon-amoy.g.alchemy.com/v2/demo',
  'https://polygon-amoy.drpc.org',
  'https://polygon-amoy-bor-rpc.publicnode.com',
  'https://rpc.ankr.com/polygon_amoy',
  'https://polygon-amoy.public.blastapi.io'
].filter(Boolean);

async function testRPC(url) {
  try {
    const startTime = Date.now();
    const provider = new ethers.providers.JsonRpcProvider(url, {
      name: 'polygon-amoy',
      chainId: 80002
    });

    // 设置 10 秒超时
    const blockPromise = provider.getBlockNumber();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
    );

    const blockNumber = await Promise.race([blockPromise, timeoutPromise]);
    const latency = Date.now() - startTime;

    return {
      url,
      success: true,
      blockNumber,
      latency,
      message: `✅ 成功 (${latency}ms)`
    };
  } catch (error) {
    return {
      url,
      success: false,
      error: error.message,
      message: `❌ 失败: ${error.message}`
    };
  }
}

async function testAllRPCs() {
  console.log(`📡 测试 ${rpcUrls.length} 个 RPC 端点...\n`);

  const results = [];

  for (const url of rpcUrls) {
    console.log(`🌐 测试: ${url}`);
    const result = await testRPC(url);
    results.push(result);
    console.log(`   ${result.message}\n`);
    
    // 等待 500ms 再测试下一个
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 统计
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('='.repeat(60));
  console.log('📊 测试结果统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successful.length} 个`);
  console.log(`❌ 失败: ${failed.length} 个\n`);

  if (successful.length > 0) {
    console.log('✅ 可用的 RPC 端点：');
    successful
      .sort((a, b) => a.latency - b.latency)
      .forEach(r => {
        console.log(`   ${r.url} (${r.latency}ms)`);
      });
    console.log('');
    
    const fastest = successful.sort((a, b) => a.latency - b.latency)[0];
    console.log('💡 推荐使用（最快）：');
    console.log(`   NEXT_PUBLIC_RPC_URL=${fastest.url}\n`);
  } else {
    console.log('❌ 所有 RPC 端点都无法连接！\n');
    console.log('💡 解决方案：');
    console.log('   1. 注册 Alchemy（https://www.alchemy.com/）');
    console.log('   2. 创建 Polygon Amoy App');
    console.log('   3. 使用私有 RPC URL');
    console.log('   4. 或使用 VPN\n');
  }

  console.log('='.repeat(60) + '\n');
}

testAllRPCs().catch(console.error);

