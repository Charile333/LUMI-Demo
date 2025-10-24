// 📝 下单表单组件

'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/app/provider';
import { signOrder, generateSalt, generateOrderId } from '@/lib/clob/signing';
import { Order } from '@/lib/clob/types';

interface OrderFormProps {
  marketId: number;
  questionId: string;
  currentPriceYes?: number;
  currentPriceNo?: number;
  bestBid?: number;  // 最佳买价（用户可以卖出的价格）
  bestAsk?: number;  // 最佳卖价（用户需要买入的价格）
}

export default function OrderForm({ 
  marketId, 
  questionId,
  currentPriceYes = 0.5,
  currentPriceNo = 0.5,
  bestBid = 0.49,
  bestAsk = 0.51
}: OrderFormProps) {
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
      alert('请安装 MetaMask 钱包');
      return;
    }
    
    if (!account || !isConnected) {
      alert('请先在页面顶部连接钱包');
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
        orderId: generateOrderId(address),
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
        alert(`✅ ${result.message}\n\n订单ID: ${order.orderId}`);
        
        // 重置表单
        setAmount('10');
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('提交订单失败:', error);
      alert('提交失败:\n\n' + error.message);
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
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ 请先在页面顶部连接钱包
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            ✅ 已连接: {account?.substring(0, 6)}...{account?.substring(38)}
          </div>
        </div>
      )}
      
      {/* 市场实时价格 */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs font-semibold text-blue-900 mb-2">📊 实时市场价格</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-600 text-xs">买价 (Bid)</div>
            <div className="font-bold text-green-600">${bestBid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">卖价 (Ask)</div>
            <div className="font-bold text-red-600">${bestAsk.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          价差: {spread}¢
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
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          买入
        </button>
        <button
          onClick={() => handleSideChange('sell')}
          disabled={submitting || !isConnected}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          卖出
        </button>
      </div>
      
      {/* 市场价格（只读显示） */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          成交价格（市价）
        </label>
        <div className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">
              ${marketPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {side === 'buy' ? '买入价' : '卖出价'}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 价格固定为市场价，保证立即成交
        </p>
      </div>
      
      {/* 数量 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 flex justify-between items-center">
          <span>数量（股）</span>
          <div className="flex gap-1">
            {['10', '50', '100', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                disabled={submitting || !isConnected}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
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
          className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="输入数量"
        />
      </div>
      
      {/* 交易摘要 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">成交价格:</span>
          <span className="font-bold text-gray-900">${marketPrice.toFixed(2)} / 股</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">数量:</span>
          <span className="font-bold text-gray-900">{amount} 股</span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2"></div>
        <div className="flex justify-between text-base">
          <span className="text-gray-700 font-semibold">
            {side === 'buy' ? '需支付:' : '将收到:'}
          </span>
          <span className="font-bold text-lg text-blue-600">
            ${estimatedCost} USDC
          </span>
        </div>
        {side === 'buy' && (
          <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-300">
            💰 预测正确可获得: ${(parseFloat(amount) * 1).toFixed(2)} USDC
            <br />
            📈 潜在收益: <span className="text-green-600 font-semibold">+${potentialProfit} USDC</span>
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
          ? '提交中...' 
          : !isConnected 
            ? '请先连接钱包'
            : `确认${side === 'buy' ? '买入' : '卖出'} ${outcome === 1 ? 'YES' : 'NO'}`
        }
      </button>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 订单将在链下匹配，成交后批量结算到链上<br />
        订单有效期 7 天，未成交可随时取消
      </p>
    </div>
  );
}




