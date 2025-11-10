// 🎯 紧凑交易弹窗 - 重新设计的小卡片样式
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { signOrder, generateSalt, generateOrderId, type Order } from '@/lib/clob/signing';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { useMarketPrice } from '@/hooks/useMarketPrice';

interface CompactTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: number;
    title: string;
    questionId: string;
  };
  initialOutcome?: 'yes' | 'no'; // 初始选择的结果
}

export default function CompactTradeModal({
  isOpen,
  onClose,
  market,
  initialOutcome = 'yes'
}: CompactTradeModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState<'yes' | 'no'>(initialOutcome);
  const [amount, setAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 🔥 使用统一的 useMarketPrice hook 获取实时价格（和市场卡片、详情页一致）
  const price = useMarketPrice(market.id, true);

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 当弹窗打开时，重置为初始选择
  useEffect(() => {
    if (isOpen) {
      setOutcome(initialOutcome);
    }
  }, [isOpen, initialOutcome]);

  if (!isOpen || !mounted) return null;

  // 🎯 根据买卖方向选择正确的价格
  // 买入时使用 ask 价格（卖家的报价），卖出时使用 bid 价格（买家的报价）
  const currentPrice = side === 'buy' 
    ? (outcome === 'yes' ? price.bestAsk : price.bestAsk) // 买入使用卖价
    : (outcome === 'yes' ? price.bestBid : price.bestBid); // 卖出使用买价

  const handleTrade = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. 检查钱包
      if (typeof window.ethereum === 'undefined') {
        toast.warning(t('orderForm.installMetaMask'));
        setIsSubmitting(false);
        return;
      }

      // 2. 连接钱包并获取地址
      console.log('[CompactTrade] 连接钱包...');
      
      let provider, signer, userAddress;
      
      try {
        // 先请求账户访问权限
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('未找到钱包账户，请先连接 MetaMask');
        }
        
        console.log('[CompactTrade] 账户已连接:', accounts[0]);
        
        // 创建 provider 和 signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // 等待一下确保连接完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 获取用户地址
        userAddress = await signer.getAddress();
        
        console.log('[CompactTrade] 用户地址:', userAddress);
      } catch (walletError: any) {
        console.error('[CompactTrade] 钱包连接失败:', walletError);
        if (walletError.code === 4001) {
          toast.warning('用户拒绝连接钱包');
        } else if (walletError.code === 'UNSUPPORTED_OPERATION') {
          toast.error('钱包未正确连接，请刷新页面后重试');
        } else {
          toast.error(`钱包连接失败: ${walletError.message}`);
        }
        setIsSubmitting(false);
        return;
      }
      
      // 确保已获取到必要的对象
      if (!provider || !signer || !userAddress) {
        toast.error('钱包连接异常，请刷新页面后重试');
        setIsSubmitting(false);
        return;
      }

      // 3. 创建订单
      const outcomeValue = outcome === 'yes' ? 1 : 0;
      const orderData: Order = {
        orderId: generateOrderId(),
        marketId: market.id,
        maker: userAddress,
        side: side,
        outcome: outcomeValue,
        price: currentPrice.toString(),
        amount: amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400
      };

      // 4. 签名订单
      const signature = await signOrder(orderData, signer);
      
      const order = {
        ...orderData,
        questionId: market.questionId,
        signature
      };

      console.log('[CompactTrade] 提交订单:', order);

      // 5. 提交订单
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `🎉 ${t('orderForm.orderSuccess')}\n\n` +
          `${side === 'buy' ? '买入' : '卖出'} ${outcome.toUpperCase()}\n` +
          `数量: $${amount}\n` +
          `价格: $${currentPrice.toFixed(2)}`,
          { duration: 5000 }
        );
        onClose();
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.error || '提交失败');
      }
      
    } catch (error: any) {
      console.error('交易失败:', error);
      
      if (error.code === 4001) {
        toast.warning(t('orderForm.userCancelled'));
      } else {
        toast.error(`${t('orderForm.orderFailed')}:\n${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4
                 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 小卡片 */}
      <div 
        className="bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-sm 
                   border border-white/10 overflow-hidden
                   animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 市场标题 */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-white font-semibold text-base leading-tight flex-1">
              {market.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Buy / Sell 切换 */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${
                side === 'buy'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${
                side === 'sell'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Yes / No 价格选择 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOutcome('yes')}
              className={`relative p-4 rounded-xl transition-all ${
                outcome === 'yes'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 border-2 border-emerald-400'
                  : 'bg-white/5 border-2 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${
                outcome === 'yes' ? 'text-emerald-100' : 'text-gray-400'
              }`}>
                Yes
              </div>
              <div className={`text-2xl font-bold ${
                outcome === 'yes' ? 'text-white' : 'text-gray-300'
              }`}>
                {price.loading ? '...' : `$${price.yes.toFixed(2)}`}
              </div>
              {outcome === 'yes' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            
            <button
              onClick={() => setOutcome('no')}
              className={`relative p-4 rounded-xl transition-all ${
                outcome === 'no'
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30 border-2 border-rose-400'
                  : 'bg-white/5 border-2 border-white/10 hover:border-rose-500/30'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${
                outcome === 'no' ? 'text-rose-100' : 'text-gray-400'
              }`}>
                No
              </div>
              <div className={`text-2xl font-bold ${
                outcome === 'no' ? 'text-white' : 'text-gray-300'
              }`}>
                {price.loading ? '...' : `$${price.no.toFixed(2)}`}
              </div>
              {outcome === 'no' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* 数量输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              数量
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-lg font-semibold text-white 
                         bg-white/5 border-2 border-white/10 rounded-xl 
                         focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 
                         transition-all placeholder-gray-500"
                placeholder="10"
                min="1"
                step="1"
              />
            </div>
            {/* 快速金额按钮 */}
            <div className="mt-2 flex gap-2">
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-400 
                           bg-white/5 hover:bg-white/10 border border-white/10 
                           hover:border-amber-400/30 rounded-lg transition-all"
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* 交易按钮 */}
          <button
            onClick={handleTrade}
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || price.loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform
              ${side === 'buy'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/30'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/30'
            } text-white hover:scale-[1.02] 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                处理中...
              </span>
            ) : (
              `${side === 'buy' ? '买入' : '卖出'} ${outcome.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

