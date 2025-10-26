'use client';

import { useEffect } from 'react';

/**
 * 抑制 HMR WebSocket 错误
 * 这些错误在使用自定义服务器时是正常的，不影响功能
 */
export function SuppressHMRErrors() {
  useEffect(() => {
    // 保存原始的 console.error
    const originalError = console.error;
    
    // 覆盖 console.error 以过滤 HMR 相关的错误
    console.error = (...args: any[]) => {
      // 检查是否是 HMR WebSocket 错误
      const errorMessage = args[0]?.toString() || '';
      
      if (
        errorMessage.includes('webpack-hmr') ||
        errorMessage.includes('_next/webpack-hmr')
      ) {
        // 静默这个错误
        return;
      }
      
      // 其他错误正常显示
      originalError.apply(console, args);
    };
    
    // 清理函数
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return null;
}

