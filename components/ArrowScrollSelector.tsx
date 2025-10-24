import React, { useRef, useState, useEffect } from 'react';

interface ArrowScrollSelectorProps {
  items: string[];
  selectedItem: string;
  onItemSelect: (item: string) => void;
  itemClass?: string;
  selectedItemClass?: string;
  unselectedItemClass?: string;
  containerClass?: string;
  visibleCount?: number;
  scrollAmount?: number;
  showArrowsAlways?: boolean;
}

const ArrowScrollSelector: React.FC<ArrowScrollSelectorProps> = ({
  items,
  selectedItem,
  onItemSelect,
  itemClass = 'px-3 py-1.5 whitespace-nowrap rounded-full text-sm font-medium',
  selectedItemClass = 'bg-blue-600 text-white',
  unselectedItemClass = 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700',
  containerClass = '',
  visibleCount = 6,
  scrollAmount = 300,
  showArrowsAlways = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 检查是否需要显示箭头
  const checkArrows = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkArrows);
    // 初始检查
    checkArrows();

    return () => {
      container.removeEventListener('scroll', checkArrows);
    };
  }, [items]);

  // 监听窗口大小变化
  useEffect(() => {
    window.addEventListener('resize', checkArrows);
    return () => {
      window.removeEventListener('resize', checkArrows);
    };
  }, []);

  // 滚动到左侧
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 滚动到右侧
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 渲染箭头按钮
  const renderArrow = (direction: 'left' | 'right', onClick: () => void) => {
    const shouldShow = direction === 'left' ? showLeftArrow : showRightArrow;
    
    if (!showArrowsAlways && !shouldShow) return null;

    return (
      <button
        onClick={onClick}
        disabled={!shouldShow}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${shouldShow ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'}`}
        aria-label={`Scroll ${direction}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${direction === 'left' ? '' : 'transform rotate-180'}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`relative flex items-center ${containerClass}`}>
      {/* 左箭头 */}
      {renderArrow('left', scrollLeft)}
      
      {/* 可滚动内容容器 */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center space-x-2 overflow-x-auto scrollbar-hide scroll-smooth py-1 min-w-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onWheel={(e) => {
          // 允许水平滚动，阻止垂直滚动影响
          if (containerRef.current) {
            containerRef.current.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onItemSelect(item)}
            className={`${itemClass} transition-all ${selectedItem === item ? selectedItemClass : unselectedItemClass}`}
            aria-pressed={selectedItem === item}
          >
            {item === 'all' ? 'All' : item}
          </button>
        ))}
      </div>
      
      {/* 右箭头 */}
      {renderArrow('right', scrollRight)}
    </div>
  );
};

export default ArrowScrollSelector;