// 🔐 中间件 - 保护管理后台
// 增强安全措施：Token 验证
// 注意：IP 锁定检查在 API 路由中完成（因为 Edge Runtime 内存不共享）

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/admin/auth';

export function middleware(request: NextRequest) {
  // 保护所有 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
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

