'use client';

import { ReactNode } from 'react';

// 简化的钱包提供者组件，暂时只做包装
// 在实际实现钱包功能时会替换为完整的Wagmi配置
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // 这里将来会集成完整的Wagmi + RainbowKit配置
  // 目前仅作为占位符，确保应用可以正常运行
  return <>{children}</>;
}