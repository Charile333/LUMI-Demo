/**
 * 测试环境变量和 Supabase 连接状态
 * 访问: http://localhost:3000/api/test-env
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const config = {
    supabaseUrl: supabaseUrl || '未配置 ❌',
    supabaseAnonKey: supabaseAnonKey ? '已配置 ✅' : '未配置 ❌',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置 ✅' : '未配置 ❌',
    cronSecret: process.env.CRON_SECRET ? '已配置 ✅' : '未配置 ❌',
    databaseUrl: process.env.DATABASE_URL ? '已配置 ✅' : '未配置 ❌',
  };

  // 🔍 测试 Supabase 连接
  let connectionTest = {
    status: '未测试',
    message: '',
    details: {}
  };

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // 尝试查询一个简单的表
      const { data, error, status, statusText } = await supabase
        .from('markets')
        .select('count', { count: 'exact', head: true })
        .limit(0);

      if (error) {
        connectionTest = {
          status: '连接失败 ❌',
          message: error.message,
          details: {
            code: error.code,
            hint: error.hint,
            details: error.details
          }
        };
      } else {
        connectionTest = {
          status: '连接成功 ✅',
          message: '可以访问 Supabase 数据库',
          details: {
            httpStatus: status,
            statusText: statusText
          }
        };
      }
    } catch (err: any) {
      connectionTest = {
        status: '连接异常 ⚠️',
        message: err.message,
        details: {
          error: err.toString()
        }
      };
    }
  } else {
    connectionTest = {
      status: '无法测试 ⚠️',
      message: 'Supabase 凭据未配置',
      details: {}
    };
  }

  return NextResponse.json({
    ...config,
    connectionTest,
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}






