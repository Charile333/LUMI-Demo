// 🚀 快速交易弹窗组件（类似 Polymarket）
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { signOrder, generateSalt, generateOrderId, type Order } from '@/lib/clob/signing';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: number;
    title: string;
    questionId: string;
  };
  side: 'YES' | 'NO';
}

export default function QuickTradeModal({
  isOpen,
  onClose,
  market,
  side
}: QuickTradeModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [amount, setAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0.50);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染（避免 SSR 问题）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 📊 从订单簿获取实时价格（带超时处理）
  useEffect(() => {
    const fetchOrderBookPrice = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        
        // 🔧 添加请求超时（3秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const outcome = side === 'YES' ? 1 : 0;
        const response = await fetch(
          `/api/orders/book?marketId=${market.id}&outcome=${outcome}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.success && data.orderBook) {
          // 获取最佳买入价格
          const bestPrice = data.orderBook.asks?.[0]?.price || 
                           data.orderBook.bids?.[0]?.price || 
                           0.50;
          setCurrentPrice(parseFloat(bestPrice));
        } else {
          console.warn('⚠️ 订单簿为空，使用默认价格');
          setCurrentPrice(0.50);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('⚠️ 获取价格超时，使用默认价格');
        } else {
          console.error('❌ 获取价格失败:', error.message);
        }
        setCurrentPrice(0.50); // 默认价格
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBookPrice();
  }, [isOpen, market.id, side]);

  if (!isOpen) return null;

  const handleTrade = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. 检查钱包连接
      if (typeof window.ethereum === 'undefined') {
        toast.warning(t('orderForm.installMetaMask'));
        setIsSubmitting(false);
        return;
      }

      // 2. 连接钱包并获取地址
      let provider, signer, userAddress;
      
      try {
        // 请求账户访问权限
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('未找到钱包账户');
        }
        
        // 创建 provider 和 signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // 等待确保连接完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 获取用户地址
        userAddress = await signer.getAddress();
        
        console.log('[QuickTrade] 用户地址:', userAddress);
      } catch (walletError: any) {
        console.error('[QuickTrade] 钱包连接失败:', walletError);
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

      // 3. 创建订单数据（使用标准Order接口）
      const outcome = side === 'YES' ? 1 : 0;
      const orderData: Order = {
        orderId: generateOrderId(),
        marketId: market.id,
        maker: userAddress,
        side: 'buy' as const,
        outcome: outcome,
        price: currentPrice.toString(),
        amount: amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400 // 24小时有效期
      };

      // 4. 使用标准签名函数签名
      const signature = await signOrder(orderData, signer);
      
      const order = {
        ...orderData,
        questionId: market.questionId, // 添加questionId用于API
        signature
      };

      console.log('[QuickTrade] 提交订单:', order);

      // 5. 提交订单到 API
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
          `${t('quickTrade.market')}: ${market.title}\n` +
          `${t('orderForm.outcome')}: ${side}\n` +
          `${t('quickTrade.amount')}: $${amount}\n` +
          `${t('quickTrade.avgPrice')}: $${currentPrice.toFixed(2)}`,
          { duration: 5000 }
        );
        onClose();
        
        // 刷新页面以显示更新后的数据
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
      } else if (error.message?.includes('user rejected')) {
        toast.warning(t('orderForm.userRejected'));
      } else {
        toast.error(`${t('orderForm.orderFailed')}:\n${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedShares = parseFloat(amount) / currentPrice;
  const potentialReturn = side === 'YES' 
    ? (expectedShares * 1) - parseFloat(amount)
    : (expectedShares * 1) - parseFloat(amount);

  // 如果不在客户端或未打开，不渲染
  if (!isOpen || !mounted) return null;

  // 使用 Portal 渲染到 body，确保在最顶层
  return createPortal(
    <>
      {/* 背景遮罩 - 最高层级（仅次于Toast） */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center 
                   animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* 弹窗内容 */}
        <div 
          className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden 
                     border-2 border-amber-400/30
                     animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className={`p-6 ${side === 'YES' ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-pink-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm border border-white/30">
                  {side === 'YES' ? '✓' : '✗'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {t('quickTrade.buy')} {side}
                  </h3>
                  <p className="text-white/90 text-sm font-medium">
                    ${currentPrice.toFixed(2)} {t('quickTrade.perShare')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 
                         flex items-center justify-center transition-all text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 市场信息 */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <p className="text-gray-400 text-sm mb-1">{t('quickTrade.market')}</p>
            <p className="text-white font-semibold text-base">
              {market.title}
            </p>
          </div>

          {/* 交易表单 */}
          <div className="p-6 space-y-4">
            {/* 金额输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {t('quickTrade.amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg font-semibold text-white 
                           bg-white/5 border-2 border-white/10 rounded-xl 
                           focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                           transition-all placeholder-gray-500"
                  placeholder="10"
                  min="1"
                  step="1"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-gray-300 
                             bg-white/5 hover:bg-amber-400/20 border border-white/10 
                             hover:border-amber-400/50 rounded-lg transition-all"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 预估信息 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('quickTrade.avgPrice')}</span>
                <span className="font-semibold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('quickTrade.shares')}</span>
                <span className="font-semibold text-white">
                  {expectedShares.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">{t('quickTrade.potentialReturn')}</span>
                <span className={`font-bold ${potentialReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {potentialReturn > 0 ? '+' : ''}${potentialReturn.toFixed(2)} 
                  {potentialReturn > 0 && ` (+${((potentialReturn / parseFloat(amount)) * 100).toFixed(0)}%)`}
                </span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-400 leading-relaxed">
                ⚡ {t('quickTrade.quickTradeNote')}
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 pt-0">
            <button
              onClick={handleTrade}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform
                ${side === 'YES'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/50'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-red-500/50'
              } text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> {t('quickTrade.processing')}
                </span>
              ) : (
                `${t('quickTrade.buyFor')} ${side} ${t('quickTrade.for')} $${amount}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

