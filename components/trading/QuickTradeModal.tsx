// 🚀 快速交易弹窗组件（类似 Polymarket）
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { signOrder, generateSalt, generateOrderId, type Order } from '@/lib/clob/signing';

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
  const [amount, setAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0.50);
  const [loading, setLoading] = useState(true);

  // 📊 从订单簿获取实时价格
  useEffect(() => {
    const fetchOrderBookPrice = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const outcome = side === 'YES' ? 1 : 0;
        const response = await fetch(`/api/orders/book?marketId=${market.id}&outcome=${outcome}`);
        const data = await response.json();
        
        if (data.success && data.orderBook) {
          // 获取最佳买入价格（如果是买单，看卖方的最低价）
          const bestPrice = data.orderBook.sell?.[0]?.price || 0.50;
          setCurrentPrice(parseFloat(bestPrice));
        }
      } catch (error) {
        console.error('获取价格失败:', error);
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
        alert('请先安装 MetaMask 钱包！');
        return;
      }

      // 2. 连接钱包
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

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
        alert(
          `✅ 下单成功！\n\n` +
          `市场：${market.title}\n` +
          `方向：${side}\n` +
          `金额：$${amount}\n` +
          `价格：${currentPrice.toFixed(2)}¢\n\n` +
          `${result.message || '订单已提交到订单簿'}`
        );
        onClose();
        
        // 刷新页面以显示更新后的数据
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.error || '提交失败');
      }
      
    } catch (error: any) {
      console.error('交易失败:', error);
      
      if (error.code === 4001) {
        alert('❌ 用户取消了签名');
      } else if (error.message?.includes('user rejected')) {
        alert('❌ 用户拒绝了交易');
      } else {
        alert('❌ 交易失败：' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedShares = parseFloat(amount) / currentPrice;
  const potentialReturn = side === 'YES' 
    ? (expectedShares * 1) - parseFloat(amount)
    : (expectedShares * 1) - parseFloat(amount);

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 弹窗内容 */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className={`p-6 ${side === 'YES' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {side === 'YES' ? '✅' : '❌'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    Buy {side}
                  </h3>
                  <p className="text-white/80 text-sm">
                    ${currentPrice.toFixed(2)} per share
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* 市场信息 */}
          <div className="p-6 border-b border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Market</p>
            <p className="text-gray-900 font-semibold">
              {market.title}
            </p>
          </div>

          {/* 交易表单 */}
          <div className="p-6 space-y-4">
            {/* 金额输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="10"
                  min="1"
                  step="1"
                />
              </div>
              <div className="mt-2 flex gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 预估信息 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg price</span>
                <span className="font-semibold text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shares</span>
                <span className="font-semibold text-gray-900">
                  {expectedShares.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Potential return</span>
                <span className={`font-bold ${potentialReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {potentialReturn > 0 ? '+' : ''}${potentialReturn.toFixed(2)} 
                  {potentialReturn > 0 && ` (+${((potentialReturn / parseFloat(amount)) * 100).toFixed(0)}%)`}
                </span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Quick trade:</strong> This will create a market order at the best available price.
                For advanced options, visit the market page.
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 pt-0">
            <button
              onClick={handleTrade}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                side === 'YES'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing...
                </span>
              ) : (
                `Buy ${side} for $${amount}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

