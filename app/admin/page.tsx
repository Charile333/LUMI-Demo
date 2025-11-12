// 🏠 管理后台首页
// 自动重定向到市场管理页面

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    // 自动跳转到市场管理页面
    router.push('/admin/markets');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl">跳转中...</p>
      </div>
    </div>
  );
}

