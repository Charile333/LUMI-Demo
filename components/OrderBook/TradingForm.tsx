'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PolymarketCLOBClient, OrderSide } from '@/lib/polymarket/clob';

interface TradingFormProps {
  marketId: string;
  assetId: string;
  tokenId: string;
  account: string | null;
  defaultPrice?: string;
}

export function TradingForm({
  marketId,
  assetId,
  tokenId,
  account,
  defaultPrice = '0.50'
}: TradingFormProps) {
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [price, setPrice] = useState(defaultPrice);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // 计算总额
  const total = price && amount 
    ? (parseFloat(price) * parseFloat(amount)).toFixed(2)
    : '0.00';

  // 当外部传入价格时更新
  useEffect(() => {
    if (defaultPrice) {
      setPrice(defaultPrice);
    }
  }, [defaultPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('请先连接钱包');
      return;
    }

    if (!price || !amount) {
      alert('请输入价格和数量');
      return;
    }

    setLoading(true);

    try {
      // TODO: 实际集成 CTFExchange
      console.log('创建订单:', {
        side: side === OrderSide.BUY ? 'BUY' : 'SELL',
        price,
        amount,
        total,
        marketId,
        assetId,
        tokenId
      });

      // 模拟订单创建
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`✅ 订单创建成功！\n\n类型: ${side === OrderSide.BUY ? '买入' : '卖出'}\n价格: ${price} USDC\n数量: ${amount}\n总额: ${total} USDC`);

      // 重置表单
      setAmount('');

    } catch (error: any) {
      console.error('创建订单失败:', error);
      alert('❌ 创建订单失败:\n\n' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const isBuy = side === OrderSide.BUY;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">📝 下单</h2>
      </div>

      {/* Side Selector */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide(OrderSide.BUY)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              isBuy
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            买入 (BUY)
          </button>
          <button
            onClick={() => setSide(OrderSide.SELL)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              !isBuy
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            卖出 (SELL)
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* Price Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            价格 (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
              placeholder="0.5000"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              USDC
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            价格范围: 0.0001 - 1.0000 USDC
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            数量 (Tokens)
          </label>
          <input
            type="number"
            step="1"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
            placeholder="100"
            required
          />
          <div className="mt-1 text-xs text-gray-500">
            最小数量: 1 token
          </div>
        </div>

        {/* Total Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">总额:</span>
            <span className="text-2xl font-bold font-mono">
              {total} USDC
            </span>
          </div>
          {amount && price && (
            <div className="mt-2 text-xs text-gray-500">
              {amount} tokens × {price} USDC = {total} USDC
            </div>
          )}
        </div>

        {/* Submit Button */}
        {account ? (
          <button
            type="submit"
            disabled={loading || !price || !amount}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isBuy
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>创建中...</span>
              </div>
            ) : (
              <span>{isBuy ? '买入' : '卖出'}</span>
            )}
          </button>
        ) : (
          <div className="w-full py-4 rounded-lg bg-gray-100 text-gray-500 text-center font-semibold">
            请先连接钱包
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <div className="font-semibold mb-1">💡 提示:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>订单在链下签名，无需 Gas 费</li>
            <li>订单匹配后自动在链上结算</li>
            <li>手续费: 1% (从交易额中扣除)</li>
            <li>{isBuy ? '需要 Approve USDC' : '需要 Approve CTF Tokens'}</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

