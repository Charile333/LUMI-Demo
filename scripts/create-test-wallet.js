/**
 * 创建测试钱包
 * 运行: node scripts/create-test-wallet.js
 */

const { ethers } = require('ethers');

function createTestWallet() {
  console.log('\n🔐 创建测试钱包\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  // 创建随机钱包
  const wallet = ethers.Wallet.createRandom();
  
  console.log('✅ 测试钱包已创建！\n');
  console.log('📋 钱包信息:\n');
  console.log(`   地址: ${wallet.address}`);
  console.log(`   私钥: ${wallet.privateKey.slice(2)}`); // 移除 0x 前缀
  console.log('');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('⚠️  重要提示:\n');
  console.log('   1. 这是测试钱包，仅用于开发测试');
  console.log('   2. 将私钥保存到 .env.local 文件');
  console.log('   3. 不要将 .env.local 提交到 Git');
  console.log('   4. 访问水龙头获取测试币:\n');
  console.log('      https://faucet.polygon.technology/\n');
  
  console.log('📝 配置步骤:\n');
  console.log('   1. 编辑或创建 .env.local 文件');
  console.log('   2. 添加以下内容:\n');
  console.log(`      PRIVATE_KEY=${wallet.privateKey.slice(2)}\n`);
  console.log('   3. 保存文件');
  console.log('   4. 使用上面的地址在水龙头获取测试币');
  console.log('   5. 运行部署脚本\n');
  
  console.log('═══════════════════════════════════════════════════\n');
}

createTestWallet();

