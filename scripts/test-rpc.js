// 🔍 测试不同的 RPC 节点

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const RPC_URLS = [
  'https://rpc-amoy.polygon.technology',
  'https://polygon-amoy-bor-rpc.publicnode.com',
  'https://rpc.ankr.com/polygon_amoy',
  'https://polygon-amoy.g.alchemy.com/v2/demo',
];

async function testRPC(url) {
  try {
    console.log(`\n🔍 测试: ${url}`);
    
    const provider = new ethers.providers.JsonRpcProvider({
      url,
      timeout: 10000
    });
    
    // 设置超时
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('超时')), 10000)
    );
    
    const start = Date.now();
    
    // 测试 getNetwork
    const network = await Promise.race([provider.getNetwork(), timeout]);
    const duration = Date.now() - start;
    
    console.log(`  ✅ 网络检测成功 (${duration}ms)`);
    console.log(`  🌐 Network: ${network.name} (chainId: ${network.chainId})`);
    
    // 测试 getBlockNumber
    const blockNumber = await provider.getBlockNumber();
    console.log(`  📦 最新区块: ${blockNumber}`);
    
    return { url, success: true, duration, chainId: network.chainId };
    
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    return { url, success: false, error: error.message };
  }
}

async function main() {
  console.log('\n🔍 开始测试 Polygon Amoy RPC 节点...\n');
  
  const currentRPC = process.env.NEXT_PUBLIC_RPC_URL;
  console.log(`📍 当前配置的 RPC: ${currentRPC || '未配置'}\n`);
  
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const url of RPC_URLS) {
    const result = await testRPC(url);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果汇总:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('✅ 可用的 RPC 节点:\n');
    successful
      .sort((a, b) => a.duration - b.duration)
      .forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.url}`);
        console.log(`     速度: ${r.duration}ms, chainId: ${r.chainId}`);
      });
    
    const fastest = successful[0];
    console.log(`\n⚡ 推荐使用最快的节点:`);
    console.log(`   NEXT_PUBLIC_RPC_URL=${fastest.url}\n`);
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 不可用的节点:\n');
    failed.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.url}`);
      console.log(`     错误: ${r.error}`);
    });
  }
  
  if (successful.length === 0) {
    console.log('\n⚠️  所有 RPC 节点都不可用');
    console.log('可能的原因:');
    console.log('  1. 网络连接问题');
    console.log('  2. 防火墙阻止');
    console.log('  3. RPC 服务暂时不可用\n');
  }
}

main();













