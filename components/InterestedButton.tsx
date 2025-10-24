// ⭐ 感兴趣按钮组件（带实时更新）

'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface InterestedButtonProps {
  market: {
    id: number;
    title: string;
    interested_users: number;
  };
  onUpdate?: (newCount: number) => void;
}

export function InterestedButton({ market, onUpdate }: InterestedButtonProps) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查用户是否已标记感兴趣
  useEffect(() => {
    const checkInterested = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        // 检查是否已标记
        // TODO: 从后端 API 检查
        // const res = await fetch(`/api/markets/${market.id}/interested/check?userAddress=${address}`);
        // const data = await res.json();
        // setIsInterested(data.isInterested);

      } catch (error) {
        console.error('检查失败:', error);
      }
    };

    checkInterested();
  }, [market.id]);

  const handleClick = async () => {
    // 检查钱包
    if (!window.ethereum) {
      alert('请先安装 MetaMask 或其他 Web3 钱包');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 连接钱包
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
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
            `✅ 已标记感兴趣！\n\n` +
            `当市场达到激活条件后，系统会自动激活。\n` +
            `激活后我们会通知您。`
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
      console.error('操作失败:', error);
      setError(error.message || '操作失败');
      alert(`❌ ${error.message || '操作失败'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 ${
          isInterested
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>处理中...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isInterested ? (
              <>
                <span className="text-lg">✓</span>
                <span>已标记感兴趣</span>
              </>
            ) : (
              <>
                <span className="text-lg">⭐</span>
                <span>我对这个市场感兴趣</span>
              </>
            )}
          </span>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
}



