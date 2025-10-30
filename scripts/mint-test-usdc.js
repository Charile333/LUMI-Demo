/**
 * 🪙 铸造测试 USDC
 * 
 * 给指定地址铸造测试 USDC，用于测试市场创建和交易
 */

const hre = require("hardhat");

// Mock USDC 地址（从部署记录中获取）
const MOCK_USDC_ADDRESS = "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a";

// 🎯 可以给多个地址铸造USDC
const RECIPIENTS = [
  { address: "0x6830271111dc9814b3bEd0E4a8307E75AC571f95", amount: "1000" },
  { address: "0xaa22D02aA0C31cF4140d54284B249cDb651107aB", amount: "1000" },
  // 可以添加更多地址
];

// 或者只铸造给一个地址（命令行参数）
const SINGLE_RECIPIENT = process.argv[2]; // 从命令行获取地址
const MINT_AMOUNT = process.argv[3] || "1000"; // 默认1000 USDC

async function main() {
  console.log('\n🪙 铸造测试 USDC\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('👤 操作账户:', deployer.address);
  
  const balance = await deployer.getBalance();
  console.log('💰 MATIC 余额:', hre.ethers.utils.formatEther(balance), 'MATIC\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
  // 连接到 Mock USDC 合约
  console.log('📝 连接到 Mock USDC 合约...');
  console.log('   地址:', MOCK_USDC_ADDRESS, '\n');
  
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = MockUSDC.attach(MOCK_USDC_ADDRESS);
  
  // 🎯 方式1: 命令行指定单个地址
  if (SINGLE_RECIPIENT) {
    console.log('📝 单个地址铸造模式\n');
    
    const currentBalance = await mockUSDC.balanceOf(SINGLE_RECIPIENT);
    console.log('📊 当前余额:');
    console.log('   地址:', SINGLE_RECIPIENT);
    console.log('   余额:', hre.ethers.utils.formatUnits(currentBalance, 6), 'USDC\n');
    
    console.log('🪙 铸造 USDC...');
    console.log('   数量:', MINT_AMOUNT, 'USDC');
    
    const amount = hre.ethers.utils.parseUnits(MINT_AMOUNT, 6);
    const tx = await mockUSDC.mint(SINGLE_RECIPIENT, amount);
    
    console.log('   交易哈希:', tx.hash);
    console.log('   ⏳ 等待确认...');
    
    await tx.wait();
    
    console.log('   ✅ 铸造成功！\n');
    
    const newBalance = await mockUSDC.balanceOf(SINGLE_RECIPIENT);
    console.log('📊 新余额:', hre.ethers.utils.formatUnits(newBalance, 6), 'USDC\n');
  } 
  // 🎯 方式2: 批量铸造给多个地址
  else {
    console.log('📝 批量铸造模式\n');
    console.log('将给以下地址铸造 USDC:\n');
    
    for (const recipient of RECIPIENTS) {
      console.log(`   • ${recipient.address}: ${recipient.amount} USDC`);
    }
    console.log('');
    
    for (let i = 0; i < RECIPIENTS.length; i++) {
      const { address, amount: amountStr } = RECIPIENTS[i];
      
      console.log(`[${i + 1}/${RECIPIENTS.length}] 处理地址: ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // 检查当前余额
      const currentBalance = await mockUSDC.balanceOf(address);
      console.log(`   当前余额: ${hre.ethers.utils.formatUnits(currentBalance, 6)} USDC`);
      
      // 铸造
      const amount = hre.ethers.utils.parseUnits(amountStr, 6);
      const tx = await mockUSDC.mint(address, amount);
      console.log(`   交易哈希: ${tx.hash}`);
      
      await tx.wait();
      
      const newBalance = await mockUSDC.balanceOf(address);
      console.log(`   新余额: ${hre.ethers.utils.formatUnits(newBalance, 6)} USDC`);
      console.log('   ✅ 完成\n');
    }
  }
  
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🎉 全部完成！\n');
  console.log('使用方法：');
  console.log('  批量铸造: npx hardhat run scripts/mint-test-usdc.js --network amoy');
  console.log('  单个地址: npx hardhat run scripts/mint-test-usdc.js --network amoy 0xYourAddress 500\n');
  console.log('现在你可以：');
  console.log('  1. 在 MetaMask 切换到任意已铸造的地址');
  console.log('  2. 访问 http://localhost:3000/lumi-integration-example.html');
  console.log('  3. 连接钱包');
  console.log('  4. 创建市场 ✅\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

