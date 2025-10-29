'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import WalletProvider from './provider';
import { CreateTopicButton } from '@/components/CreateTopicButton';
import { SuppressHMRErrors } from './suppress-hmr-errors';
import I18nProvider from '@/components/I18nProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // 只在市场相关页面显示悬浮按钮（不在SOON页面显示）
  const showCreateButton = pathname !== '/' && (
    pathname?.startsWith('/markets') ||
    pathname?.startsWith('/market/') ||
    pathname?.startsWith('/trade/')
  );
  
  return (
    <I18nProvider>
      <WalletProvider>
        <SuppressHMRErrors />
        {children}
        {showCreateButton && <CreateTopicButton />}
      </WalletProvider>
    </I18nProvider>
  );
}