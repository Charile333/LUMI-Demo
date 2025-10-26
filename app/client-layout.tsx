'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import WalletProvider from './provider';
import { CreateTopicButton } from '@/components/CreateTopicButton';
import { SuppressHMRErrors } from './suppress-hmr-errors';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // 只在市场相关页面显示悬浮按钮（不在SOON页面显示）
  const showCreateButton = pathname !== '/' && (
    pathname?.startsWith('/markets') ||
    pathname?.startsWith('/market/') ||
    pathname?.startsWith('/trade/') ||
    pathname?.startsWith('/automotive') ||
    pathname?.startsWith('/tech-ai') ||
    pathname?.startsWith('/economy-social') ||
    pathname?.startsWith('/sports-gaming') ||
    pathname?.startsWith('/entertainment-culture') ||
    pathname?.startsWith('/science-education') ||
    pathname?.startsWith('/crypto-web3')
  );
  
  return (
    <WalletProvider>
      <SuppressHMRErrors />
      {children}
      {showCreateButton && <CreateTopicButton />}
    </WalletProvider>
  );
}