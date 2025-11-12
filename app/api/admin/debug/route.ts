// 🔍 管理员登录调试 API
// 用于诊断登录问题

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const hostname = request.nextUrl.hostname;
    const headers = {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'user-agent': request.headers.get('user-agent'),
    };

    // 检查环境变量
    const envVars = {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '已配置 ✅' : '未配置 ❌',
      ADMIN_AUTH_SECRET: process.env.ADMIN_AUTH_SECRET ? '已配置 ✅' : '未配置 ❌',
      ALLOW_ADMIN_IN_PRODUCTION: process.env.ALLOW_ADMIN_IN_PRODUCTION || '未设置（默认 false）',
      NODE_ENV: process.env.NODE_ENV,
    };

    // 检查是否在本地环境
    const isLocalhost = 
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.match(/^10\./) ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

    const allowProduction = process.env.ALLOW_ADMIN_IN_PRODUCTION === 'true';

    return NextResponse.json({
      success: true,
      message: '🔍 管理员登录调试信息',
      environment: {
        hostname,
        isLocalhost,
        allowProduction,
        isAllowedToAccessAdmin: isLocalhost || allowProduction,
      },
      headers,
      envVars,
      tips: {
        '本地访问': isLocalhost ? '✅ 当前在本地环境，可以访问管理后台' : '❌ 当前不在本地环境',
        '生产环境访问': allowProduction ? '✅ 允许生产环境访问' : '❌ 不允许生产环境访问',
        '密码配置': envVars.ADMIN_PASSWORD === '已配置 ✅' ? '✅ 密码已配置' : '❌ 密码未配置，请在 .env.local 中配置 ADMIN_PASSWORD',
        '访问权限': (isLocalhost || allowProduction) ? '✅ 可以访问管理后台' : '❌ 无法访问管理后台（需要在本地环境或设置 ALLOW_ADMIN_IN_PRODUCTION=true）',
      },
      troubleshooting: {
        '如果无法登录': [
          '1. 检查是否在本地环境（localhost）',
          '2. 检查 .env.local 中是否配置了 ADMIN_PASSWORD',
          '3. 重启开发服务器（npm run dev）',
          '4. 清除浏览器缓存和 Cookie',
          '5. 检查控制台是否有错误信息',
        ],
        '如果密码错误': [
          '1. 检查 .env.local 中的 ADMIN_PASSWORD 值',
          '2. 密码区分大小写',
          '3. 密码前后不要有空格',
          '4. 重启开发服务器让环境变量生效',
        ],
        '如果提示系统配置错误': [
          '1. 确认 .env.local 文件存在于项目根目录',
          '2. 确认文件中有 ADMIN_PASSWORD=your_password',
          '3. 重启开发服务器',
        ],
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

