/**
 * 测试环境变量是否配置正确
 * 访问: http://localhost:3000/api/test-env
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置 ✅' : '未配置 ❌',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置 ✅' : '未配置 ❌',
    cronSecret: process.env.CRON_SECRET ? '已配置 ✅' : '未配置 ❌',
  };

  return NextResponse.json(config);
}





