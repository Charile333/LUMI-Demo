'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectorClient } from 'wagmi';
import { ethers } from 'ethers';
import { initializeClient } from '@/lib/polymarket';

// 定义钱包上下文类型（保持与原有接口兼容）
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: any;
  isClientInitialized: boolean;
  clientError: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: connectorClient } = useConnectorClient({ connector });
  
  const [isClientInitialized, setIsClientInitialized] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

  // 初始化 ClobClient
  const initClobClient = useCallback(async (signer: ethers.Signer) => {
    try {
      await initializeClient(signer, 0);
      setIsClientInitialized(true);
      setClientError(null);
      console.log('✅ ClobClient 初始化成功');
    } catch (error: any) {
      console.error('❌ ClobClient 初始化失败:', error);
      setClientError('初始化交易客户端失败');
      setIsClientInitialized(false);
    }
  }, []);

  // 当钱包连接时，初始化 ClobClient
  useEffect(() => {
    if (isConnected && address && connector) {
      const initProvider = async () => {
        try {
          let providerToUse: any = null;
          
          // 方法1: 从 connectorClient 获取 provider（推荐方式）
          if (connectorClient) {
            // connectorClient 可能直接是 provider 或者有 account 属性
            if ('account' in connectorClient && connectorClient.account) {
              // 这是 viem 的客户端，需要转换为 ethers provider
              // 尝试从 connector 获取原始 provider
              if ('getProvider' in connector && typeof connector.getProvider === 'function') {
                try {
                  providerToUse = await connector.getProvider();
                } catch (e) {
                  console.log('从 connector 获取 provider 失败，尝试其他方法');
                }
              }
            }
          }
          
          // 方法2: 从 connector 获取 provider
          if (!providerToUse && connector) {
            if ('getProvider' in connector && typeof connector.getProvider === 'function') {
              try {
                providerToUse = await connector.getProvider();
              } catch (e) {
                console.log('从 connector.getProvider 获取失败');
              }
            }
          }
          
          // 方法3: 根据 connector 类型使用不同的获取方式
          if (!providerToUse) {
            // MetaMask - 处理多钱包共存的情况
            if (connector.id === 'injected' && connector.name === 'MetaMask') {
              // 优先查找纯 MetaMask provider
              if (window.ethereum?.isMetaMask && !window.ethereum?.isOkxWallet && !window.ethereum?.isCoinbaseWallet) {
                providerToUse = window.ethereum;
              }
              // 从 providers 数组中查找 MetaMask
              else if (window.ethereum?.providers?.length > 0) {
                const metaMaskProvider = window.ethereum.providers.find(
                  (p: any) => p.isMetaMask && !p.isOkxWallet && !p.isCoinbaseWallet
                );
                if (metaMaskProvider) {
                  providerToUse = metaMaskProvider;
                }
              }
            }
            // OKX Wallet
            else if (connector.id === 'injected' && connector.name === 'OKX Wallet') {
              if (typeof window !== 'undefined') {
                if ((window as any).okxwallet) {
                  providerToUse = (window as any).okxwallet;
                } else if (window.ethereum?.isOkxWallet) {
                  providerToUse = window.ethereum;
                } else if (window.ethereum?.providers?.length > 0) {
                  const okxProvider = window.ethereum.providers.find(
                    (p: any) => p.isOkxWallet
                  );
                  if (okxProvider) {
                    providerToUse = okxProvider;
                  }
                }
              }
            }
            // Coinbase Wallet
            else if (connector.id === 'coinbaseWalletSDK' && typeof window !== 'undefined') {
              if ((window as any).coinbaseWalletExtension) {
                providerToUse = (window as any).coinbaseWalletExtension;
              } else if (window.ethereum?.isCoinbaseWallet) {
                providerToUse = window.ethereum;
              } else if (window.ethereum?.providers?.length > 0) {
                const coinbaseProvider = window.ethereum.providers.find(
                  (p: any) => p.isCoinbaseWallet
                );
                if (coinbaseProvider) {
                  providerToUse = coinbaseProvider;
                }
              }
            }
            // WalletConnect - 需要特殊处理
            else if (connector.id === 'walletConnect') {
              // WalletConnect 的 provider 需要通过 connector 获取
              if ('getProvider' in connector && typeof connector.getProvider === 'function') {
                try {
                  providerToUse = await connector.getProvider();
                } catch (e) {
                  console.error('WalletConnect provider 获取失败:', e);
                }
              }
            }
            // 其他钱包，尝试 window.ethereum
            else if (typeof window !== 'undefined' && window.ethereum) {
              providerToUse = window.ethereum;
            }
          }
          
          if (providerToUse) {
            const ethProvider = new ethers.providers.Web3Provider(providerToUse);
            const signer = ethProvider.getSigner();
            setProvider(providerToUse);
            await initClobClient(signer);
          } else {
            console.warn('⚠️ 无法获取钱包 provider，connector:', connector.id);
            setClientError('无法获取钱包 provider');
          }
        } catch (error: any) {
          console.error('❌ 初始化 provider 失败:', error);
          setClientError('初始化钱包 provider 失败: ' + (error.message || '未知错误'));
        }
      };
      
      initProvider();
    } else {
      setIsClientInitialized(false);
      setClientError(null);
      setProvider(null);
    }
  }, [isConnected, address, connector, connectorClient, initClobClient]);

  // 连接钱包函数（兼容原有接口）
  const connectWallet = useCallback(async () => {
    if (connectors.length === 0) {
      throw new Error('没有可用的钱包连接器');
    }
    
    // 优先使用 MetaMask，然后是 Coinbase，最后是其他
    const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
    const connectorToUse = metaMaskConnector || coinbaseConnector || connectors[0];
    
    connect({ connector: connectorToUse });
  }, [connect, connectors]);

  // 断开钱包连接函数（兼容原有接口）
  const disconnectWallet = useCallback(async () => {
    disconnect();
    setIsClientInitialized(false);
    setClientError(null);
    setProvider(null);
  }, [disconnect]);

  const value: WalletContextType = {
    address: address || null,
    isConnected,
    connectWallet,
    disconnectWallet,
    provider,
    isClientInitialized,
    clientError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

