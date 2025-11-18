'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTranslation } from '@/hooks/useTranslation';

export default function WalletConnect() {
  const { t } = useTranslation();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // 注意：这里使用 mounted 和 authenticationStatus 来确保 SSR 兼容
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1m18-4l-4-4m0 0l-4 4m4-4v12"></path>
                    </svg>
                    <span>{t('wallet.connect')}</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    ⚠️ {t('wallet.switchNetwork')}
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* 网络切换按钮 */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                    title={t('wallet.switchNetworkTooltip')}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? t('wallet.chainIcon')}
                            src={chain.iconUrl}
                            style={{ width: 20, height: 20 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-sm">{chain.name}</span>
                  </button>

                  {/* 账户信息按钮 */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg hover:bg-green-500/30 transition-colors duration-200"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono text-green-400">
                      {account.displayName}
                    </span>
                    {account.displayBalance && (
                      <span className="text-sm text-gray-400">
                        ({account.displayBalance})
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
