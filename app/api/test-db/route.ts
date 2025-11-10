/**
 * 测试 PostgreSQL 数据库连接
 * 访问: http://localhost:3000/api/test-db
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = {
    databaseUrl: process.env.DATABASE_URL ? '已配置 ✅' : '未配置 ❌',
    connection: { status: '', message: '', error: '' },
    query: { status: '', message: '', error: '' },
    orders: { status: '', message: '', count: 0 }
  };

  // 测试 1: 基础连接
  try {
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    tests.connection.status = '连接成功 ✅';
    tests.connection.message = `当前时间: ${result.rows[0].current_time}`;
  } catch (error: any) {
    tests.connection.status = '连接失败 ❌';
    tests.connection.message = error.message;
    tests.connection.error = error.toString();
  }

  // 测试 2: 查询测试
  try {
    const result = await db.query('SELECT 1 + 1 as result');
    tests.query.status = '查询成功 ✅';
    tests.query.message = `测试查询结果: ${result.rows[0].result}`;
  } catch (error: any) {
    tests.query.status = '查询失败 ❌';
    tests.query.message = error.message;
    tests.query.error = error.toString();
  }

  // 测试 3: orders 表是否存在
  try {
    const result = await db.query(`
      SELECT COUNT(*) as total FROM orders WHERE 1=0
    `);
    tests.orders.status = 'orders 表存在 ✅';
    tests.orders.message = 'orders 表结构正常';
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      tests.orders.status = 'orders 表不存在 ❌';
      tests.orders.message = '需要创建 orders 表';
      tests.orders.error = '请运行数据库迁移脚本';
    } else {
      tests.orders.status = 'orders 表查询失败 ⚠️';
      tests.orders.message = error.message;
      tests.orders.error = error.toString();
    }
  }

  return NextResponse.json({
    ...tests,
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}













