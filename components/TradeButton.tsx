// 🎯 交易按钮组件（支持自动激活）

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TradeButtonProps {
  market: {
    id: number;
    title: string;
    blockchain_status: string;
    condition_id?: string;
  };
  className?: string;
}

export function TradeButton({ market, className = '' }: TradeButtonProps) {
  const router = useRouter();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);

  const handleTrade = async () => {
    try {
      // 1. 检查市场状态
      if (market.blockchain_status === 'created') {
        // 已激活，直接跳转交易页面
        router.push(`/trade/${market.id}`);
        return;
      }

      if (market.blockchain_status === 'creating') {
        // 正在激活中，等待
        alert('⏳ 市场正在激活中，请稍候...');
        return;
      }

      // 2. 市场未激活，询问用户
      const userConfirmed = confirm(
        `🚀 激活市场：${market.title}\n\n` +
        `此市场尚未在区块链上激活。\n` +
        `激活大约需要 30 秒。\n\n` +
        `要现在激活并交易吗？`
      );

      if (!userConfirmed) {
        return;
      }

      // 3. 开始激活
      setIsActivating(true);
      setError('');

      // 启动倒计时
      let timeLeft = 30;
      const timer = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      console.log('🚀 开始激活市场...');

      // 4. 调用激活 API
      const response = await fetch(`/api/admin/markets/${market.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      clearInterval(timer);

      if (!data.success) {
        throw new Error(data.error || '激活失败');
      }

      console.log('✅ 市场激活成功！');
      console.log('Condition ID:', data.conditionId);
      console.log('交易哈希:', data.txHash);

      // 5. 更新本地状态
      market.blockchain_status = 'created';
      market.condition_id = data.conditionId;

      // 6. 显示成功消息
      alert(
        `✅ 市场激活成功！\n\n` +
        `Condition ID: ${data.conditionId.substring(0, 10)}...\n` +
        `交易哈希: ${data.txHash.substring(0, 10)}...\n\n` +
        `即将跳转到交易页面...`
      );

      // 7. 跳转到交易页面
      setTimeout(() => {
        router.push(`/trade/${market.id}`);
      }, 1000);

    } catch (error: any) {
      console.error('激活或交易失败:', error);
      setError(error.message || '操作失败');
      
      alert(`❌ 操作失败\n\n${error.message || '未知错误'}`);
    } finally {
      setIsActivating(false);
      setCountdown(30);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleTrade}
        disabled={isActivating}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          market.blockchain_status === 'created'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
        } ${className}`}
      >
        {isActivating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>激活中... ({countdown}秒)</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {market.blockchain_status === 'created' ? (
              <>
                <span className="text-xl">🔥</span>
                <span>立即交易</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                <span>激活并交易</span>
              </>
            )}
          </span>
        )}
      </button>

      {/* 状态提示 */}
      {market.blockchain_status === 'not_created' && !isActivating && (
        <p className="text-xs text-gray-500 text-center">
          💡 首次交易需要激活市场（约 30 秒）
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center">
          ❌ {error}
        </p>
      )}
    </div>
  );
}



