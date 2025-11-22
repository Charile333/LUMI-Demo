// 🖼️ 优化的图片组件 - 自动使用 Next.js Image 并添加懒加载

'use client';

import Image from 'next/image';
import { useImageLazyLoad } from '@/hooks/useLazyLoad';
import { useState } from 'react';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function ImageOptimized({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  placeholder = 'empty',
  blurDataURL,
}: ImageOptimizedProps) {
  const { ref, imageSrc, isLoading, error } = useImageLazyLoad(priority ? src : undefined);
  const [imgError, setImgError] = useState(false);

  // 如果设置了 priority，直接加载
  const finalSrc = priority ? src : imageSrc;

  // 错误处理
  if (error || imgError) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">图片加载失败</span>
      </div>
    );
  }

  // 加载中状态
  if (!priority && isLoading) {
    return (
      <div
        ref={ref}
        className={`bg-gray-800 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  // 如果没有 src，不渲染
  if (!finalSrc) {
    return (
      <div
        ref={ref}
        className={`bg-gray-800 ${className}`}
        style={{ width, height }}
      />
    );
  }

  // 使用 Next.js Image 组件
  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={() => setImgError(true)}
    />
  );
}

