// 🚀 动态导入工具 - 用于代码分割和懒加载

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * 创建懒加载组件（带加载状态）
 */
export function createLazyComponent<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading
      ? () => <options.loading />
      : () => (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ),
    ssr: options?.ssr !== false,
  });
}

/**
 * 预定义的懒加载组件
 */
export const LazyComponents = {
  // 图表组件
  Chart: createLazyComponent(() => import('@/components/CrashEventChart'), {
    ssr: false,
  }),

  // 交易组件
  TradeModal: createLazyComponent(() => import('@/components/trading/CompactTradeModal'), {
    ssr: false,
  }),

  // 钱包组件
  WalletConnect: createLazyComponent(() => import('@/components/WalletConnect'), {
    ssr: false,
  }),
};

