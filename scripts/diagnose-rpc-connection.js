#!/usr/bin/env node

/**
 * 🔍 RPC 连接诊断工具
 * 诊断为什么 RPC 连接失败并提供解决方案
 */

const { ethers } = require('ethers');
const https = require('https');
const http = require('http');

const RPC_ENDPOINTS = [
  { name: 'Polygon Official', url: 'https://rpc-amoy.polygon.technology' },
  { name: 'Alchemy Demo', url: 'https://polygon-amoy.g.alchemy.com/v2/demo' },
  { name: 'dRPC', url: 'https://polygon-amoy.drpc.org' },
  { name: 'PublicNode', url: 'https://polygon-amoy-bor-rpc.publicnode.com' },
  { name: 'Ankr', url: 'https://rpc.ankr.com/polygon_amoy' },
  { name: 'BlastAPI', url: 'https://polygon-amoy.public.blastapi.io' },
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 测试基础网络连通性
 */
async function testBasicConnectivity(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      resolve({
        success: true,
        statusCode: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout (5s)'
      });
    });
  });
}

/**
 * 测试 RPC 调用
 */
async function testRPCCall(url, timeout = 10000) {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(
      { url, timeout },
      { name: 'polygon-amoy', chainId: 80002 }
    );
    
    const startTime = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      blockNumber,
      latency
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || error.code || '未知错误',
      errorCode: error.code
    };
  }
}

/**
 * 诊断单个 RPC 端点
 */
async function diagnoseRPC(rpcInfo) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`测试: ${rpcInfo.name}`, 'cyan');
  log(`URL: ${rpcInfo.url}`, 'blue');
  log('='.repeat(60), 'cyan');
  
  // 1. 基础网络连通性
  log('\n1️⃣ 测试基础网络连通性...', 'yellow');
  const basicTest = await testBasicConnectivity(rpcInfo.url);
  
  if (basicTest.success) {
    log(`✅ 网络连接成功 (HTTP ${basicTest.statusCode})`, 'green');
  } else {
    log(`❌ 网络连接失败: ${basicTest.error}`, 'red');
    log('   可能原因:', 'yellow');
    log('   - 网络防火墙阻止', 'yellow');
    log('   - 需要代理访问', 'yellow');
    log('   - RPC 服务暂时不可用', 'yellow');
    return { success: false, stage: 'network' };
  }
  
  // 2. RPC 调用测试
  log('\n2️⃣ 测试 RPC 调用...', 'yellow');
  const rpcTest = await testRPCCall(rpcInfo.url);
  
  if (rpcTest.success) {
    log(`✅ RPC 调用成功`, 'green');
    log(`   区块高度: ${rpcTest.blockNumber}`, 'green');
    log(`   响应延迟: ${rpcTest.latency}ms`, 'green');
    
    // 评估延迟
    if (rpcTest.latency < 1000) {
      log(`   评价: 🚀 极快`, 'green');
    } else if (rpcTest.latency < 3000) {
      log(`   评价: ✅ 良好`, 'green');
    } else if (rpcTest.latency < 5000) {
      log(`   评价: ⚠️ 较慢`, 'yellow');
    } else {
      log(`   评价: 🐌 很慢`, 'red');
    }
    
    return { success: true, latency: rpcTest.latency };
  } else {
    log(`❌ RPC 调用失败: ${rpcTest.error}`, 'red');
    
    // 根据错误类型给出建议
    if (rpcTest.errorCode === 'TIMEOUT' || rpcTest.error.includes('timeout')) {
      log('   原因: 连接超时', 'yellow');
      log('   建议: 增加超时时间或使用其他端点', 'yellow');
    } else if (rpcTest.error.includes('missing response')) {
      log('   原因: 服务器无响应', 'yellow');
      log('   建议: 该端点可能暂时不可用，尝试其他端点', 'yellow');
    } else if (rpcTest.error.includes('network')) {
      log('   原因: 网络错误', 'yellow');
      log('   建议: 检查网络连接或防火墙设置', 'yellow');
    }
    
    return { success: false, stage: 'rpc' };
  }
}

/**
 * 主函数
 */
async function main() {
  log('\n🔍 RPC 连接诊断工具', 'cyan');
  log('正在诊断 Polygon Amoy 测试网 RPC 连接...\n', 'cyan');
  
  const results = [];
  
  for (const rpc of RPC_ENDPOINTS) {
    const result = await diagnoseRPC(rpc);
    results.push({
      ...rpc,
      ...result
    });
    
    // 每次测试间隔1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 总结报告
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 诊断总结', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  log(`\n总计测试: ${results.length} 个端点`, 'blue');
  log(`✅ 成功: ${successful.length} 个`, 'green');
  log(`❌ 失败: ${failed.length} 个`, 'red');
  
  if (successful.length > 0) {
    log('\n✅ 可用的 RPC 端点:', 'green');
    successful
      .sort((a, b) => a.latency - b.latency)
      .forEach(r => {
        log(`   ${r.name}: ${r.url} (${r.latency}ms)`, 'green');
      });
    
    const fastest = successful[0];
    log(`\n🚀 推荐使用最快的端点:`, 'cyan');
    log(`   ${fastest.url}`, 'green');
    log(`\n📝 在 .env.local 中设置:`, 'yellow');
    log(`   NEXT_PUBLIC_RPC_URL=${fastest.url}`, 'blue');
  }
  
  if (failed.length > 0) {
    log('\n❌ 失败的端点:', 'red');
    failed.forEach(r => {
      log(`   ${r.name}: ${r.url}`, 'red');
    });
  }
  
  // 给出建议
  if (failed.length === results.length) {
    log('\n⚠️ 所有 RPC 端点均连接失败！', 'red');
    log('\n可能的原因和解决方案:', 'yellow');
    log('1. 网络问题:', 'yellow');
    log('   - 检查互联网连接', 'yellow');
    log('   - 尝试关闭 VPN/代理', 'yellow');
    log('   - 检查防火墙设置', 'yellow');
    log('2. 地区限制:', 'yellow');
    log('   - 某些地区可能无法访问公共 RPC', 'yellow');
    log('   - 建议使用 Alchemy 或 Infura 的私有端点', 'yellow');
    log('3. 服务中断:', 'yellow');
    log('   - 所有公共 RPC 可能暂时不可用', 'yellow');
    log('   - 稍后重试', 'yellow');
    log('\n💡 推荐解决方案:', 'cyan');
    log('注册 Alchemy 免费账号获取专属 RPC:', 'cyan');
    log('https://www.alchemy.com/ (每月 3亿 requests 免费)', 'blue');
  } else if (successful.length > 0) {
    log('\n✅ 诊断完成！部分 RPC 端点可用。', 'green');
    log('建议使用响应最快的端点以获得最佳性能。', 'green');
  }
  
  log('\n');
}

// 运行诊断
main().catch(error => {
  log(`\n❌ 诊断过程出错: ${error.message}`, 'red');
  process.exit(1);
});






