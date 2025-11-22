/**
 * 🎨 价格骨架屏
 * 用于价格加载时的闪烁占位符
 */

'use client';

interface PriceSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'percentage' | 'currency';
}

export function PriceSkeleton({ 
  size = 'md', 
  variant = 'percentage' 
}: PriceSkeletonProps) {
  const sizeClasses = {
    sm: 'h-6 w-16',
    md: 'h-8 w-24',
    lg: 'h-12 w-32'
  };

  const baseClasses = `bg-gradient-to-r from-zinc-800 via-amber-500/20 to-zinc-800 rounded bg-[length:200%_100%] animate-shimmer ${sizeClasses[size]}`;

  return (
    <div className={baseClasses} />
  );
}

/**
 * 百分比价格骨架屏
 */
export function PercentagePriceSkeleton() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-12 w-20 bg-gradient-to-r from-zinc-800 via-amber-500/20 to-zinc-800 rounded bg-[length:200%_100%] animate-shimmer"></div>
      <div className="h-6 w-4 bg-zinc-800 rounded animate-pulse"></div>
    </div>
  );
}

/**
 * 货币价格骨架屏
 */
export function CurrencyPriceSkeleton() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-4 w-3 bg-zinc-800 rounded animate-pulse"></div>
      <div className="h-8 w-24 bg-gradient-to-r from-zinc-800 via-amber-500/20 to-zinc-800 rounded bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  );
}


