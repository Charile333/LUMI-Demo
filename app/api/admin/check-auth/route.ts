// 🔍 检查认证状态 API
// 用于调试 Cookie 和 Token 问题

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('admin_authenticated');
    
    if (!authCookie) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Cookie 未找到',
        debug: {
          allCookies: Array.from(request.cookies.getAll()).map(c => c.name),
          cookiePath: request.nextUrl.pathname,
        }
      });
    }

    const isValid = verifyAuthToken(authCookie.value);

    return NextResponse.json({
      success: true,
      authenticated: isValid,
      message: isValid ? '认证有效' : 'Token 无效',
      debug: {
        hasCookie: true,
        tokenPreview: authCookie.value.substring(0, 20) + '...',
        tokenValid: isValid,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

