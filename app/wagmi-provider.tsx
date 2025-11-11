'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/lib/wagmi/config';

// 创建 QueryClient 实例（使用单例模式避免重复创建）
let queryClient: QueryClient | undefined;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // 30秒缓存
          staleTime: 30_000,
          // 失败重试
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}

interface WagmiProviderWrapperProps {
  children: ReactNode;
}

export default function WagmiProviderWrapper({ children }: WagmiProviderWrapperProps) {
  // WagmiProvider 和 RainbowKitProvider 都支持 SSR
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={getQueryClient()}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#f59e0b', // 琥珀色（与 LUMI 主题一致）
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          showRecentTransactions={true}
          coolMode={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

