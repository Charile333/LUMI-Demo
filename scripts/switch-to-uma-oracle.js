/**
 * 🔄 自动切换到UMA官方预言机
 * 
 * 此脚本会自动更新所有配置文件中的合约地址
 * 从 MockOptimisticOracle 切换到 RealUmaCTFAdapter (使用UMA官方预言机)
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// UMA官方预言机地址（Polygon Amoy测试网）
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a";

async function main() {
  log('\n🔄 切换到Polymarket官方UMA预言机\n', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  // 1. 读取部署配置
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy-real-uma.json');
  
  if (!fs.existsSync(deploymentPath)) {
    log('❌ 错误: 未找到 RealUmaCTFAdapter 部署配置', 'red');
    log('\n请先运行部署脚本:', 'yellow');
    log('npx hardhat run scripts/deploy-real-uma-adapter.js --network amoy\n', 'cyan');
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  log('📋 读取部署配置:', 'green');
  log(`   ConditionalTokens: ${deployment.contracts.conditionalTokens.address}`, 'cyan');
  log(`   RealUmaCTFAdapter: ${deployment.contracts.realUmaCTFAdapter.address}`, 'cyan');
  log(`   UMA Oracle:        ${deployment.contracts.umaOptimisticOracle.address}\n`, 'cyan');
  
  const config = {
    conditionalTokens: deployment.contracts.conditionalTokens.address,
    realAdapter: deployment.contracts.realUmaCTFAdapter.address,
    umaOracle: deployment.contracts.umaOptimisticOracle.address
  };
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  // 2. 更新 lib/blockchainService.ts
  log('📝 步骤 1/3: 更新 lib/blockchainService.ts...', 'yellow');
  updateBlockchainService(config);
  log('   ✅ 已更新\n', 'green');
  
  // 3. 更新 lib/providers/blockchain.ts
  log('📝 步骤 2/3: 更新 lib/providers/blockchain.ts...', 'yellow');
  updateBlockchainProvider(config);
  log('   ✅ 已更新\n', 'green');
  
  // 4. 更新 lib/market-activation/blockchain-activator.ts
  log('📝 步骤 3/3: 更新 lib/market-activation/blockchain-activator.ts...', 'yellow');
  updateBlockchainActivator(config);
  log('   ✅ 已更新\n', 'green');
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  // 5. 创建备份记录
  const backupInfo = {
    timestamp: new Date().toISOString(),
    previousConfig: {
      testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
      oracle: '0x378fA22104E4c735680772Bf18C5195778a55b33'
    },
    newConfig: config,
    note: 'Switched from MockOptimisticOracle to Real UMA Oracle V2 (Polymarket official)'
  };
  
  const backupPath = path.join(__dirname, '..', 'deployments', 'oracle-switch-backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupInfo, null, 2));
  
  log('🎉 切换完成！\n', 'green');
  log('✨ 您现在使用的是 Polymarket 官方的 UMA 预言机！\n', 'bright');
  
  log('📊 对比:', 'yellow');
  log('   旧配置 (Mock):', 'cyan');
  log(`     Adapter: 0x5D440c98B55000087a8b0C164f1690551d18CfcC`, 'cyan');
  log(`     Oracle:  0x378fA22104E4c735680772Bf18C5195778a55b33 (Mock)\n`, 'cyan');
  
  log('   新配置 (UMA官方):', 'green');
  log(`     Adapter: ${config.realAdapter}`, 'green');
  log(`     Oracle:  ${config.umaOracle} (UMA V2)\n`, 'green');
  
  log('⚠️  重要提示:', 'yellow');
  log('   • 现在使用的是真实的 UMA Optimistic Oracle V2', 'cyan');
  log('   • 市场结算需要等待挑战期（约2小时）', 'cyan');
  log('   • 提案者需要提供保证金', 'cyan');
  log('   • 这是去中心化的裁决机制\n', 'cyan');
  
  log('🔧 下一步:', 'yellow');
  log('   1. 重启开发服务器: npm run dev', 'cyan');
  log('   2. 测试创建市场功能', 'cyan');
  log('   3. 验证UMA预言机集成\n', 'cyan');
  
  log('📚 参考文档:', 'yellow');
  log('   • UMA预言机使用说明.md', 'cyan');
  log('   • 切换到UMA官方预言机指南.md\n', 'cyan');
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

function updateBlockchainService(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'blockchainService.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换合约配置
  const oldConfig = `const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  fullCtf: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  exchange: '0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};`;
  
  const newConfig = `const CONTRACTS = {
  realAdapter: '${config.realAdapter}',  // ✅ 使用真实UMA预言机
  conditionalTokens: '${config.conditionalTokens}',
  exchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40', // ✅ Polymarket 官方
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  umaOracle: '${config.umaOracle}',  // UMA官方预言机
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};`;
  
  content = content.replace(oldConfig, newConfig);
  
  // 更新构造函数中的适配器引用
  content = content.replace(
    /CONTRACTS\.testAdapter/g,
    'CONTRACTS.realAdapter'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateBlockchainProvider(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'providers', 'blockchain.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换合约配置
  const oldConfig = `const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com' // 🆕 稳定的 RPC
};`;
  
  const newConfig = `const CONTRACTS = {
  realAdapter: '${config.realAdapter}',  // ✅ 使用真实UMA预言机
  conditionalTokens: '${config.conditionalTokens}',
  umaOracle: '${config.umaOracle}',  // UMA官方预言机
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com' // 稳定的 RPC
};`;
  
  content = content.replace(oldConfig, newConfig);
  
  // 更新构造函数中的适配器引用
  content = content.replace(
    /CONTRACTS\.testAdapter/g,
    'CONTRACTS.realAdapter'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateBlockchainActivator(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'market-activation', 'blockchain-activator.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换合约配置
  const oldConfig = `const CONTRACTS = {
  adapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  ctf: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2'
};`;
  
  const newConfig = `const CONTRACTS = {
  adapter: '${config.realAdapter}',  // ✅ 使用真实UMA预言机
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  conditionalTokens: '${config.conditionalTokens}',
  umaOracle: '${config.umaOracle}'  // UMA官方预言机
};`;
  
  content = content.replace(oldConfig, newConfig);
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// 运行脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    log('\n❌ 发生错误:', 'red');
    console.error(error);
    process.exit(1);
  });

