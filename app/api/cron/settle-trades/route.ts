/**
 * Vercel Cron Job: 批量结算交易
 * 
 * 配置在 vercel.json 中（示例）：
 * {
 *   "crons": [{
 *     "path": "/api/cron/settle-trades",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 * 注意：schedule 格式为 cron 表达式，每 5 分钟执行一次
 * 
 * 安全验证：
 * - Vercel 会自动在请求头中添加 Authorization: Bearer <CRON_SECRET>
 * - 需要在 Vercel 环境变量中配置 CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ethers } from 'ethers';

// 合约配置 - 使用 Polymarket 官方 CTF Exchange ✅
const CTF_EXCHANGE_ADDRESS = '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40';
const CTF_EXCHANGE_ABI = [
  'function fillOrders(tuple[] orders, bytes[] signatures, uint256[] amounts)'
];

// 验证 Cron 请求
function verifyCronRequest(request: NextRequest): boolean {
  // Vercel Cron 会在请求头中添加 Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET 未配置');
    return false;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === cronSecret;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证请求（仅在生产环境）
    if (process.env.NODE_ENV === 'production' && !verifyCronRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('💰 开始批量结算交易（Vercel Cron）...');
    console.log('时间:', new Date().toLocaleString('zh-CN'));
    console.log('='.repeat(60) + '\n');
    
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
      return NextResponse.json({
        success: true,
        message: '当前没有待结算的交易',
        tradesProcessed: 0,
        timestamp: new Date().toISOString()
      });
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
      
      return NextResponse.json({
        success: false,
        message: 'PLATFORM_WALLET_PRIVATE_KEY 未配置',
        batchId,
        tradesProcessed: trades.length,
        warning: true,
        timestamp: new Date().toISOString()
      });
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
      maker: trade.maker_address,
      taker: trade.taker_address,
      price: trade.price,
      amount: trade.amount
    }));
    
    const signatures = trades.map(t => t.maker_signature);
    const amounts = trades.map(t => ethers.utils.parseUnits(t.amount.toString(), 18));
    
    // 7. 更新批次状态
    await db.query(
      `UPDATE settlements 
       SET status = $1, processed_at = NOW()
       WHERE id = $2`,
      ['processing', settlement.id]
    );
    
    console.log('📝 准备批量结算交易...');
    console.log('⚠️  注意：CTFExchange 合约需要先部署和配置');
    console.log('⚠️  当前跳过实际的链上调用\n');
    
    // TODO: 取消注释以下代码以启用实际的链上结算
    /*
    try {
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
      
      console.log('✅ 批量结算完成');
      console.log(`   批次 ID: ${batchId}`);
      console.log(`   成交数: ${trades.length}`);
      console.log(`   交易哈希: ${tx.hash}`);
      
      return NextResponse.json({
        success: true,
        message: '批量结算成功',
        batchId,
        tradesProcessed: trades.length,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 链上结算失败:', error);
      
      // 更新批次状态为失败
      await db.query(
        `UPDATE settlements 
         SET status = $1,
             error_message = $2,
             completed_at = NOW()
         WHERE id = $3`,
        ['failed', error.message, settlement.id]
      );
      
      throw error;
    }
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
    
    return NextResponse.json({
      success: true,
      message: '批量结算完成（模拟模式）',
      batchId,
      tradesProcessed: trades.length,
      mode: 'simulated',
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('\n❌ 结算失败:', error.message);
    console.error(error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 允许 POST 请求（用于手动触发）
export const POST = GET;

