// 🔍 寻找最佳 RPC 节点

const { ethers } = require('ethers');

const RPC_URLS = [
  { name: 'Polygon Official', url: 'https://rpc-amoy.polygon.technology' },
  { name: 'PublicNode', url: 'https://polygon-amoy-bor-rpc.publicnode.com' },
  { name: 'Alchemy Demo', url: 'https://polygon-amoy.g.alchemy.com/v2/demo' },
  { name: 'Ankr', url: 'https://rpc.ankr.com/polygon_amoy' },
  { name: 'Chainstack', url: 'https://polygon-amoy.public.blastapi.io' },
  { name: 'dRPC', url: 'https://polygon-amoy.drpc.org' },
];

async function testRPC(rpcInfo, testCount = 3) {
  const results = [];
  
  for (let i = 0; i < testCount; i++) {
    try {
      const provider = new ethers.providers.JsonRpcProvider({
        url: rpcInfo.url,
        timeout: 15000
      }, {
        name: 'polygon-amoy',
        chainId: 80002
      });
      
      const start = Date.now();
      await provider.getBlockNumber();
      const duration = Date.now() - start;
      
      results.push({ success: true, duration });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({ success: false, error: error.code || error.message });
    }
  }
  
  return results;
}

async function main() {
  console.log('\n🔍 测试所有可用的 Polygon Amoy RPC 节点...\n');
  console.log('每个节点测试 3 次，计算平均速度和稳定性\n');
  console.log('='.repeat(70));
  
  const allResults = [];
  
  for (const rpcInfo of RPC_URLS) {
    console.log(`\n🌐 测试: ${rpcInfo.name}`);
    console.log(`   URL: ${rpcInfo.url}`);
    
    const results = await testRPC(rpcInfo);
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    
    if (successes.length > 0) {
      const avgDuration = Math.round(
        successes.reduce((sum, r) => sum + r.duration, 0) / successes.length
      );
      const successRate = Math.round((successes.length / results.length) * 100);
      
      console.log(`   ✅ 成功率: ${successRate}% (${successes.length}/${results.length})`);
      console.log(`   ⚡ 平均速度: ${avgDuration}ms`);
      
      allResults.push({
        ...rpcInfo,
        successRate,
        avgDuration,
        successes: successes.length,
        failures: failures.length
      });
    } else {
      console.log(`   ❌ 全部失败`);
      if (failures[0]) {
        console.log(`   错误: ${failures[0].error}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 测试结果排名:\n');
  
  if (allResults.length === 0) {
    console.log('❌ 所有 RPC 节点都不可用！');
    console.log('\n可能的原因:');
    console.log('  1. 网络连接问题');
    console.log('  2. 防火墙阻止');
    console.log('  3. Polygon Amoy 测试网维护中\n');
    console.log('建议:');
    console.log('  1. 检查网络连接');
    console.log('  2. 尝试使用 VPN');
    console.log('  3. 注册 Alchemy 或 Infura 获取专用 RPC\n');
    return;
  }
  
  // 按成功率和速度排序
  allResults.sort((a, b) => {
    if (a.successRate !== b.successRate) {
      return b.successRate - a.successRate;
    }
    return a.avgDuration - b.avgDuration;
  });
  
  allResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   成功率: ${result.successRate}%, 平均速度: ${result.avgDuration}ms`);
    console.log(`   URL: ${result.url}`);
    console.log();
  });
  
  const best = allResults[0];
  console.log('='.repeat(70));
  console.log('\n⚡ 推荐使用:\n');
  console.log(`   名称: ${best.name}`);
  console.log(`   URL: ${best.url}`);
  console.log(`   成功率: ${best.successRate}%`);
  console.log(`   平均速度: ${best.avgDuration}ms\n`);
  console.log('📝 配置方法:\n');
  console.log('   在 .env.local 中设置:');
  console.log(`   NEXT_PUBLIC_RPC_URL=${best.url}\n`);
}

main().catch(console.error);










