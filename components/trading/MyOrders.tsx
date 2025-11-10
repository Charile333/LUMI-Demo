// 📋 我的订单组件

'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface MyOrdersProps {
  marketId?: number;
}

export default function MyOrders({ marketId }: MyOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'filled' | 'cancelled'>('all');
  
  useEffect(() => {
    loadAccount();
    
    // ✅ 监听账户变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log('[MyOrders] 账户已切换:', accounts[0]);
          setAccount(accounts[0]);
        } else {
          console.log('[MyOrders] 钱包已断开');
          setAccount(null);
          setOrders([]);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);
  
  useEffect(() => {
    if (account) {
      loadOrders();
      
      // 每10秒刷新一次
      const interval = setInterval(loadOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [account, filter]);
  
  const loadAccount = async () => {
    if (!window.ethereum) return;
    
    try {
      // ✅ 修复：先请求账户访问权限，不要只使用 listAccounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        console.log('[MyOrders] 钱包已连接:', accounts[0]);
      } else {
        // 如果没有账户，尝试静默获取（钱包已授权的情况）
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const existingAccounts = await provider.listAccounts();
        if (existingAccounts.length > 0) {
          setAccount(existingAccounts[0]);
          console.log('[MyOrders] 使用已授权账户:', existingAccounts[0]);
        }
      }
    } catch (error: any) {
      // 用户拒绝连接
      if (error.code === 4001) {
        console.warn('[MyOrders] 用户拒绝连接钱包');
      } else {
        console.error('[MyOrders] 获取账户失败:', error);
      }
    }
  };
  
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
    if (!window.ethereum || !account) return;
    
    const confirmed = confirm('确定要取消这个订单吗？');
    if (!confirmed) return;
    
    try {
      // 签名取消消息
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
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
  
  if (!account) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          请先连接钱包查看订单
        </div>
        <button
          onClick={loadAccount}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-colors"
        >
          连接钱包
        </button>
        <div className="text-xs text-gray-500 mt-2">
          点击按钮将弹出 MetaMask 连接请求
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







