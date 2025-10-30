/**
 * 🔄 切换到 Polymarket 官方 CTF Exchange
 */

const fs = require('fs');
const path = require('path');

// Polymarket 官方 CTF Exchange（Amoy 测试网）
const OFFICIAL_CTF_EXCHANGE = "0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40";

// 当前使用的地址
const CURRENT_CTF_EXCHANGE = "0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d";

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log('\n🔄 切换到 Polymarket 官方 CTF Exchange\n', 'cyan');
  
  // 更新 lib/blockchainService.ts
  log('1/3: 更新 lib/blockchainService.ts', 'yellow');
  updateFile(
    path.join(__dirname, '..', 'lib', 'blockchainService.ts'),
    CURRENT_CTF_EXCHANGE,
    OFFICIAL_CTF_EXCHANGE
  );
  log('   ✅ 已更新\n', 'green');
  
  // 更新 lib/providers/blockchain.ts
  log('2/3: 更新 lib/providers/blockchain.ts', 'yellow');
  updateFile(
    path.join(__dirname, '..', 'lib', 'providers', 'blockchain.ts'),
    CURRENT_CTF_EXCHANGE,
    OFFICIAL_CTF_EXCHANGE
  );
  log('   ✅ 已更新\n', 'green');
  
  // 更新 lib/market-activation/blockchain-activator.ts
  log('3/3: 更新 lib/market-activation/blockchain-activator.ts', 'yellow');
  updateFile(
    path.join(__dirname, '..', 'lib', 'market-activation', 'blockchain-activator.ts'),
    CURRENT_CTF_EXCHANGE,
    OFFICIAL_CTF_EXCHANGE
  );
  log('   ✅ 已更新\n', 'green');
  
  // 更新部署配置
  log('更新部署配置文件...', 'yellow');
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy-complete-polymarket.json');
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  deployment.contracts.ctfExchange = {
    address: OFFICIAL_CTF_EXCHANGE,
    type: "Polymarket Official",
    official: true,
    note: "Using Polymarket official deployment"
  };
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  log('   ✅ 已更新\n', 'green');
  
  log('🎉 切换完成！\n', 'green');
  log('📋 对比:\n', 'cyan');
  log(`   旧地址 (自定义): ${CURRENT_CTF_EXCHANGE}`, 'yellow');
  log(`   新地址 (官方):   ${OFFICIAL_CTF_EXCHANGE}`, 'green');
  log('\n🔗 查看官方合约:', 'cyan');
  log(`   https://amoy.polygonscan.com/address/${OFFICIAL_CTF_EXCHANGE}\n`, 'cyan');
  log('🔧 下一步:', 'yellow');
  log('   1. 重启开发服务器: npm run dev', 'cyan');
  log('   2. 测试交易功能\n', 'cyan');
}

function updateFile(filePath, oldAddress, newAddress) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(new RegExp(oldAddress, 'g'), newAddress);
  fs.writeFileSync(filePath, content, 'utf8');
}

main();

