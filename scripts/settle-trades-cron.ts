#!/usr/bin/env node

// 💰 批量结算交易定时任务
// 每 5 分钟扫描一次，批量结算链下成交的订单

import { db } from '../lib/db';
import { ethers } from 'ethers';

// 合约配置 - 使用 Polymarket 官方 CTF Exchange ✅
const CTF_EXCHANGE_ADDRESS = '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40';
const CTF_EXCHANGE_ABI = [
  'function fillOrders(tuple[] orders, bytes[] signatures, uint256[] amounts)'
];

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('💰 开始批量结算交易...');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60) + '\n');
  
  try {
    // 1. 查找待结算的成交记录
    const tradesResult = await db.query(`
      SELECT 
        t.id, t.trade_id, t.market_id, t.maker_order_id, t.taker_order_id,
        t.maker_address, t.taker_address, t.price, t.amount,
        mo.signature as maker_signature,
        to1.signature as taker_signature
      FROM trades t
      JOIN orders mo ON t.maker_order_id = mo.id
      JOIN orders to1 ON t.taker_order_id = to1.id
      WHERE t.settled = false
        AND t.settlement_batch_id IS NULL
      ORDER BY t.created_at ASC
      LIMIT 20
    `);
    
    const trades = tradesResult.rows;
    
    if (trades.length === 0) {
      console.log('✅ 当前没有待结算的交易');
      return;
    }
    
    console.log(`📊 找到 ${trades.length} 笔待结算交易\n`);
    
    // 2. 创建结算批次
    const batchId = `batch-${Date.now()}`;
    const batchResult = await db.query(
      `INSERT INTO settlements (batch_id, trade_ids, trade_count, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [
        batchId,
        trades.map(t => t.id),
        trades.length,
        'pending'
      ]
    );
    
    const settlement = batchResult.rows[0];
    console.log(`📦 创建结算批次: ${batchId}`);
    console.log(`   交易数量: ${trades.length}`);
    console.log(`   批次 ID: ${settlement.id}\n`);
    
    // 3. 标记交易到批次
    await db.query(
      `UPDATE trades 
       SET settlement_batch_id = $1
       WHERE id = ANY($2)`,
      [settlement.id, trades.map(t => t.id)]
    );
    
    // 4. 检查是否有平台钱包私钥
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
      console.log('⚠️ 未配置 PLATFORM_WALLET_PRIVATE_KEY');
      console.log('⚠️ 跳过链上结算，保持待结算状态');
      return;
    }
    
    // 5. 连接区块链
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com'
    );
    
    const platformWallet = new ethers.Wallet(privateKey, provider);
    console.log(`💰 平台账户: ${platformWallet.address}`);
    
    // 6. 准备批量数据
    // 注意：这里是简化版本，实际需要根据 CTFExchange 合约的具体要求构造数据
    const orders = trades.map(trade => ({
      // 订单数据结构需要根据实际合约调整
      maker: trade.maker_address,
      taker: trade.taker_address,
      price: trade.price,
      amount: trade.amount
    }));
    
    const signatures = trades.map(t => t.maker_signature);
    const amounts = trades.map(t => ethers.utils.parseUnits(t.amount, 18));
    
    // 7. 更新批次状态
    await db.query(
      `UPDATE settlements 
       SET status = $1, processed_at = NOW()
       WHERE id = $2`,
      ['processing', settlement.id]
    );
    
    console.log('📝 发送批量结算交易...');
    console.log('⚠️  注意：CTFExchange 合约需要先部署和配置');
    console.log('⚠️  当前跳过实际的链上调用\n');
    
    // TODO: 取消注释以下代码以启用实际的链上结算
    /*
    const exchange = new ethers.Contract(
      CTF_EXCHANGE_ADDRESS,
      CTF_EXCHANGE_ABI,
      platformWallet
    );
    
    const tx = await exchange.fillOrders(orders, signatures, amounts, {
      gasLimit: 500000 * trades.length
    });
    
    console.log(`⏳ 交易哈希: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ 交易确认，区块: ${receipt.blockNumber}`);
    
    // 8. 更新结算记录
    await db.query(
      `UPDATE settlements 
       SET status = $1,
           tx_hash = $2,
           block_number = $3,
           gas_used = $4,
           completed_at = NOW()
       WHERE id = $5`,
      [
        'completed',
        tx.hash,
        receipt.blockNumber,
        receipt.gasUsed.toNumber(),
        settlement.id
      ]
    );
    
    // 9. 更新交易状态
    await db.query(
      `UPDATE trades 
       SET settled = true,
           settlement_tx_hash = $1,
           settlement_block_number = $2,
           settled_at = NOW()
       WHERE settlement_batch_id = $3`,
      [tx.hash, receipt.blockNumber, settlement.id]
    );
    */
    
    // 模拟成功（开发阶段）
    await db.query(
      `UPDATE settlements 
       SET status = $1, completed_at = NOW()
       WHERE id = $2`,
      ['completed', settlement.id]
    );
    
    await db.query(
      `UPDATE trades 
       SET settled = true, settled_at = NOW()
       WHERE settlement_batch_id = $1`,
      [settlement.id]
    );
    
    console.log('✅ 批量结算完成（模拟）');
    console.log(`   批次 ID: ${batchId}`);
    console.log(`   成交数: ${trades.length}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error: any) {
    console.error('\n❌ 结算失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行任务
main()
  .then(() => {
    console.log('✅ 任务执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 任务执行失败:', error);
    process.exit(1);
  });

