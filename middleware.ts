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
  // 检查是否在本地环境
  const hostname = request.nextUrl.hostname;
  const isLocalhost = 
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.') ||
    hostname.startsWith('172.17.') ||
    hostname.startsWith('172.18.') ||
    hostname.startsWith('172.19.') ||
    hostname.startsWith('172.20.') ||
    hostname.startsWith('172.21.') ||
    hostname.startsWith('172.22.') ||
    hostname.startsWith('172.23.') ||
    hostname.startsWith('172.24.') ||
    hostname.startsWith('172.25.') ||
    hostname.startsWith('172.26.') ||
    hostname.startsWith('172.27.') ||
    hostname.startsWith('172.28.') ||
    hostname.startsWith('172.29.') ||
    hostname.startsWith('172.30.') ||
    hostname.startsWith('172.31.');
  
  // 检查环境变量是否允许生产环境访问
  const allowProduction = process.env.ALLOW_ADMIN_IN_PRODUCTION === 'true';
  
  // 如果在本地环境，或者明确允许生产环境访问，则允许访问
  return isLocalhost || allowProduction;
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
    if (!authCookie || !verifyAuthToken(authCookie.value)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
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
    
    // 排除登录和登出 API（这些不需要认证）
    if (request.nextUrl.pathname === '/api/admin/auth/login' ||
        request.nextUrl.pathname === '/api/admin/auth/logout') {
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

