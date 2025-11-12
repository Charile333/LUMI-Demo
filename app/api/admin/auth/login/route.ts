// 🔐 管理员登录 API
// 增强安全措施：登录尝试限制、IP 锁定、安全 token

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIP,
  isIPBlocked,
  recordLoginAttempt,
  generateAuthToken,
  setAuthCookie,
  logLoginAttempt
} from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 获取客户端 IP
    const clientIP = getClientIP(request);

    // 检查 IP 是否被锁定
    if (isIPBlocked(clientIP)) {
      logLoginAttempt(clientIP, false, 'IP被锁定（过多失败尝试）');
      return NextResponse.json(
        {
          success: false,
          error: '登录尝试过多，IP 已被锁定 15 分钟。请稍后再试。'
        },
        { status: 429 } // Too Many Requests
      );
    }

    // 验证密码
    const correctPassword = process.env.ADMIN_PASSWORD;
    
    // 生产环境必须配置密码
    if (!correctPassword) {
      console.error('❌ ADMIN_PASSWORD 环境变量未配置！');
      logLoginAttempt(clientIP, false, '管理员密码未配置');
      return NextResponse.json(
        {
          success: false,
          error: '系统配置错误，请联系管理员'
        },
        { status: 500 }
      );
    }

    const passwordMatch = password === correctPassword;

    // 记录登录尝试
    const attemptResult = recordLoginAttempt(clientIP, passwordMatch);

    if (passwordMatch) {
      // 登录成功
      const token = generateAuthToken();
      
      const response = NextResponse.json({
        success: true,
        message: '登录成功'
      });

      // 设置安全的认证 cookie
      response.cookies.set('admin_authenticated', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 改为 lax 以允许跳转后访问
        maxAge: 60 * 60 * 24, // 24 小时
        path: '/' // 改为根路径，确保整个应用都能访问
      });
      
      console.log('✅ Cookie 已设置:', {
        name: 'admin_authenticated',
        value: token.substring(0, 20) + '...',
        path: '/',
        sameSite: 'lax',
        httpOnly: true
      });

      logLoginAttempt(clientIP, true);
      return response;
    } else {
      // 密码错误
      const errorMessage = attemptResult.blocked
        ? `密码错误。登录尝试过多，IP 已被锁定 15 分钟。请稍后再试。`
        : `密码错误。剩余尝试次数：${attemptResult.remainingAttempts}`;

      logLoginAttempt(clientIP, false, '密码错误');

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          remainingAttempts: attemptResult.remainingAttempts
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('登录 API 错误:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请重试' },
      { status: 500 }
    );
  }
}


