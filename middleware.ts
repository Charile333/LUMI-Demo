// 🔐 中间件 - 保护管理后台

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 保护所有 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 检查认证 cookie
    const authCookie = request.cookies.get('admin_authenticated');
    
    // 排除登录页面本身
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // 如果未认证，重定向到登录页
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // 保护所有 /api/admin 路径
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // 排除登录和登出 API（这些不需要认证）
    if (request.nextUrl.pathname === '/api/admin/auth/login' ||
        request.nextUrl.pathname === '/api/admin/auth/logout') {
      return NextResponse.next();
    }
    
    const authHeader = request.headers.get('Authorization');
    const cookieAuth = request.cookies.get('admin_authenticated');
    
    // 检查认证（支持 Header 或 Cookie）
    const isAuthenticated = 
      authHeader === `Bearer ${process.env.ADMIN_API_SECRET}` ||
      cookieAuth?.value === 'true';
    
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

