/**
 * 🎨 订单簿骨架屏
 * 模拟真实订单簿的行级骨架屏
 */

'use client';

interface OrderBookSkeletonProps {
  rows?: number;
}

export function OrderBookSkeleton({ rows = 10 }: OrderBookSkeletonProps) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-zinc-800 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-zinc-800 rounded w-16 animate-pulse"></div>
        </div>
        
        {/* 标签切换 */}
        <div className="flex gap-2">
          <div className="h-8 bg-zinc-800 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-zinc-800 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-zinc-800 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-white/10 bg-zinc-800/30">
        <div className="h-4 bg-zinc-700 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-zinc-700 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-zinc-700 rounded w-16 animate-pulse"></div>
      </div>

      {/* 订单行 - 买单 */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: Math.floor(rows / 2) }).map((_, i) => (
          <div
            key={`bid-${i}`}
            className="grid grid-cols-3 gap-4 px-4 py-2 relative"
          >
            {/* 深度背景条 - 渐变效果 */}
            <div
              className="absolute inset-y-0 right-0 bg-green-500/5"
              style={{ width: `${(Math.floor(rows / 2) - i) * 10}%` }}
            />
            
            {/* 内容 */}
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-20 animate-pulse"></div>
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-16 animate-pulse"></div>
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-16 animate-pulse"></div>
          </div>
        ))}

        {/* 中间价差区域 */}
        <div className="px-4 py-3 bg-amber-500/10 border-y border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-amber-500/20 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-amber-500/30 rounded w-32 animate-pulse"></div>
            <div className="h-5 bg-amber-500/20 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* 订单行 - 卖单 */}
        {Array.from({ length: Math.floor(rows / 2) }).map((_, i) => (
          <div
            key={`ask-${i}`}
            className="grid grid-cols-3 gap-4 px-4 py-2 relative"
          >
            {/* 深度背景条 - 渐变效果 */}
            <div
              className="absolute inset-y-0 right-0 bg-red-500/5"
              style={{ width: `${(i + 1) * 10}%` }}
            />
            
            {/* 内容 */}
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-20 animate-pulse"></div>
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-16 animate-pulse"></div>
            <div className="relative z-10 h-6 bg-zinc-800 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}


