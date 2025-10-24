// 🚪 管理员登出 API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: '已登出'
  });

  // 删除认证 cookie
  response.cookies.delete('admin_authenticated');

  return response;
}


