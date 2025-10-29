'use client';

import { useState } from 'react';
import { useWallet } from '@/app/provider';
import { useTranslation } from 'react-i18next';

export default function WalletConnect() {
  const { t } = useTranslation();
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert(t('wallet.installMetaMask') + '\n\n' + t('wallet.visitMetaMask') + ': https://metamask.io');
      window.open('https://metamask.io', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error: any) {
      console.error(t('wallet.connectFailed'), error);
      if (error.code === 4001) {
        alert(t('wallet.userRejected'));
      } else {
        alert(t('wallet.connectFailedMsg') + ': ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {/* 已连接：显示地址 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-green-400">
            {formatAddress(address)}
          </span>
        </div>
        
        {/* 断开连接按钮 */}
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
          title={t('wallet.disconnect')}
        >
          {t('wallet.disconnect')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>{t('wallet.connecting')}</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{t('wallet.connect')}</span>
        </>
      )}
    </button>
  );
}



