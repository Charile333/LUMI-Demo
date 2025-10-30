/**
 * 🔄 从部署文件自动更新配置
 * 
 * 读取 deployments/amoy-complete-polymarket.json
 * 自动更新所有配置文件中的合约地址
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

async function main() {
  log('\n🔄 自动更新配置文件\n', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // 读取部署配置
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy-complete-polymarket.json');
  
  if (!fs.existsSync(deploymentPath)) {
    log('❌ 错误: 未找到部署配置文件', 'red');
    log('\n请先运行部署脚本:', 'yellow');
    log('npx hardhat run scripts/deploy-complete-polymarket-system.js --network amoy\n', 'cyan');
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  log('📋 读取部署配置:\n', 'yellow');
  log(`   网络:             ${deployment.network}`, 'cyan');
  log(`   链ID:             ${deployment.chainId}`, 'cyan');
  log(`   版本:             ${deployment.version}`, 'cyan');
  log(`   部署时间:         ${deployment.timestamp}\n`, 'cyan');
  
  log('📍 合约地址:\n', 'yellow');
  log(`   ConditionalTokens:  ${deployment.contracts.conditionalTokens.address}`, 'cyan');
  log(`   CTF Exchange:       ${deployment.contracts.ctfExchange.address}`, 'cyan');
  log(`   UmaCTFAdapter:      ${deployment.contracts.realUmaCTFAdapter.address}`, 'cyan');
  log(`   UMA Oracle:         ${deployment.contracts.umaOptimisticOracle.address}`, 'cyan');
  log(`   Mock USDC:          ${deployment.contracts.collateral.address}\n`, 'cyan');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const config = {
    realAdapter: deployment.contracts.realUmaCTFAdapter.address,
    conditionalTokens: deployment.contracts.conditionalTokens.address,
    ctfExchange: deployment.contracts.ctfExchange.address,
    umaOracle: deployment.contracts.umaOptimisticOracle.address,
    mockUSDC: deployment.contracts.collateral.address
  };
  
  // 更新所有配置文件
  log('📝 更新配置文件:\n', 'bright');
  
  // 1. 更新 lib/blockchainService.ts
  log('   1/3: lib/blockchainService.ts', 'yellow');
  updateBlockchainService(config);
  log('   ✅ 已更新\n', 'green');
  
  // 2. 更新 lib/providers/blockchain.ts
  log('   2/3: lib/providers/blockchain.ts', 'yellow');
  updateBlockchainProvider(config);
  log('   ✅ 已更新\n', 'green');
  
  // 3. 更新 lib/market-activation/blockchain-activator.ts
  log('   3/3: lib/market-activation/blockchain-activator.ts', 'yellow');
  updateBlockchainActivator(config);
  log('   ✅ 已更新\n', 'green');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // 创建配置摘要文件
  const configSummary = `# 🔮 Polymarket 系统配置

## 部署信息
- **网络**: ${deployment.network}
- **链ID**: ${deployment.chainId}
- **部署时间**: ${deployment.timestamp}
- **部署者**: ${deployment.deployer}

## 合约地址

### 核心合约

| 合约 | 地址 | 类型 |
|------|------|------|
| **Conditional Tokens** | \`${deployment.contracts.conditionalTokens.address}\` | ${deployment.contracts.conditionalTokens.type} |
| **CTF Exchange** | \`${deployment.contracts.ctfExchange.address}\` | ${deployment.contracts.ctfExchange.type} |
| **UmaCTFAdapter** | \`${deployment.contracts.realUmaCTFAdapter.address}\` | ${deployment.contracts.realUmaCTFAdapter.type} |
| **UMA Oracle** | \`${deployment.contracts.umaOptimisticOracle.address}\` | ${deployment.contracts.umaOptimisticOracle.type} |
| **Collateral (USDC)** | \`${deployment.contracts.collateral.address}\` | ${deployment.contracts.collateral.type} |

### 区块链浏览器链接

- ConditionalTokens: https://amoy.polygonscan.com/address/${deployment.contracts.conditionalTokens.address}
- CTF Exchange: https://amoy.polygonscan.com/address/${deployment.contracts.ctfExchange.address}
- UmaCTFAdapter: https://amoy.polygonscan.com/address/${deployment.contracts.realUmaCTFAdapter.address}
- UMA Oracle: https://amoy.polygonscan.com/address/${deployment.contracts.umaOptimisticOracle.address}
- Mock USDC: https://amoy.polygonscan.com/address/${deployment.contracts.collateral.address}

## 配置说明

### UMA 预言机
- ✅ 使用 **UMA Optimistic Oracle V2** 官方部署
- ✅ 与 **Polymarket 完全相同**
- ✅ 支持争议机制（2小时挑战期）
- ✅ 去中心化裁决

### CTF Exchange
${deployment.contracts.ctfExchange.official ? 
`- ✅ 使用 **Polymarket 官方部署**
- ✅ 与 Polymarket 使用完全相同的交易所
- ✅ 经过审计的合约` : 
`- 📝 自定义部署
- 参考 Polymarket 官方实现`}

### Conditional Tokens
- ✅ 基于 **Gnosis CTF** 官方实现
- ✅ 支持 ERC1155 标准
- ✅ 完整的条件代币功能

## 系统架构

\`\`\`
用户界面 (Next.js)
  ↓
订单系统 (Supabase) ← 链下订单簿
  ↓
CTF Exchange: ${deployment.contracts.ctfExchange.address}
  ↓
Conditional Tokens: ${deployment.contracts.conditionalTokens.address}
  ↓
UMA Oracle: ${deployment.contracts.umaOptimisticOracle.address}
\`\`\`

## 使用方法

### 创建市场

\`\`\`javascript
const adapter = new ethers.Contract(
  "${deployment.contracts.realUmaCTFAdapter.address}",
  ADAPTER_ABI,
  signer
);

await adapter.initialize(
  questionId,
  "市场标题",
  "市场描述",
  2,  // YES/NO
  "${deployment.contracts.collateral.address}",  // USDC
  ethers.utils.parseUnits("100", 6),  // 100 USDC 奖励
  0   // 使用默认挑战期
);
\`\`\`

### 订单簿交易

\`\`\`javascript
const exchange = new ethers.Contract(
  "${deployment.contracts.ctfExchange.address}",
  EXCHANGE_ABI,
  signer
);

// 创建订单、填充订单等...
\`\`\`

## 重要提示

⚠️ **测试网环境**
- 这是 Polygon Amoy 测试网部署
- 使用 Mock USDC 进行测试
- 所有交易都是测试性质的

⚠️ **UMA 预言机**
- 使用真实的 UMA Oracle，有实际的挑战期
- 市场结算需要等待约 2 小时
- 提案者需要提供保证金

⚠️ **CTF Exchange**
${deployment.contracts.ctfExchange.official ? 
`- 使用 Polymarket 官方部署，与生产环境相同
- 已经过 Chainsecurity 审计` : 
`- 自定义部署，建议在生产环境使用官方版本`}

## 下一步

1. ✅ 配置已自动更新
2. 重启开发服务器: \`npm run dev\`
3. 测试创建市场功能
4. 验证订单簿交易
5. 测试 UMA 预言机集成

## 参考资料

- UMA 文档: https://docs.uma.xyz
- Polymarket CTF Exchange: https://github.com/Polymarket/ctf-exchange
- Gnosis CTF: https://github.com/gnosis/conditional-tokens-contracts

---

最后更新: ${new Date().toISOString()}
`;
  
  const summaryPath = path.join(__dirname, '..', 'POLYMARKET_SYSTEM_CONFIG.md');
  fs.writeFileSync(summaryPath, configSummary);
  
  log('✅ 配置更新完成！\n', 'bright');
  log('📄 配置摘要已保存到: POLYMARKET_SYSTEM_CONFIG.md\n', 'cyan');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('🎉 所有配置文件已更新！\n', 'green');
  log('🚀 下一步:\n', 'yellow');
  log('   1. 查看配置摘要: cat POLYMARKET_SYSTEM_CONFIG.md', 'cyan');
  log('   2. 重启开发服务器: npm run dev', 'cyan');
  log('   3. 测试系统功能\n', 'cyan');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

function updateBlockchainService(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'blockchainService.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 查找并替换 CONTRACTS 配置
  const contractsRegex = /\/\/ 合约配置[^]*?const CONTRACTS = \{[^}]*\};/;
  
  const newConfig = `// 合约配置 - 完整 Polymarket 系统 🔮
const CONTRACTS = {
  // ✅ 使用真实 UMA 预言机适配器 (Polymarket 官方同款)
  realAdapter: '${config.realAdapter}',
  
  // ✅ UMA 官方预言机 (Polygon Amoy 测试网)
  umaOracle: '${config.umaOracle}',
  
  // ✅ Conditional Tokens Framework (Gnosis 官方)
  conditionalTokens: '${config.conditionalTokens}',
  
  // ✅ CTF Exchange (订单簿交易所)
  exchange: '${config.ctfExchange}',
  
  // 测试用 USDC
  mockUSDC: '${config.mockUSDC}',
  
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};`;
  
  content = content.replace(contractsRegex, newConfig);
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateBlockchainProvider(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'providers', 'blockchain.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  const contractsRegex = /\/\/ 使用 UMA 官方预言机[^]*?const CONTRACTS = \{[^}]*\};/;
  
  const newConfig = `// 使用 UMA 官方预言机 (Polymarket 同款) 🔮
const CONTRACTS = {
  realAdapter: '${config.realAdapter}',
  umaOracle: '${config.umaOracle}',
  conditionalTokens: '${config.conditionalTokens}',
  exchange: '${config.ctfExchange}',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};`;
  
  content = content.replace(contractsRegex, newConfig);
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateBlockchainActivator(config) {
  const filePath = path.join(__dirname, '..', 'lib', 'market-activation', 'blockchain-activator.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  const contractsRegex = /\/\/ 合约地址配置[^]*?const CONTRACTS = \{[^}]*\};/;
  
  const newConfig = `// 合约地址配置 - 完整 Polymarket 系统 🔮
const CONTRACTS = {
  adapter: '${config.realAdapter}',
  umaOracle: '${config.umaOracle}',
  conditionalTokens: '${config.conditionalTokens}',
  exchange: '${config.ctfExchange}',
  mockUSDC: '${config.mockUSDC}'
};`;
  
  content = content.replace(contractsRegex, newConfig);
  fs.writeFileSync(filePath, content, 'utf8');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    log('\n❌ 更新失败:', 'red');
    console.error(error);
    process.exit(1);
  });

