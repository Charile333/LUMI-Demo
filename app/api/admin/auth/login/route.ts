// 🔐 管理员登录 API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 验证密码
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123'; // 默认密码（请修改！）

    if (password === correctPassword) {
      // 登录成功
      const response = NextResponse.json({
        success: true,
        message: '登录成功'
      });

      // 设置认证 cookie（7 天有效）
      response.cookies.set('admin_authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 天
      });

      return response;
    } else {
      // 密码错误
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


