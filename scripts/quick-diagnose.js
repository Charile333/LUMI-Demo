// 🔍 快速诊断脚本

const { ethers } = require('ethers');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function quickDiagnose() {
  console.log('\n🔍 快速诊断系统状态...\n');
  console.log('='.repeat(60));
  
  let dbOk = false;
  let rpcOk = false;
  let walletOk = false;
  
  // 1. 测试数据库
  console.log('\n📊 测试 1/3: 数据库连接');
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('❌ DATABASE_URL 未配置');
    } else {
      console.log('✅ DATABASE_URL 已配置');
      
      const pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false }
      });
      
      const start = Date.now();
      const result = await pool.query('SELECT NOW()');
      const duration = Date.now() - start;
      
      console.log(`✅ 数据库连接成功 (${duration}ms)`);
      dbOk = true;
      
      await pool.end();
    }
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
  }
  
  // 2. 测试 RPC
  console.log('\n🌐 测试 2/3: RPC 连接');
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
    console.log('📍 RPC URL:', rpcUrl);
    
    const provider = new ethers.providers.JsonRpcProvider({
      url: rpcUrl,
      timeout: 10000
    }, {
      name: 'polygon-amoy',
      chainId: 80002
    });
    
    const start = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const duration = Date.now() - start;
    
    console.log(`✅ RPC 连接成功 (${duration}ms)`);
    console.log(`📦 最新区块: ${blockNumber}`);
    rpcOk = true;
  } catch (error) {
    console.log('❌ RPC 连接失败:', error.message);
  }
  
  // 3. 测试钱包
  console.log('\n💰 测试 3/3: 钱包配置');
  try {
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.log('❌ PLATFORM_WALLET_PRIVATE_KEY 未配置');
    } else {
      console.log('✅ PLATFORM_WALLET_PRIVATE_KEY 已配置');
      
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
      const provider = new ethers.providers.JsonRpcProvider({
        url: rpcUrl,
        timeout: 10000
      }, {
        name: 'polygon-amoy',
        chainId: 80002
      });
      
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log('📍 钱包地址:', wallet.address);
      
      const balance = await wallet.getBalance();
      console.log('💵 POL 余额:', ethers.utils.formatEther(balance), 'POL');
      
      if (balance.gt(0)) {
        console.log('✅ POL 余额充足');
      } else {
        console.log('⚠️  POL 余额为 0，无法支付 gas');
      }
      
      // 测试 USDC
      const usdcAddress = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
      const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
      const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
      const usdcBalance = await usdc.balanceOf(wallet.address);
      
      console.log('💵 USDC 余额:', ethers.utils.formatUnits(usdcBalance, 6), 'USDC');
      
      if (usdcBalance.gt(0)) {
        console.log('✅ USDC 余额充足');
      } else {
        console.log('⚠️  USDC 余额为 0，无法激活市场');
      }
      
      walletOk = true;
    }
  } catch (error) {
    console.log('❌ 钱包测试失败:', error.message);
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 诊断总结:\n');
  console.log(`  数据库: ${dbOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`  RPC节点: ${rpcOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`  钱包配置: ${walletOk ? '✅ 正常' : '❌ 异常'}`);
  
  console.log('\n🎯 建议:\n');
  
  if (!dbOk) {
    console.log('  1. 检查 DATABASE_URL 配置');
    console.log('  2. 确认 Supabase 项目未暂停');
    console.log('  3. 测试网络连接\n');
  }
  
  if (!rpcOk) {
    console.log('  1. 检查 NEXT_PUBLIC_RPC_URL 配置');
    console.log('  2. 尝试更换 RPC 节点');
    console.log('  3. 检查防火墙设置\n');
  }
  
  if (!walletOk) {
    console.log('  1. 检查 PLATFORM_WALLET_PRIVATE_KEY 配置');
    console.log('  2. 确保私钥格式正确（0x开头）');
    console.log('  3. 获取测试币（POL 和 USDC）\n');
  }
  
  if (dbOk && rpcOk && walletOk) {
    console.log('  ✅ 所有组件正常！');
    console.log('  📝 如果激活仍然失败，请提供详细错误信息\n');
  }
}

quickDiagnose().catch(console.error);













