/**
 * 🎨 LUMI 品牌加载动画组件
 * 替代单调的 spinner，提供品牌化的加载体验
 */

'use client';

import React from 'react';

interface LUMILoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showText?: boolean;
}

export function LUMILoader({ 
  size = 'md', 
  text = '加载中...',
  showText = true 
}: LUMILoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* LUMI Logo 旋转动画 */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* 外圈旋转环 */}
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        
        {/* 内圈反向旋转 */}
        <div className="absolute inset-2 border-3 border-orange-500/20 rounded-full"></div>
        <div className="absolute inset-2 border-3 border-transparent border-t-orange-500 rounded-full animate-spin-reverse"></div>
        
        {/* 中心 L 字母 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-amber-500 font-bold text-xl animate-pulse">L</span>
        </div>
      </div>
      
      {/* 加载文字（打字机效果） */}
      {showText && (
        <div className="text-sm text-gray-400 font-mono">
          <TypewriterText text={text} />
        </div>
      )}
    </div>
  );
}

/**
 * 打字机效果文字组件
 */
function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  // 重置动画
  React.useEffect(() => {
    if (currentIndex === text.length) {
      const timer = setTimeout(() => {
        setDisplayedText('');
        setCurrentIndex(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text.length]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

