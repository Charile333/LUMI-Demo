// 🔍 验证钱包地址和私钥

const { ethers } = require('ethers');

// 用户提供的信息
const address = '0xaa22D02aA0C31cF4140d54284B249cDb651107aB';
const privateKey = '0x380915585879f1066e9630f6254fe365bc11195832370d798aab72c1c0d9c4df';

console.log('\n🔍 验证钱包信息...\n');

try {
  // 从私钥创建钱包
  const wallet = new ethers.Wallet(privateKey);
  
  console.log('✅ 私钥格式正确');
  console.log(`📍 从私钥派生的地址: ${wallet.address}`);
  console.log(`📍 用户提供的地址:     ${address}`);
  
  // 验证地址是否匹配
  if (wallet.address.toLowerCase() === address.toLowerCase()) {
    console.log('\n✅ 地址匹配！私钥和地址对应正确\n');
    
    console.log('📝 请在 .env.local 中配置：');
    console.log(`PLATFORM_WALLET_PRIVATE_KEY=${privateKey}\n`);
    
    console.log('📋 钱包信息：');
    console.log(`   地址: ${wallet.address}`);
    console.log(`   私钥: ${privateKey}\n`);
    
  } else {
    console.log('\n❌ 地址不匹配！');
    console.log('   这个私钥对应的地址和提供的地址不一致\n');
  }
  
} catch (error) {
  console.error('❌ 验证失败:', error.message);
}






