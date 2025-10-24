// 🎯 订单匹配引擎

import { db } from '../db';
import { Order, verifyOrderSignature, isOrderExpired, getOrderHash } from './signing';

export interface MatchResult {
  order: any;
  trades: any[];
  remainingAmount: string;
  fullyFilled: boolean;
}

export class MatchingEngine {
  /**
   * 提交新订单并尝试匹配
   */
  async submitOrder(order: Order): Promise<MatchResult> {
    console.log('[MatchingEngine] 提交订单:', order.orderId);
    
    // 1. 验证订单
    this.validateOrder(order);
    
    // 2. 保存到数据库
    const savedOrder = await this.saveOrder(order);
    console.log('[MatchingEngine] 订单已保存, ID:', savedOrder.id);
    
    // 3. 尝试匹配
    const trades = await this.matchOrder(savedOrder);
    console.log('[MatchingEngine] 匹配完成, 成交:', trades.length);
    
    // 4. 更新订单状态
    await this.updateOrderStatus(savedOrder.id);
    
    // 5. 计算剩余数量
    const filled = trades.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const remaining = parseFloat(order.amount) - filled;
    const fullyFilled = remaining <= 0;
    
    return {
      order: savedOrder,
      trades,
      remainingAmount: remaining.toString(),
      fullyFilled
    };
  }
  
  /**
   * 验证订单
   */
  private validateOrder(order: Order): void {
    // 检查必填字段
    if (!order.orderId || !order.maker || !order.signature) {
      throw new Error('订单缺少必填字段');
    }
    
    // 验证签名
    if (!verifyOrderSignature(order)) {
      throw new Error('签名验证失败');
    }
    
    // 检查过期
    if (isOrderExpired(order)) {
      throw new Error('订单已过期');
    }
    
    // 验证价格范围
    const price = parseFloat(order.price);
    if (price < 0 || price > 1) {
      throw new Error('价格必须在 0-1 之间');
    }
    
    // 验证数量
    const amount = parseFloat(order.amount);
    if (amount <= 0) {
      throw new Error('数量必须大于 0');
    }
    
    // 验证 outcome
    if (order.outcome !== 0 && order.outcome !== 1) {
      throw new Error('outcome 必须是 0 或 1');
    }
    
    // 验证 side
    if (order.side !== 'buy' && order.side !== 'sell') {
      throw new Error('side 必须是 buy 或 sell');
    }
  }
  
  /**
   * 保存订单到数据库
   */
  private async saveOrder(order: Order): Promise<any> {
    // 获取市场的 question_id
    const marketResult = await db.query(
      `SELECT question_id FROM markets WHERE id = $1`,
      [order.marketId]
    );
    
    if (marketResult.rows.length === 0) {
      throw new Error('市场不存在');
    }
    
    const questionId = marketResult.rows[0].question_id;
    
    // 插入订单
    const result = await db.query(
      `INSERT INTO orders (
        order_id, order_hash, market_id, question_id,
        maker_address, side, outcome, price, amount,
        filled_amount, remaining_amount, signature, salt, nonce, expiration,
        status, settlement_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *`,
      [
        order.orderId,
        getOrderHash(order),
        order.marketId,
        questionId,
        order.maker,
        order.side,
        order.outcome,
        order.price,
        order.amount,
        '0', // filled_amount
        order.amount, // remaining_amount
        order.signature,
        order.salt,
        order.nonce,
        order.expiration,
        'open',
        'pending'
      ]
    );
    
    return result.rows[0];
  }
  
  /**
   * 订单匹配逻辑
   */
  private async matchOrder(order: any): Promise<any[]> {
    const trades: any[] = [];
    
    // 找到相反方向的订单
    const oppositeResult = await db.query(
      `SELECT * FROM orders
       WHERE market_id = $1
         AND outcome = $2
         AND side = $3
         AND status IN ('open', 'partial')
         AND remaining_amount > 0
         AND expiration > $4
         AND ${order.side === 'buy' ? 'price <= $5' : 'price >= $5'}
       ORDER BY 
         ${order.side === 'buy' ? 'price ASC' : 'price DESC'},
         created_at ASC
       LIMIT 10`,
      [
        order.market_id,
        order.outcome,
        order.side === 'buy' ? 'sell' : 'buy',
        Math.floor(Date.now() / 1000),
        order.price
      ]
    );
    
    const oppositeOrders = oppositeResult.rows;
    
    console.log(`[MatchingEngine] 找到 ${oppositeOrders.length} 个可匹配订单`);
    
    let remainingAmount = parseFloat(order.remaining_amount);
    
    // 逐个匹配
    for (const oppositeOrder of oppositeOrders) {
      if (remainingAmount <= 0) break;
      
      const matchAmount = Math.min(
        remainingAmount,
        parseFloat(oppositeOrder.remaining_amount)
      );
      
      // 创建成交记录
      const tradeResult = await db.query(
        `INSERT INTO trades (
          trade_id, market_id, question_id,
          maker_order_id, taker_order_id,
          maker_address, taker_address,
          side, outcome, price, amount,
          maker_fee, taker_fee, settled, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *`,
        [
          `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order.market_id,
          order.question_id,
          oppositeOrder.id,
          order.id,
          oppositeOrder.maker_address,
          order.maker_address,
          order.side,
          order.outcome,
          oppositeOrder.price, // 使用挂单价格
          matchAmount.toString(),
          '0', // maker_fee
          '0', // taker_fee
          false
        ]
      );
      
      trades.push(tradeResult.rows[0]);
      
      // 更新对手单
      const newOppositeRemaining = parseFloat(oppositeOrder.remaining_amount) - matchAmount;
      await db.query(
        `UPDATE orders 
         SET filled_amount = filled_amount + $1,
             remaining_amount = $2,
             status = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          matchAmount,
          newOppositeRemaining,
          newOppositeRemaining <= 0 ? 'filled' : 'partial',
          oppositeOrder.id
        ]
      );
      
      // 更新自己的订单
      remainingAmount -= matchAmount;
      await db.query(
        `UPDATE orders 
         SET filled_amount = filled_amount + $1,
             remaining_amount = $2,
             status = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          matchAmount,
          remainingAmount,
          remainingAmount <= 0 ? 'filled' : 'partial',
          order.id
        ]
      );
      
      console.log(`[MatchingEngine] 成交: ${matchAmount} @ ${oppositeOrder.price}`);
    }
    
    return trades;
  }
  
  /**
   * 更新订单状态
   */
  private async updateOrderStatus(orderId: number): Promise<void> {
    await db.query(
      `UPDATE orders
       SET status = CASE
         WHEN remaining_amount <= 0 THEN 'filled'
         WHEN filled_amount > 0 THEN 'partial'
         ELSE status
       END,
       updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );
  }
  
  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, userAddress: string): Promise<boolean> {
    console.log(`[MatchingEngine] 取消订单: ${orderId}`);
    
    const result = await db.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE order_id = $1
         AND maker_address = $2
         AND status IN ('open', 'partial')
       RETURNING *`,
      [orderId, userAddress]
    );
    
    return result.rows.length > 0;
  }
  
  /**
   * 获取订单簿
   */
  async getOrderBook(marketId: number, outcome: number): Promise<{
    bids: Array<{ price: string; total_amount: string; order_count: number }>;
    asks: Array<{ price: string; total_amount: string; order_count: number }>;
  }> {
    // 买单（bids）
    const bidsResult = await db.query(
      `SELECT price, 
              SUM(remaining_amount) as total_amount,
              COUNT(*) as order_count
       FROM orders
       WHERE market_id = $1
         AND outcome = $2
         AND side = 'buy'
         AND status IN ('open', 'partial')
         AND remaining_amount > 0
         AND expiration > $3
       GROUP BY price
       ORDER BY price DESC
       LIMIT 20`,
      [marketId, outcome, Math.floor(Date.now() / 1000)]
    );
    
    // 卖单（asks）
    const asksResult = await db.query(
      `SELECT price, 
              SUM(remaining_amount) as total_amount,
              COUNT(*) as order_count
       FROM orders
       WHERE market_id = $1
         AND outcome = $2
         AND side = 'sell'
         AND status IN ('open', 'partial')
         AND remaining_amount > 0
         AND expiration > $3
       GROUP BY price
       ORDER BY price ASC
       LIMIT 20`,
      [marketId, outcome, Math.floor(Date.now() / 1000)]
    );
    
    return {
      bids: bidsResult.rows.map(r => ({
        price: r.price,
        total_amount: r.total_amount,
        order_count: parseInt(r.order_count)
      })),
      asks: asksResult.rows.map(r => ({
        price: r.price,
        total_amount: r.total_amount,
        order_count: parseInt(r.order_count)
      }))
    };
  }
}

// 导出单例
export const matchingEngine = new MatchingEngine();
