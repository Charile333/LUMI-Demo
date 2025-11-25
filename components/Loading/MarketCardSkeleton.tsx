/**
 * 🎨 市场卡片骨架屏
 * 精细的骨架屏，模拟真实市场卡片布局
 */

'use client';

interface MarketCardSkeletonProps {
  count?: number;
}

export function MarketCardSkeleton({ count = 1 }: MarketCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-black rounded-2xl shadow-xl overflow-hidden border border-zinc-800 animate-pulse"
        >
          {/* 卡片头部 */}
          <div className="p-5">
            {/* 标题和标签 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-12"></div>
            </div>

            {/* 标签区 */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="h-6 bg-zinc-800 rounded w-20"></div>
              <div className="h-6 bg-zinc-800 rounded w-16"></div>
              <div className="h-6 bg-zinc-800 rounded w-24"></div>
            </div>

            {/* 价格区域 */}
            <div className="mb-5">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-zinc-800 rounded w-24 mb-2"></div>
                  {/* 价格数字 - 闪烁效果 */}
                  <div className="relative">
                    <div className="h-12 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded w-32 bg-[length:200%_100%] animate-shimmer"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-zinc-800 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded w-20"></div>
                </div>
              </div>
            </div>

            {/* 交易按钮 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-12 bg-zinc-800 rounded-lg"></div>
              <div className="h-12 bg-zinc-800 rounded-lg"></div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-zinc-800 rounded w-16"></div>
                <div className="h-4 bg-zinc-800 rounded w-12"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}







