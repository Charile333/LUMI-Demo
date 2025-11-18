'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/lib/wagmi/config';
import { useTranslation } from '@/hooks/useTranslation';

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

// ✅ 内部组件：处理语言变化
function RainbowKitProviderWithLocale({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  // ✅ 将 i18n 语言代码映射到 RainbowKit 的 locale
  // RainbowKit 支持: 'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru', 'tr', 'vi'
  const getRainbowKitLocale = (lang: string): 'en' | 'zh' => {
    if (lang === 'zh' || lang.startsWith('zh')) {
      return 'zh';
    }
    return 'en'; // 默认英文
  };
  
  const locale = getRainbowKitLocale(i18n.language || 'en');
  
  return (
    <RainbowKitProvider
      key={locale} // ✅ 使用 key 强制重新渲染以更新 locale
      locale={locale}
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
  );
}

export default function WagmiProviderWrapper({ children }: WagmiProviderWrapperProps) {
  // WagmiProvider 和 RainbowKitProvider 都支持 SSR
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={getQueryClient()}>
        <RainbowKitProviderWithLocale>
          {children}
        </RainbowKitProviderWithLocale>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

