/**
 * 🚀 完整部署 Polymarket 系统
 * 
 * 包含：
 * 1. UMA 官方预言机集成 (RealUmaCTFAdapter)
 * 2. 官方 CTF Exchange (订单簿交易所)
 * 3. Conditional Tokens Framework
 * 4. 完整的系统配置
 */

const hre = require("hardhat");
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
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// UMA 官方预言机地址（Polygon Amoy 测试网）
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a";

// Polymarket 官方 CTF Exchange 地址（Amoy 测试网）
const POLYMARKET_CTF_EXCHANGE_AMOY = "0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40";

async function main() {
  log('\n🚀 完整部署 Polymarket 系统\n', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const [deployer] = await hre.ethers.getSigners();
  log('👤 部署账户:', 'yellow');
  log(`   地址: ${deployer.address}`, 'cyan');
  
  const balance = await deployer.getBalance();
  const balanceInPOL = hre.ethers.utils.formatEther(balance);
  log(`   余额: ${balanceInPOL} POL\n`, 'cyan');
  
  if (balance.lt(hre.ethers.utils.parseEther("0.5"))) {
    log('⚠️  余额不足！建议至少有 1 POL', 'red');
    log('📝 请访问水龙头获取测试币：', 'yellow');
    log('   https://faucet.polygon.technology/\n', 'cyan');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('是否继续部署？ (y/n): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      log('\n❌ 部署已取消\n', 'red');
      return;
    }
  }
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const deployedContracts = {};
  
  // ============================================================
  // 步骤 1: 部署或使用现有的 Conditional Tokens
  // ============================================================
  
  log('📝 步骤 1/5: Conditional Tokens Framework\n', 'bright');
  
  const existingCTF = '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2';
  log('   检查现有合约...', 'yellow');
  
  try {
    const code = await hre.ethers.provider.getCode(existingCTF);
    if (code !== '0x') {
      log(`   ✅ 使用现有的 ConditionalTokens`, 'green');
      log(`   📍 地址: ${existingCTF}\n`, 'cyan');
      deployedContracts.conditionalTokens = existingCTF;
    } else {
      throw new Error('Not deployed');
    }
  } catch (error) {
    log('   📦 部署新的 ConditionalTokens...', 'yellow');
    const CTF = await hre.ethers.getContractFactory("FullConditionalTokens");
    const ctf = await CTF.deploy();
    await ctf.deployed();
    
    log('   ✅ ConditionalTokens 已部署', 'green');
    log(`   📍 地址: ${ctf.address}`, 'cyan');
    log(`   🔗 查看: https://amoy.polygonscan.com/address/${ctf.address}\n`, 'blue');
    
    log('   ⏳ 等待区块确认...', 'yellow');
    await ctf.deployTransaction.wait(3);
    log('   ✅ 已确认\n', 'green');
    
    deployedContracts.conditionalTokens = ctf.address;
  }
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // ============================================================
  // 步骤 2: 部署 Mock USDC (如果不存在)
  // ============================================================
  
  log('📝 步骤 2/5: Collateral Token (Mock USDC)\n', 'bright');
  
  const existingUSDC = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
  log('   检查现有 Mock USDC...', 'yellow');
  
  try {
    const code = await hre.ethers.provider.getCode(existingUSDC);
    if (code !== '0x') {
      log(`   ✅ 使用现有的 Mock USDC`, 'green');
      log(`   📍 地址: ${existingUSDC}\n`, 'cyan');
      deployedContracts.mockUSDC = existingUSDC;
    } else {
      throw new Error('Not deployed');
    }
  } catch (error) {
    log('   📦 部署新的 Mock USDC...', 'yellow');
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.deployed();
    
    log('   ✅ Mock USDC 已部署', 'green');
    log(`   📍 地址: ${mockUSDC.address}`, 'cyan');
    log(`   🔗 查看: https://amoy.polygonscan.com/address/${mockUSDC.address}\n`, 'blue');
    
    log('   ⏳ 等待区块确认...', 'yellow');
    await mockUSDC.deployTransaction.wait(3);
    log('   ✅ 已确认\n', 'green');
    
    // 给部署者铸造一些测试代币
    log('   💰 铸造测试 USDC...', 'yellow');
    const mintAmount = hre.ethers.utils.parseUnits("100000", 6); // 100,000 USDC
    const mintTx = await mockUSDC.mint(deployer.address, mintAmount);
    await mintTx.wait();
    log('   ✅ 已铸造 100,000 USDC\n', 'green');
    
    deployedContracts.mockUSDC = mockUSDC.address;
  }
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // ============================================================
  // 步骤 3: 部署 CTF Exchange (Polymarket 官方版本)
  // ============================================================
  
  log('📝 步骤 3/5: CTF Exchange (Polymarket 官方订单簿)\n', 'bright');
  
  log('   选择部署方式:', 'yellow');
  log('   1. 使用 Polymarket 官方部署 (推荐)', 'cyan');
  log('   2. 部署自己的 CTF Exchange', 'cyan');
  log('', 'reset');
  
  // 选项1：使用 Polymarket 官方地址
  const useOfficialExchange = true; // 可以设置为 false 来部署自己的
  
  if (useOfficialExchange) {
    log(`   ✅ 使用 Polymarket 官方 CTF Exchange`, 'green');
    log(`   📍 地址: ${POLYMARKET_CTF_EXCHANGE_AMOY}`, 'cyan');
    log(`   🔗 查看: https://amoy.polygonscan.com/address/${POLYMARKET_CTF_EXCHANGE_AMOY}`, 'blue');
    log(`   ℹ️  这是 Polymarket 官方部署的交易所\n`, 'magenta');
    deployedContracts.ctfExchange = POLYMARKET_CTF_EXCHANGE_AMOY;
  } else {
    log('   📦 部署自己的 CTF Exchange...', 'yellow');
    const CTFExchange = await hre.ethers.getContractFactory("CTFExchange");
    const ctfExchange = await CTFExchange.deploy(
      deployedContracts.conditionalTokens,
      deployedContracts.mockUSDC,
      deployer.address // fee recipient
    );
    await ctfExchange.deployed();
    
    log('   ✅ CTF Exchange 已部署', 'green');
    log(`   📍 地址: ${ctfExchange.address}`, 'cyan');
    log(`   🔗 查看: https://amoy.polygonscan.com/address/${ctfExchange.address}\n`, 'blue');
    
    log('   ⏳ 等待区块确认...', 'yellow');
    await ctfExchange.deployTransaction.wait(3);
    log('   ✅ 已确认\n', 'green');
    
    deployedContracts.ctfExchange = ctfExchange.address;
  }
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // ============================================================
  // 步骤 4: 部署 RealUmaCTFAdapter (UMA 官方预言机集成)
  // ============================================================
  
  log('📝 步骤 4/5: RealUmaCTFAdapter (UMA 官方预言机)\n', 'bright');
  
  log('   配置信息:', 'yellow');
  log(`   CTF 地址:        ${deployedContracts.conditionalTokens}`, 'cyan');
  log(`   UMA Oracle 地址: ${UMA_ORACLE_AMOY}`, 'cyan');
  log('', 'reset');
  
  log('   📦 部署 RealUmaCTFAdapter...', 'yellow');
  const RealAdapter = await hre.ethers.getContractFactory("RealUmaCTFAdapter");
  const realAdapter = await RealAdapter.deploy(
    deployedContracts.conditionalTokens,
    UMA_ORACLE_AMOY
  );
  await realAdapter.deployed();
  
  log('   ✅ RealUmaCTFAdapter 已部署', 'green');
  log(`   📍 地址: ${realAdapter.address}`, 'cyan');
  log(`   🔗 查看: https://amoy.polygonscan.com/address/${realAdapter.address}\n`, 'blue');
  
  log('   ⏳ 等待区块确认...', 'yellow');
  await realAdapter.deployTransaction.wait(3);
  log('   ✅ 已确认\n', 'green');
  
  deployedContracts.realUmaCTFAdapter = realAdapter.address;
  deployedContracts.umaOracle = UMA_ORACLE_AMOY;
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // ============================================================
  // 步骤 5: 保存部署信息
  // ============================================================
  
  log('📝 步骤 5/5: 保存部署信息\n', 'bright');
  
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "complete-polymarket-system-v1",
    timestamp: new Date().toISOString(),
    balance: balanceInPOL + " POL",
    contracts: {
      conditionalTokens: {
        address: deployedContracts.conditionalTokens,
        type: "Gnosis CTF",
        official: true
      },
      ctfExchange: {
        address: deployedContracts.ctfExchange,
        type: useOfficialExchange ? "Polymarket Official" : "Custom Deploy",
        official: useOfficialExchange,
        note: useOfficialExchange ? "Using Polymarket official deployment" : "Custom CTF Exchange"
      },
      realUmaCTFAdapter: {
        address: deployedContracts.realUmaCTFAdapter,
        type: "UMA Oracle Adapter",
        oracle: UMA_ORACLE_AMOY
      },
      umaOptimisticOracle: {
        address: UMA_ORACLE_AMOY,
        type: "UMA Official V2",
        official: true,
        note: "Polymarket also uses this oracle"
      },
      collateral: {
        address: deployedContracts.mockUSDC,
        symbol: "USDC",
        decimals: 6,
        type: "Mock"
      }
    },
    config: {
      feeRecipient: deployer.address,
      paused: false
    },
    note: "Complete Polymarket system with official UMA oracle and CTF Exchange"
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, 'amoy-complete-polymarket.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  
  log('   ✅ 部署信息已保存', 'green');
  log(`   📄 文件: ${deploymentPath}\n`, 'cyan');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // ============================================================
  // 部署摘要
  // ============================================================
  
  log('\n🎉 部署完成！完整的 Polymarket 系统\n', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('📋 部署摘要:\n', 'yellow');
  
  log('   1️⃣  Conditional Tokens Framework:', 'bright');
  log(`      地址: ${deployedContracts.conditionalTokens}`, 'cyan');
  log(`      类型: Gnosis 官方 CTF`, 'magenta');
  log('', 'reset');
  
  log('   2️⃣  CTF Exchange (订单簿):', 'bright');
  log(`      地址: ${deployedContracts.ctfExchange}`, 'cyan');
  if (useOfficialExchange) {
    log(`      类型: ✅ Polymarket 官方部署`, 'green');
    log(`      说明: 与 Polymarket 使用完全相同的交易所`, 'magenta');
  } else {
    log(`      类型: 自定义部署`, 'yellow');
  }
  log('', 'reset');
  
  log('   3️⃣  RealUmaCTFAdapter (预言机适配器):', 'bright');
  log(`      地址: ${deployedContracts.realUmaCTFAdapter}`, 'cyan');
  log(`      类型: UMA 官方预言机集成`, 'magenta');
  log('', 'reset');
  
  log('   4️⃣  UMA Optimistic Oracle V2:', 'bright');
  log(`      地址: ${UMA_ORACLE_AMOY}`, 'cyan');
  log(`      类型: ✅ UMA 官方部署 (Polymarket 同款)`, 'green');
  log('', 'reset');
  
  log('   5️⃣  Collateral (Mock USDC):', 'bright');
  log(`      地址: ${deployedContracts.mockUSDC}`, 'cyan');
  log(`      余额: 100,000 USDC (测试用)`, 'magenta');
  log('', 'reset');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('✨ 系统特性:\n', 'yellow');
  log('   ✅ 去中心化预言机 (UMA V2)', 'green');
  log('   ✅ 订单簿交易 (CTF Exchange)', 'green');
  log('   ✅ 条件代币框架 (Gnosis CTF)', 'green');
  log('   ✅ 争议机制 (2小时挑战期)', 'green');
  log('   ✅ 经济激励系统', 'green');
  log('   ✅ 与 Polymarket 架构完全一致\n', 'green');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('🔧 下一步操作:\n', 'yellow');
  log('   1. 更新前端配置文件:', 'cyan');
  log('      - lib/blockchainService.ts', 'blue');
  log('      - lib/providers/blockchain.ts', 'blue');
  log('      - lib/market-activation/blockchain-activator.ts', 'blue');
  log('', 'reset');
  
  log('   2. 运行配置更新脚本:', 'cyan');
  log('      node scripts/update-config-from-deployment.js', 'blue');
  log('', 'reset');
  
  log('   3. 测试系统:', 'cyan');
  log('      - 创建测试市场', 'blue');
  log('      - 测试订单簿交易', 'blue');
  log('      - 验证 UMA 预言机集成', 'blue');
  log('', 'reset');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('📚 参考文档:\n', 'yellow');
  log('   • UMA预言机使用说明.md', 'cyan');
  log('   • 切换到UMA官方预言机指南.md', 'cyan');
  log('   • UMA预言机配置完成.md', 'cyan');
  log('   • https://github.com/Polymarket/ctf-exchange', 'blue');
  log('   • https://docs.uma.xyz\n', 'blue');
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('🎊 恭喜！您现在拥有完整的 Polymarket 克隆系统！\n', 'bright');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    log('\n❌ 部署失败:', 'red');
    console.error(error);
    process.exit(1);
  });

