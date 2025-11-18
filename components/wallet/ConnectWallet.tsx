'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from '@/hooks/useTranslation';

export function ConnectWallet() {
  const { t } = useTranslation();
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  
  // 检查钱包连接
  useEffect(() => {
    checkConnection();
    
    // 监听账户变化
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);
  
  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          
          // 获取余额
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));
        }
      } catch (error) {
        console.error('检查连接失败:', error);
      }
    }
  };
  
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setChainId(null);
      setBalance('0');
    } else {
      setAccount(accounts[0]);
      checkConnection();
    }
  };
  
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert(`${t('wallet.installMetaMask')}\n\n${t('wallet.visitMetaMaskSite')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 请求连接
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      
      setAccount(address);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(balance));
      
      console.log('✅ 钱包已连接:', address);
    } catch (error: any) {
      console.error('连接失败:', error);
      alert(t('wallet.connectFailedError', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };
  
  const switchToAmoy = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002的16进制
      });
    } catch (error: any) {
      // 如果链未添加，则添加它
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'POL',
                symbol: 'POL',
                decimals: 18
              },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
          });
        } catch (addError) {
          console.error('添加网络失败:', addError);
        }
      }
    }
  };
  
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 80002: return t('wallet.amoy');
      case 80001: return t('wallet.mumbai');
      case 137: return t('wallet.polygon');
      case 1: return t('wallet.ethereum');
      case 31337: return t('wallet.hardhatLocal');
      default: return `${t('wallet.unknown')} (${chainId})`;
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      {account ? (
        <>
          {/* 余额显示 */}
          <div className="hidden md:block text-sm text-gray-600">
            {parseFloat(balance).toFixed(4)} POL
          </div>
          
          {/* 网络显示 */}
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            chainId === 80002 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {chainId ? getNetworkName(chainId) : t('wallet.unknown')}
          </div>
          
          {/* 切换网络按钮 */}
          {chainId !== 80002 && (
            <button
              onClick={switchToAmoy}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium transition"
            >
              {t('wallet.switchToAmoy')}
            </button>
          )}
          
          {/* 账户地址 */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-mono">
              {account.substring(0, 6)}...{account.substring(38)}
            </span>
          </div>
        </>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center gap-2"
        >
              {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {t('wallet.connectingMetaMask')}
            </>
          ) : (
            <>
              🦊 {t('wallet.connect')}
            </>
          )}
        </button>
      )}
    </div>
  );
}










