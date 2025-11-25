// 🔑 生成新的测试钱包

const { ethers } = require('ethers');

console.log('\n🔑 生成新的测试钱包...\n');

const wallet = ethers.Wallet.createRandom();

console.log('📍 钱包地址:', wallet.address);
console.log('🔐 私钥:', wallet.privateKey);
console.log('📝 助记词:', wallet.mnemonic.phrase);

console.log('\n⚠️  重要提示:');
console.log('  1. 请妥善保管私钥和助记词');
console.log('  2. 不要在生产环境使用这个钱包');
console.log('  3. 这只是用于测试的钱包\n');

console.log('📋 配置步骤:');
console.log('  1. 将私钥添加到 .env.local:');
console.log(`     PLATFORM_WALLET_PRIVATE_KEY=${wallet.privateKey}`);
console.log('\n  2. 到水龙头获取测试币:');
console.log(`     https://faucet.polygon.technology/`);
console.log(`     钱包地址: ${wallet.address}`);
console.log('\n  3. 获取测试 USDC (如需激活市场)');
console.log('');



































