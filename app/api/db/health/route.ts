// 🏥 数据库健康检查API

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isHealthy = await db.healthCheck();
    
    if (isHealthy) {
      return NextResponse.json({
        success: true,
        status: 'healthy',
        message: '数据库连接正常',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 'unhealthy',
        message: '数据库连接失败',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}








































