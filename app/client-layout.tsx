'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WagmiProviderWrapper from './wagmi-provider';
import WalletProvider from './provider-wagmi';
import { CreateTopicButton } from '@/components/CreateTopicButton';
import { SuppressHMRErrors } from './suppress-hmr-errors';
import I18nProvider from '@/components/I18nProvider';
import { ToastProvider } from '@/components/Toast';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // 🔧 防止 WalletConnect 重复警告（仅在开发模式）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        // 过滤 WalletConnect 重复初始化警告
        if (
          args[0]?.includes?.('WalletConnect Core is already initialized') ||
          args[0]?.includes?.('MaxListenersExceededWarning')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      return () => {
        console.warn = originalWarn;
      };
    }
  }, []);
  
  // 只在市场相关页面显示悬浮按钮（不在SOON页面显示）
  const showCreateButton = pathname !== '/' && (
    pathname?.startsWith('/markets') ||
    pathname?.startsWith('/market/') ||
    pathname?.startsWith('/trade/')
  );
  
  return (
    <I18nProvider>
      <ToastProvider>
        <WagmiProviderWrapper>
          <WalletProvider>
            <SuppressHMRErrors />
            {children}
            {showCreateButton && <CreateTopicButton />}
          </WalletProvider>
        </WagmiProviderWrapper>
      </ToastProvider>
    </I18nProvider>
  );
}