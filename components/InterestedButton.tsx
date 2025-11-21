// ⭐ 感兴趣按钮组件（带实时更新）

'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { getBrowserWalletProvider } from '@/lib/wallet/getBrowserWalletProvider';

interface InterestedButtonProps {
  market: {
    id: number;
    title: string;
    interested_users: number;
  };
  onUpdate?: (newCount: number) => void;
}

export function InterestedButton({ market, onUpdate }: InterestedButtonProps) {
  const { t } = useTranslation();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查用户是否已标记感兴趣
  useEffect(() => {
    const checkInterested = async () => {
      const injectedProvider = getBrowserWalletProvider();
      if (!injectedProvider) return;

      try {
        // ✅ 修复：先检查账户是否已授权，避免 "unknown account #0" 错误
        const accounts = await injectedProvider.request({ method: 'eth_accounts' });
        
        if (!accounts || accounts.length === 0) {
          // 未授权，不设置地址
          return;
        }
        
        const provider = new ethers.providers.Web3Provider(injectedProvider);
        // ✅ 修复：明确指定账户地址创建 signer
        const signer = provider.getSigner(accounts[0]);
        const address = await signer.getAddress();
        setUserAddress(address);

        // 检查是否已标记
        // TODO: 从后端 API 检查
        // const res = await fetch(`/api/markets/${market.id}/interested/check?userAddress=${address}`);
        // const data = await res.json();
        // setIsInterested(data.isInterested);

      } catch (error) {
        // 静默失败，不显示错误（用户可能还没有连接钱包）
        console.log(t('market.interestedButton.checkFailed'), error);
      }
    };

    checkInterested();
  }, [market.id]);

  const handleClick = async () => {
    // 检查钱包
    let injectedProvider = getBrowserWalletProvider();
    if (!injectedProvider) {
      alert(t('market.interestedButton.installWallet'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ 修复：先检查账户是否已授权
      let accounts = await injectedProvider.request({ method: 'eth_accounts' });
      
      // 如果没有账户，再请求连接（用户主动点击按钮，这是允许的）
      if (!accounts || accounts.length === 0) {
        accounts = await injectedProvider.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('钱包连接失败，请重试');
        }
      }
      
      const provider = new ethers.providers.Web3Provider(injectedProvider);
      // ✅ 修复：明确指定账户地址创建 signer，避免 "unknown account #0" 错误
      const signer = provider.getSigner(accounts[0]);
      const address = await signer.getAddress();

      if (isInterested) {
        // 取消感兴趣
        const res = await fetch(`/api/markets/${market.id}/interested`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address })
        });

        const data = await res.json();

        if (data.success) {
          setIsInterested(false);
          
          // 更新计数
          if (onUpdate) {
            onUpdate(market.interested_users - 1);
          }
        } else {
          throw new Error(data.error);
        }

      } else {
        // 标记感兴趣
        const res = await fetch(`/api/markets/${market.id}/interested`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address })
        });

        const data = await res.json();

        if (data.success) {
          setIsInterested(true);
          
          // 显示成功消息
          alert(
            `✅ ${t('market.interestedButton.successTitle')}\n\n${t('market.interestedButton.successMessage')}`
          );
          
          // 更新计数
          if (onUpdate) {
            onUpdate(market.interested_users + 1);
          }
        } else {
          throw new Error(data.error);
        }
      }

    } catch (error: any) {
      console.error(t('market.interestedButton.failed'), error);
      setError(error.message || t('market.interestedButton.failed'));
      alert(`❌ ${error.message || t('market.interestedButton.failed')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 border ${
          isInterested
            ? 'bg-zinc-800/50 text-gray-300 hover:bg-zinc-800 border-zinc-700'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg border-amber-500/30'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>{t('market.interestedButton.processing')}</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isInterested ? (
              <>
                <span className="text-lg">✓</span>
                <span>{t('market.interestedButton.marked')}</span>
              </>
            ) : (
              <>
                <span className="text-lg">⭐</span>
                <span>{t('market.interestedButton.markInterested')}</span>
              </>
            )}
          </span>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}



