// 🔐 中间件 - 保护管理后台
// 增强安全措施：Token 验证 + 本地访问限制
// 注意：IP 锁定检查在 API 路由中完成（因为 Edge Runtime 内存不共享）

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken, getClientIP } from '@/lib/admin/auth';

/**
 * 检查是否允许访问管理后台
 * 只在本地环境允许访问
 */
function isAllowedToAccessAdmin(request: NextRequest): boolean {
  // 检查环境变量是否允许生产环境访问
  const allowProduction = process.env.ALLOW_ADMIN_IN_PRODUCTION === 'true';
  
  // 如果明确允许生产环境访问，则允许访问
  if (allowProduction) {
    return true;
  }
  
  // 检查是否在本地环境
  const hostname = request.nextUrl.hostname;
  
  // 检查是否是 localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return true;
  }
  
  // 检查是否是私有 IP 地址（局域网）
  // 192.168.x.x
  if (hostname.startsWith('192.168.')) {
    return true;
  }
  
  // 10.x.x.x
  if (hostname.match(/^10\./)) {
    return true;
  }
  
  // 172.16.0.0 - 172.31.255.255
  if (hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
    return true;
  }
  
  // 其他情况（生产环境）不允许访问
  return false;
}

export function middleware(request: NextRequest) {
  // 保护所有 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 🔒 检查是否允许访问（只在本地环境允许）
    if (!isAllowedToAccessAdmin(request)) {
      // 在生产环境返回 404，隐藏管理后台的存在
      return NextResponse.json(
        { 
          error: 'Not Found',
          message: 'The requested page does not exist.'
        },
        { status: 404 }
      );
    }
    
    // 排除登录页面本身
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // 验证认证 token
    const authCookie = request.cookies.get('admin_authenticated');
    
    console.log('🔍 中间件检查:', {
      path: request.nextUrl.pathname,
      hasCookie: !!authCookie,
      cookieValue: authCookie ? authCookie.value.substring(0, 20) + '...' : 'none'
    });
    
    if (!authCookie || !verifyAuthToken(authCookie.value)) {
      console.log('❌ 认证失败，重定向到登录页');
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ 认证成功，允许访问');
  }
  
  // 保护所有 /api/admin 路径
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // 🔒 检查是否允许访问（只在本地环境允许）
    if (!isAllowedToAccessAdmin(request)) {
      // 在生产环境返回 404，隐藏管理 API 的存在
      return NextResponse.json(
        { 
          error: 'Not Found',
          message: 'The requested API endpoint does not exist.'
        },
        { status: 404 }
      );
    }
    
    // 排除登录、登出和调试 API（这些不需要认证）
    if (request.nextUrl.pathname === '/api/admin/auth/login' ||
        request.nextUrl.pathname === '/api/admin/auth/logout' ||
        request.nextUrl.pathname === '/api/admin/debug' ||
        request.nextUrl.pathname === '/api/admin/full-debug' ||
        request.nextUrl.pathname === '/api/admin/check-auth') {
      return NextResponse.next();
    }
    
    // 验证认证 token
    const authHeader = request.headers.get('Authorization');
    const cookieAuth = request.cookies.get('admin_authenticated');
    
    // 检查认证（支持 Header 或 Cookie）
    // 注意：Header 认证需要 ADMIN_API_SECRET，这里只检查 Cookie
    const isAuthenticated = cookieAuth && verifyAuthToken(cookieAuth.value);
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - 需要管理员权限' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};

