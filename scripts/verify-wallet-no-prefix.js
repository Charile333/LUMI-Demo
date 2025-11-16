// 🔍 验证钱包地址和私钥（不带0x前缀）

const { ethers } = require('ethers');

// 用户提供的信息（不带0x）
const address = '0xaa22D02aA0C31cF4140d54284B249cDb651107aB';
const privateKeyNoPrefix = '380915585879f1066e9630f6254fe365bc11195832370d798aab72c1c0d9c4df';
const privateKeyWithPrefix = '0x' + privateKeyNoPrefix;

console.log('\n🔍 验证钱包信息（不带0x前缀）...\n');

try {
  // 测试两种格式
  console.log('测试 1: 不带 0x 前缀');
  const wallet1 = new ethers.Wallet(privateKeyNoPrefix);
  console.log(`   派生地址: ${wallet1.address}`);
  
  console.log('\n测试 2: 带 0x 前缀');
  const wallet2 = new ethers.Wallet(privateKeyWithPrefix);
  console.log(`   派生地址: ${wallet2.address}`);
  
  console.log(`\n📍 用户提供的地址: ${address}`);
  
  // 验证地址是否匹配
  if (wallet1.address.toLowerCase() === address.toLowerCase()) {
    console.log('\n✅ 地址匹配！私钥正确\n');
    
    console.log('📝 .env.local 配置（两种格式都可以）：\n');
    
    console.log('选项 1 - 不带 0x 前缀（您的格式）:');
    console.log(`PLATFORM_WALLET_PRIVATE_KEY=${privateKeyNoPrefix}\n`);
    
    console.log('选项 2 - 带 0x 前缀（标准格式）:');
    console.log(`PLATFORM_WALLET_PRIVATE_KEY=${privateKeyWithPrefix}\n`);
    
    console.log('💡 推荐使用选项 1（您的格式），ethers.js 两种都支持\n');
    
  } else {
    console.log('\n❌ 地址不匹配！\n');
  }
  
} catch (error) {
  console.error('❌ 验证失败:', error.message);
}













