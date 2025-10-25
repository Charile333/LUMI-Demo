'use client';

import { ReactNode } from 'react';
import WalletProvider from './provider';
import { CreateTopicButton } from '@/components/CreateTopicButton';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <WalletProvider>
      {children}
      <CreateTopicButton />
    </WalletProvider>
  );
}