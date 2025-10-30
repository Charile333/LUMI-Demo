/**
 * 🚀 仅部署 RealUmaCTFAdapter
 * 
 * 复用现有的 ConditionalTokens 和 CTF Exchange
 * 只部署 UMA 预言机适配器
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// UMA 官方预言机地址
const UMA_ORACLE_AMOY = "0x263351499f82C107e540B01F0Ca959843e22464a";

// ✅ 使用官方合约地址
const EXISTING_CONTRACTS = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2', // ✅ Gnosis 官方
  ctfExchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40', // ✅ Polymarket 官方
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};

async function main() {
  console.log('\n🚀 部署 RealUmaCTFAdapter (UMA 官方预言机)\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('👤 部署账户:', deployer.address);
  
  const balance = await deployer.getBalance();
  const balanceInPOL = hre.ethers.utils.formatEther(balance);
  console.log('💰 账户余额:', balanceInPOL, 'POL\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 部署 RealUmaCTFAdapter
  console.log('📝 部署 RealUmaCTFAdapter...\n');
  console.log('   CTF 地址:', EXISTING_CONTRACTS.conditionalTokens);
  console.log('   UMA Oracle:', UMA_ORACLE_AMOY);
  console.log('');
  
  const RealAdapter = await hre.ethers.getContractFactory("RealUmaCTFAdapter");
  console.log('   正在部署...');
  
  const realAdapter = await RealAdapter.deploy(
    EXISTING_CONTRACTS.conditionalTokens,
    UMA_ORACLE_AMOY
  );
  await realAdapter.deployed();
  
  console.log('   ✅ RealUmaCTFAdapter 已部署');
  console.log('   📍 地址:', realAdapter.address);
  console.log('   🔗 查看:', `https://amoy.polygonscan.com/address/${realAdapter.address}\n`);
  
  console.log('   ⏳ 等待区块确认...');
  await realAdapter.deployTransaction.wait(2);
  console.log('   ✅ 已确认\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 保存部署信息
  const deployment = {
    network: "amoy",
    chainId: 80002,
    deployer: deployer.address,
    version: "uma-adapter-only",
    timestamp: new Date().toISOString(),
    balance: balanceInPOL + " POL",
    contracts: {
      conditionalTokens: {
        address: EXISTING_CONTRACTS.conditionalTokens,
        type: "Existing",
        note: "Reusing existing deployment"
      },
      ctfExchange: {
        address: EXISTING_CONTRACTS.ctfExchange,
        type: "Existing",  
        note: "Reusing existing deployment"
      },
      realUmaCTFAdapter: {
        address: realAdapter.address,
        deployTx: realAdapter.deployTransaction.hash,
        type: "Newly Deployed",
        oracle: UMA_ORACLE_AMOY
      },
      umaOptimisticOracle: {
        address: UMA_ORACLE_AMOY,
        type: "UMA Official V2",
        official: true
      },
      collateral: {
        address: EXISTING_CONTRACTS.mockUSDC,
        type: "Existing Mock USDC"
      }
    }
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, 'amoy-complete-polymarket.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  
  console.log('📄 部署信息已保存\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('🎉 部署完成！\n');
  console.log('📋 部署摘要:\n');
  console.log('   ConditionalTokens:', EXISTING_CONTRACTS.conditionalTokens, '(复用)');
  console.log('   CTF Exchange:', EXISTING_CONTRACTS.ctfExchange, '(复用)');
  console.log('   RealUmaCTFAdapter:', realAdapter.address, '(新部署) ✅');
  console.log('   UMA Oracle:', UMA_ORACLE_AMOY, '(官方) ✅');
  console.log('   Mock USDC:', EXISTING_CONTRACTS.mockUSDC, '(复用)');
  console.log('');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('🔧 下一步:\n');
  console.log('   1. 运行配置更新脚本:');
  console.log('      node scripts/update-config-from-deployment.js\n');
  console.log('   2. 重启开发服务器:');
  console.log('      npm run dev\n');
  console.log('═══════════════════════════════════════════════════\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 部署失败:', error);
    process.exit(1);
  });

