'use client';

import { ReactNode } from 'react';
import WalletProvider from './provider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <WalletProvider>{children}</WalletProvider>;
}