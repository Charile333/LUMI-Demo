// 🚀 虚拟滚动组件 - 用于优化长列表性能
// 当列表项超过阈值时自动启用虚拟滚动

'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  threshold?: number; // 超过此数量才启用虚拟滚动
  className?: string;
  gap?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 200,
  containerHeight = 600,
  threshold = 50,
  className = '',
  gap = 16,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [actualHeight, setActualHeight] = useState(containerHeight);

  // 如果项目数量少于阈值，直接渲染所有项目
  const shouldVirtualize = items.length > threshold;

  // 计算可见范围
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * (itemHeight + gap),
      };
    }

    const visibleCount = Math.ceil(actualHeight / (itemHeight + gap));
    const buffer = 3; // 缓冲区，提前渲染一些项目
    const start = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - buffer);
    const end = Math.min(items.length - 1, start + visibleCount + buffer * 2);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * (itemHeight + gap),
    };
  }, [items.length, scrollTop, actualHeight, itemHeight, gap, shouldVirtualize]);

  // 处理滚动
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 更新容器高度
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setActualHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  if (!shouldVirtualize) {
    // 直接渲染所有项目
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  // 虚拟滚动渲染
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* 总高度占位 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见项目 */}
        <div
          style={{
            position: 'absolute',
            top: startIndex * (itemHeight + gap),
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 🎯 简化的虚拟滚动 Hook
export function useVirtualScroll<T>({
  items,
  itemHeight = 200,
  containerHeight = 600,
  threshold = 50,
}: {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  threshold?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [actualHeight, setActualHeight] = useState(containerHeight);

  const shouldVirtualize = items.length > threshold;

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight,
      };
    }

    const visibleCount = Math.ceil(actualHeight / itemHeight);
    const buffer = 3;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(items.length - 1, start + visibleCount + buffer * 2);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight,
    };
  }, [items.length, scrollTop, actualHeight, itemHeight, shouldVirtualize]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  return {
    shouldVirtualize,
    startIndex,
    endIndex,
    totalHeight,
    visibleItems,
    setScrollTop,
    setActualHeight,
  };
}

