// 📋 我的订单组件

'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/app/provider-wagmi';
import WalletConnect from '@/components/WalletConnect';

interface MyOrdersProps {
  marketId?: number;
}

export default function MyOrders({ marketId }: MyOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'filled' | 'cancelled'>('all');
  
  // ✅ 统一使用 useWallet() hook，避免自己管理连接
  const { address: account, isConnected } = useWallet();
  
  useEffect(() => {
    if (account) {
      loadOrders();
      
      // 每10秒刷新一次
      const interval = setInterval(loadOrders, 10000);
      return () => clearInterval(interval);
    } else {
      // 如果钱包断开，清空订单列表
      setOrders([]);
      setLoading(false);
    }
  }, [account, filter]);
  
  const loadOrders = async () => {
    if (!account) return;
    
    try {
      const response = await fetch(
        `/api/orders/my-orders?address=${account}&status=${filter}`
      );
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelOrder = async (orderId: string) => {
    if (!account) return;
    
    const confirmed = confirm('确定要取消这个订单吗？');
    if (!confirmed) return;
    
    try {
      // ✅ 使用 useWallet() hook 提供的 provider（如果需要签名）
      // 注意：这里需要从 useWallet() 获取 signer，但当前 hook 没有暴露 signer
      // 暂时保持原有实现，但使用 account 而不是 window.ethereum 检查
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('钱包未连接');
      }
      
      // 签名取消消息
      // ✅ 修复：先验证账户，再创建 signer
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (!accounts || accounts.length === 0 || accounts[0].toLowerCase() !== account.toLowerCase()) {
        throw new Error('钱包账户未授权，请先连接钱包');
      }
      
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // ✅ 修复：明确指定账户地址创建 signer，避免 "unknown account #0" 错误
      const signer = provider.getSigner(accounts[0]); // 明确指定账户地址
      const message = `Cancel order: ${orderId}`;
      const signature = await signer.signMessage(message);
      
      // 发送取消请求
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, signature })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ 订单已取消');
        loadOrders();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('取消订单失败:', error);
      alert('取消失败:\n\n' + error.message);
    }
  };
  
  if (!account || !isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          请先连接钱包查看订单
        </div>
        {/* ✅ 使用统一的 WalletConnect 组件，避免连接冲突 */}
        <div className="flex justify-center">
          <WalletConnect />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          连接钱包后即可查看您的订单
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }
  
  return (
    <div>
      {/* 筛选器 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(['all', 'open', 'filled', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:border-amber-400/50'
            }`}
          >
            {f === 'all' ? '全部' : f === 'open' ? '未成交' : f === 'filled' ? '已成交' : '已取消'}
          </button>
        ))}
      </div>
      
      {/* 订单列表 */}
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">暂无订单</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
              {/* 订单头部 */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-white">
                    {order.market_title || `市场 ${order.market_id}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.market_category && `${order.market_category} · `}
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                  order.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  order.status === 'filled' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                  'bg-white/5 text-gray-400 border border-white/10'
                }`}>
                  {order.status === 'open' ? '未成交' :
                   order.status === 'partial' ? '部分成交' :
                   order.status === 'filled' ? '已成交' :
                   order.status === 'cancelled' ? '已取消' : '已过期'}
                </span>
              </div>
              
              {/* 订单详情 */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-gray-400">方向:</span>
                  <span className={`ml-2 font-semibold ${
                    order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {order.side === 'buy' ? '买入' : '卖出'} {order.outcome === 1 ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">价格:</span>
                  <span className="ml-2 font-semibold text-gray-200">{parseFloat(order.price).toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-gray-400">数量:</span>
                  <span className="ml-2 text-gray-200">{parseFloat(order.amount || order.quantity || 0).toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-400">已成交:</span>
                  <span className="ml-2 text-gray-200">{parseFloat(order.filled_amount || order.filled_quantity || 0).toFixed(0)}</span>
                </div>
              </div>
              
              {/* 成交记录 */}
              {order.trades && order.trades.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-xs text-gray-400 mb-1">成交记录 ({order.trades.length})</div>
                  <div className="space-y-1">
                    {order.trades.map((trade: any) => (
                      <div key={trade.id} className="text-xs text-gray-300 flex justify-between">
                        <span>{parseFloat(trade.amount).toFixed(0)} @ {parseFloat(trade.price).toFixed(3)}</span>
                        <span className="text-gray-500">{new Date(trade.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 操作按钮 */}
              {(order.status === 'open' || order.status === 'partial') && (
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="mt-3 w-full py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  取消订单
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







