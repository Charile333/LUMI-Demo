'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initializeClient, getClobClient } from '@/lib/polymarket';

// 为Window对象扩展ethereum属性的类型定义
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 定义钱包上下文类型
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: any; // 可以是window.ethereum或其他提供者
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
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [isClientInitialized, setIsClientInitialized] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // 初始化时检查连接状态
  useEffect(() => {
    // 检查是否有window.ethereum对象
    if (typeof window !== 'undefined' && window.ethereum) {
      setProvider(window.ethereum);
      
      // 检查是否已经连接
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts: string[]) => {
          if (accounts.length > 0) {
            const account = accounts[0];
            setAddress(account);
            setIsConnected(true);
            
            // 初始化ClobClient
            try {
              // 创建ethers提供者和签名器
              const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = ethProvider.getSigner();

              // 初始化Polymarket客户端 - 浏览器钱包方式
              initializeClient(signer, 0)
                .then(() => {
                  setIsClientInitialized(true);
                  setClientError(null);
                })
                .catch((clientInitError) => {
                  console.error('初始化ClobClient失败:', clientInitError);
                  setClientError('初始化交易客户端失败');
                  setIsClientInitialized(false);
                });
            } catch (clientInitError) {
              console.error('初始化ClobClient失败:', clientInitError);
              setClientError('初始化交易客户端失败');
              setIsClientInitialized(false);
            }
          }
        })
        .catch((error: Error) => {
          console.error('Error checking accounts:', error);
        });
      
      // 监听账户变化
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          setAddress(account);
          setIsConnected(true);
          
          // 重新初始化ClobClient
          try {
            // 创建ethers提供者和签名器
            const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = ethProvider.getSigner();
              
            await initializeClient(signer, 0);
            setIsClientInitialized(true);
            setClientError(null);
          } catch (clientInitError) {
            console.error('重新初始化ClobClient失败:', clientInitError);
            setClientError('重新初始化交易客户端失败');
            setIsClientInitialized(false);
          }
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsClientInitialized(false);
          setClientError(null);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // 清理函数
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // 连接钱包函数
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask');
    }
    
    try {
      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // 初始化ClobClient
          try {
            // 创建ethers提供者和签名器
            const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = ethProvider.getSigner();
            
            // 初始化Polymarket客户端 - 浏览器钱包方式
            await initializeClient(signer, 0);
            setIsClientInitialized(true);
            setClientError(null);
          } catch (clientInitError) {
            console.error('初始化ClobClient失败:', clientInitError);
            setClientError('初始化交易客户端失败');
            setIsClientInitialized(false);
          }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  };

  // 断开钱包连接函数
  const disconnectWallet = async () => {
    // 由于MetaMask没有明确的断开连接API，我们只能清除本地状态
    setAddress(null);
    setIsConnected(false);
    setIsClientInitialized(false);
    setClientError(null);
  };

  // 提供钱包上下文值
  const value = {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    provider,
    isClientInitialized,
    clientError
  };

  // 不再使用WagmiProvider，直接提供我们的钱包上下文
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};