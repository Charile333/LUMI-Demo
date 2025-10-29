// 📝 下单表单组件

'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/app/provider';
import { signOrder, generateSalt, generateOrderId } from '@/lib/clob/signing';
import { Order } from '@/lib/clob/types';
import { useTranslation } from '@/hooks/useTranslation';

interface OrderFormProps {
  marketId: number;
  questionId: string;
  currentPriceYes?: number;
  currentPriceNo?: number;
  bestBid?: number;  // 最佳买价（用户可以卖出的价格）
  bestAsk?: number;  // 最佳卖价（用户需要买入的价格）
  onSuccess?: () => void;  // 订单成功回调
}

export default function OrderForm({ 
  marketId, 
  questionId,
  currentPriceYes = 0.5,
  currentPriceNo = 0.5,
  bestBid = 0.49,
  bestAsk = 0.51,
  onSuccess
}: OrderFormProps) {
  const { t } = useTranslation();
  const { address: account, isConnected } = useWallet();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState(1); // 1 = YES, 0 = NO
  const [amount, setAmount] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  
  // 根据买卖方向获取市场价格（不可修改）
  const marketPrice = side === 'buy' ? bestAsk : bestBid;
  
  // 当买卖方向改变时
  const handleSideChange = (newSide: 'buy' | 'sell') => {
    setSide(newSide);
  };
  
  // 当结果选择改变时
  const handleOutcomeChange = (newOutcome: number) => {
    setOutcome(newOutcome);
  };
  
  // 提交订单
  const handleSubmit = async () => {
    if (!window.ethereum) {
      alert(t('orderForm.installMetaMask'));
      return;
    }
    
    if (!account || !isConnected) {
      alert(t('orderForm.connectWalletFirst'));
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 1. 获取 provider 和 signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // 2. 构造订单（使用市场价）
      const order: Order = {
        orderId: generateOrderId(),
        marketId,
        questionId,
        maker: address,
        side,
        outcome,
        price: marketPrice.toFixed(2), // 使用市场价
        amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400 * 7 // 7天有效期
      };
      
      console.log('[OrderForm] 创建订单:', order);
      
      // 3. 签名订单
      const signature = await signOrder(order, signer);
      order.signature = signature;
      
      console.log('[OrderForm] 订单已签名');
      
      // 4. 提交到链下匹配引擎
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${t('orderForm.orderSuccess')}\n\n${t('orderForm.orderSuccessDetail')}\n\n${t('market.marketId')}: ${order.orderId}`);
        
        // 重置表单
        setAmount('10');
        
        // 触发回调刷新页面数据
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('提交订单失败:', error);
      if (error.code === 4001) {
        alert(t('orderForm.userCancelled'));
      } else if (error.message?.includes('user rejected')) {
        alert(t('orderForm.userRejected'));
      } else {
        alert(t('orderForm.orderFailed') + ':\n\n' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // 计算预估成本（使用市场价）
  const estimatedCost = (marketPrice * parseFloat(amount || '0')).toFixed(2);
  
  // 显示价差
  const spread = ((bestAsk - bestBid) * 100).toFixed(2);
  
  // 潜在收益（如果预测正确）
  const potentialProfit = side === 'buy' 
    ? ((1 - marketPrice) * parseFloat(amount || '0')).toFixed(2)
    : (marketPrice * parseFloat(amount || '0')).toFixed(2);
  
  return (
    <div>
      {/* 钱包状态提示 */}
      {!isConnected ? (
        <div className="mb-4 p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg">
          <p className="text-sm text-amber-400 text-center">
            {t('orderForm.connectWalletFirst')}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="text-sm text-gray-300">
            {t('wallet.connect', 'Connected')}: {account?.substring(0, 6)}...{account?.substring(38)}
          </div>
        </div>
      )}
      
      {/* 市场实时价格 */}
      <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="text-xs font-semibold text-amber-400 mb-2">{t('orderForm.livePrice')}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-400 text-xs">{t('orderForm.bid')}</div>
            <div className="font-bold text-green-400">${bestBid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">{t('orderForm.ask')}</div>
            <div className="font-bold text-red-400">${bestAsk.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {t('orderForm.spread')}: {spread}¢
        </div>
      </div>
      
      {/* 结果选择（YES/NO） */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleOutcomeChange(1)}
          disabled={submitting || !isConnected}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            outcome === 1
              ? 'bg-green-500 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-green-500/50'
          }`}
        >
          <div>YES</div>
          <div className="text-xs opacity-80">{(currentPriceYes * 100).toFixed(1)}%</div>
        </button>
        <button
          onClick={() => handleOutcomeChange(0)}
          disabled={submitting || !isConnected}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            outcome === 0
              ? 'bg-red-500 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-500/50'
          }`}
        >
          <div>NO</div>
          <div className="text-xs opacity-80">{(currentPriceNo * 100).toFixed(1)}%</div>
        </button>
      </div>
      
      {/* 买/卖切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleSideChange('buy')}
          disabled={submitting || !isConnected}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            side === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-green-600/50'
          }`}
        >
          {t('orderForm.buy')}
        </button>
        <button
          onClick={() => handleSideChange('sell')}
          disabled={submitting || !isConnected}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-600/50'
          }`}
        >
          {t('orderForm.sell')}
        </button>
      </div>
      
      {/* 市场价格（只读显示） */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          {t('orderForm.executionPrice')}
        </label>
        <div className="w-full px-4 py-3 bg-white/5 border-2 border-amber-400/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-amber-400">
              ${marketPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">
              {side === 'buy' ? t('orderForm.ask') : t('orderForm.bid')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('orderForm.marketPrice')}
        </p>
      </div>
      
      {/* 数量 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 flex justify-between items-center text-gray-300">
          <span>{t('orderForm.amount')}</span>
          <div className="flex gap-1">
            {['10', '50', '100', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                disabled={submitting || !isConnected}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded disabled:opacity-50"
              >
                {val}
              </button>
            ))}
          </div>
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="1"
          disabled={submitting || !isConnected}
          className="w-full px-4 py-2 bg-white/5 border-2 border-white/10 text-white rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={t('orderForm.amount')}
        />
      </div>
      
      {/* 交易摘要 */}
      <div className="mb-4 p-4 bg-white/5 border-2 border-white/10 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('orderForm.marketPrice')}:</span>
          <span className="font-bold text-gray-200">${marketPrice.toFixed(2)} / {t('orderForm.shares')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('market.quantity')}:</span>
          <span className="font-bold text-gray-200">{amount} {t('orderForm.shares')}</span>
        </div>
        <div className="border-t border-white/10 pt-2 mt-2"></div>
        <div className="flex justify-between text-base">
          <span className="text-gray-300 font-semibold">
            {t('orderForm.totalCost')}:
          </span>
          <span className="font-bold text-lg text-amber-400">
            ${estimatedCost} USDC
          </span>
        </div>
        {side === 'buy' && (
          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">
            {t('orderForm.estimatedShares')}: ${(parseFloat(amount) * 1).toFixed(2)} USDC
            <br />
            {t('orderForm.potentialProfit')}: <span className="text-green-400 font-semibold">+${potentialProfit} USDC</span>
          </div>
        )}
      </div>
      
      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !isConnected}
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
          side === 'buy'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {submitting 
          ? t('orderForm.submitting')
          : !isConnected 
            ? t('orderForm.connectWalletFirst')
            : `${side === 'buy' ? t('orderForm.confirmBuy') : t('orderForm.confirmSell')} ${outcome === 1 ? 'YES' : 'NO'}`
        }
      </button>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        {t('orderForm.orderNote')}
      </p>
    </div>
  );
}




