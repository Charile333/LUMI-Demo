// 📡 API: 获取我的订单

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const status = searchParams.get('status'); // open, filled, cancelled, all
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!address) {
      return NextResponse.json(
        { error: '缺少 address 参数' },
        { status: 400 }
      );
    }
    
    console.log('[API] 获取用户订单:', { address, status, limit });
    
    // 构建查询
    let whereClause = 'WHERE o.user_address = $1';
    const params: any[] = [address.toLowerCase()];
    
    if (status && status !== 'all') {
      whereClause += ' AND o.status = $2';
      params.push(status);
    }
    
    // 查询订单
    const result = await db.query(`
      SELECT 
        o.*,
        m.title as market_title,
        m.main_category as market_category
      FROM orders o
      LEFT JOIN markets m ON o.market_id = m.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1}
    `, [...params, limit]);
    
    // 查询每个订单的成交记录
    const ordersWithTrades = await Promise.all(
      result.rows.map(async (order) => {
        const trades = await db.query(`
          SELECT * FROM trades
          WHERE maker_order_id = $1 OR taker_order_id = $1
          ORDER BY created_at DESC
        `, [order.id]);
        
        return {
          ...order,
          trades: trades.rows
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      orders: ordersWithTrades,
      count: ordersWithTrades.length
    });
    
  } catch (error: any) {
    console.error('[API] 获取订单失败:', error);
    
    // 检查是否是数据库连接错误
    if (error.message && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { 
          error: '数据库未配置',
          details: 'DATABASE_URL 环境变量未设置，请在 Vercel 配置中添加 PostgreSQL 连接字符串',
          helpUrl: 'https://github.com/your-repo/blob/main/VERCEL_环境变量配置指南.md'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '获取订单失败: ' + error.message },
      { status: 500 }
    );
  }
}




