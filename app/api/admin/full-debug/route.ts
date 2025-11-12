// 🔍 完整的管理员登录调试 API
// 全面检查登录流程的每个环节

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, generateAuthToken } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    cookies: {},
    token: {},
    middleware: {},
    recommendations: []
  };

  try {
    // 1. 检查环境变量
    results.environment = {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? {
        configured: true,
        length: process.env.ADMIN_PASSWORD.length,
        preview: process.env.ADMIN_PASSWORD.substring(0, 3) + '***'
      } : {
        configured: false,
        error: '未配置'
      },
      ADMIN_AUTH_SECRET: process.env.ADMIN_AUTH_SECRET ? {
        configured: true,
        length: process.env.ADMIN_AUTH_SECRET.length
      } : {
        configured: false,
        note: '可选，未配置将使用默认值'
      },
      ALLOW_ADMIN_IN_PRODUCTION: process.env.ALLOW_ADMIN_IN_PRODUCTION || 'false',
      NODE_ENV: process.env.NODE_ENV,
      hostname: request.nextUrl.hostname,
    };

    // 2. 检查当前 Cookie
    const allCookies = request.cookies.getAll();
    results.cookies = {
      total: allCookies.length,
      list: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      admin_authenticated: request.cookies.get('admin_authenticated') ? {
        exists: true,
        value: request.cookies.get('admin_authenticated')!.value.substring(0, 20) + '...',
        length: request.cookies.get('admin_authenticated')!.value.length
      } : {
        exists: false,
        error: 'Cookie 未找到 - 这是登录失败的主要原因！'
      }
    };

    // 3. 测试 Token 生成和验证
    try {
      const testToken = generateAuthToken();
      const isValid = verifyAuthToken(testToken);
      results.token = {
        generation: 'success',
        testToken: testToken.substring(0, 20) + '...',
        tokenLength: testToken.length,
        verification: isValid ? 'success' : 'failed',
        note: isValid ? 'Token 生成和验证正常' : '❌ Token 验证失败！'
      };
    } catch (error: any) {
      results.token = {
        generation: 'failed',
        error: error.message
      };
    }

    // 4. 检查当前 Cookie 的 Token 是否有效
    const authCookie = request.cookies.get('admin_authenticated');
    if (authCookie) {
      const isCurrentTokenValid = verifyAuthToken(authCookie.value);
      results.middleware = {
        hasCookie: true,
        tokenValid: isCurrentTokenValid,
        status: isCurrentTokenValid ? '✅ 认证有效' : '❌ Token 无效或过期'
      };
    } else {
      results.middleware = {
        hasCookie: false,
        status: '❌ 未找到认证 Cookie'
      };
    }

    // 5. 检查是否允许访问
    const hostname = request.nextUrl.hostname;
    const isLocalhost = 
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.match(/^10\./) ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
    
    const allowProduction = process.env.ALLOW_ADMIN_IN_PRODUCTION === 'true';
    
    results.access = {
      hostname,
      isLocalhost,
      allowProduction,
      canAccess: isLocalhost || allowProduction,
      status: (isLocalhost || allowProduction) ? '✅ 允许访问' : '❌ 不允许访问'
    };

    // 6. 生成建议
    if (!results.environment.ADMIN_PASSWORD.configured) {
      results.recommendations.push({
        level: 'error',
        message: '❌ ADMIN_PASSWORD 未配置',
        solution: '在 .env.local 中添加：ADMIN_PASSWORD=your_password'
      });
    }

    if (!results.cookies.admin_authenticated?.exists) {
      results.recommendations.push({
        level: 'error',
        message: '❌ 认证 Cookie 未设置',
        solution: '这是登录失败的主要原因。可能是：1) 浏览器阻止了 Cookie 2) 登录 API 未正确返回 Cookie'
      });
    }

    if (results.cookies.admin_authenticated?.exists && !results.middleware.tokenValid) {
      results.recommendations.push({
        level: 'error',
        message: '❌ Token 验证失败',
        solution: '1) 检查 ADMIN_AUTH_SECRET 是否一致 2) Token 可能已过期 3) 重新登录'
      });
    }

    if (!isLocalhost && !allowProduction) {
      results.recommendations.push({
        level: 'warning',
        message: '⚠️ 当前不在本地环境',
        solution: '1) 使用 localhost 访问 2) 或设置 ALLOW_ADMIN_IN_PRODUCTION=true'
      });
    }

    if (results.recommendations.length === 0) {
      results.recommendations.push({
        level: 'success',
        message: '✅ 所有检查通过',
        solution: '登录应该可以正常工作'
      });
    }

    // 7. 添加诊断步骤
    results.nextSteps = [
      '1. 检查上面的 recommendations 部分',
      '2. 如果 Cookie 未设置，检查浏览器是否允许 Cookie',
      '3. 打开浏览器开发者工具 → Application → Cookies',
      '4. 查看是否有 admin_authenticated Cookie',
      '5. 如果没有，尝试重新登录并查看 Network 标签中的 Set-Cookie 响应头'
    ];

    return NextResponse.json({
      success: true,
      ...results
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      ...results
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

