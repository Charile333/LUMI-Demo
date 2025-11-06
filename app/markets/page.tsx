'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 市场列表页 - 重定向到默认分类页
 * 市场分类页就是我们的市场列表，不需要单独的市场列表页
 */
export default function MarketsPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到默认分类页（汽车市场）
    router.replace('/markets/automotive');
  }, [router]);

  // 显示加载状态（重定向过程中）
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <p className="text-gray-400">正在跳转到市场列表...</p>
      </div>
    </div>
  );
}
