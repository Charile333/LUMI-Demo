'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-client';

export default function AdminMarketsPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadMarkets();
  }, [filter]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseAdmin();
      
      let query = supabase
        .from('markets')
        .select('*')
        .order('id', { ascending: false });
      
      // 按状态筛选
      if (filter !== 'all') {
        query = query.eq('blockchain_status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('加载失败:', error);
        alert('加载市场列表失败');
        return;
      }
      
      setMarkets(data || []);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (marketId: number) => {
    const market = markets.find(m => m.id === marketId);
    
    if (!market) {
      alert('❌ 市场不存在');
      return;
    }

    // 检查是否有 question_id
    if (!market.question_id) {
      alert('❌ 市场缺少 Question ID，无法激活！\n\n请先为市场设置 question_id。');
      return;
    }

    if (!confirm(
      `确定要激活这个市场到区块链上吗？\n\n` +
      `市场: ${market.title}\n` +
      `Question ID: ${market.question_id}\n\n` +
      `需要支付：\n` +
      `- Gas 费（约0.01 POL）\n` +
      `- USDC 奖励（约10 USDC）\n\n` +
      `激活过程可能需要 30-60 秒，请耐心等待。`
    )) {
      return;
    }

    try {
      setActivating(marketId);
      
      console.log(`🚀 开始激活市场 ${marketId}...`);
      
      const response = await fetch(`/api/admin/markets/${marketId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '激活失败');
      }
      
      if (data.success) {
        console.log('✅ 市场激活成功！', data);
        
        // 显示成功消息，包含链接
        const explorerUrl = data.txHash 
          ? `https://amoy.polygonscan.com/tx/${data.txHash}`
          : null;
        
        const message = 
          `✅ 市场激活成功！\n\n` +
          `Condition ID: ${data.conditionId}\n` +
          (data.txHash ? `交易哈希: ${data.txHash}\n` : '') +
          (explorerUrl ? `\n点击确定查看交易详情` : '');
        
        alert(message);
        
        if (explorerUrl) {
          window.open(explorerUrl, '_blank');
        }
        
        // 刷新列表
        loadMarkets();
      } else {
        throw new Error(data.error || '激活失败');
      }
    } catch (error: any) {
      console.error('❌ 激活失败:', error);
      
      const errorMessage = error.message || '激活失败，请检查：\n' +
        '1. 平台钱包配置是否正确\n' +
        '2. 钱包是否有足够的 USDC 余额\n' +
        '3. 钱包是否有足够的 Gas 费\n' +
        '4. 网络连接是否正常\n' +
        '5. 智能合约是否已部署';
      
      alert(`❌ 激活失败：\n\n${errorMessage}\n\n详情请查看浏览器控制台`);
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (marketId: number) => {
    if (!confirm('确定要删除这个市场吗？\n\n⚠️ 这将同时删除：\n- 所有相关订单\n- 用户兴趣记录\n- 市场状态\n- 订单簿数据\n\n如果市场已上链，只会从数据库删除，不会从链上删除。')) {
      return;
    }

    try {
      console.log(`🗑️ 删除市场 ${marketId}...`);
      
      // 调用后端 API 删除（使用管理员权限）
      const response = await fetch(`/api/admin/markets/${marketId}/delete`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '删除失败');
      }
      
      alert('✅ 市场及所有关联数据已删除');
      loadMarkets();
      
    } catch (error: any) {
      alert('❌ 删除失败：' + error.message + '\n\n详情请查看浏览器控制台');
      console.error('删除失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'not_created': { bg: 'bg-gray-100', text: 'text-gray-700', label: '未上链' },
      'creating': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '激活中...' },
      'created': { bg: 'bg-green-100', text: 'text-green-700', label: '已上链 ✅' },
      'failed': { bg: 'bg-red-100', text: 'text-red-700', label: '激活失败' }
    };
    
    const badge = badges[status] || badges['not_created'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getMarketStatus = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'draft': { bg: 'bg-gray-100', text: 'text-gray-700', label: '草稿' },
      'active': { bg: 'bg-blue-100', text: 'text-blue-700', label: '活跃' },
      'resolved': { bg: 'bg-purple-100', text: 'text-purple-700', label: '已结算' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: '已取消' }
    };
    
    const badge = badges[status] || badges['draft'];
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              市场管理
            </h1>
            <p className="text-gray-600">
              管理所有市场，激活到区块链
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/create-market')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              ➕ 创建市场
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 shadow"
            >
              🏠 返回首页
            </button>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">链上状态：</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'not_created', label: '未上链' },
                { value: 'creating', label: '激活中' },
                { value: 'created', label: '已上链' },
                { value: 'failed', label: '失败' }
              ].map(item => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === item.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={loadMarkets}
              className="ml-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              🔄 刷新
            </button>
          </div>
        </div>

        {/* 市场列表 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : markets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无市场</h3>
            <p className="text-gray-600 mb-6">创建第一个市场开始吧！</p>
            <button
              onClick={() => router.push('/admin/create-market')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              ➕ 创建市场
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {markets.map(market => (
              <div key={market.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  {/* 左侧：市场信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {market.title}
                      </h3>
                      {getMarketStatus(market.status)}
                      {getStatusBadge(market.blockchain_status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {market.description?.substring(0, 150)}
                      {market.description?.length > 150 ? '...' : ''}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>🆔 ID: {market.id}</span>
                      <span>📂 {market.main_category || market.categoryType}</span>
                      {market.sub_category && <span>📁 {market.sub_category}</span>}
                      {market.question_id && (
                        <span className="font-mono" title={market.question_id}>
                          🔗 Question ID: {market.question_id.substring(0, 20)}...
                        </span>
                      )}
                      {!market.question_id && (
                        <span className="text-red-500">⚠️ 缺少 Question ID</span>
                      )}
                      {market.condition_id && (
                        <span className="font-mono text-green-600" title={market.condition_id}>
                          ✅ Condition ID: {market.condition_id.substring(0, 20)}...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 右侧：操作按钮 */}
                  <div className="flex flex-col gap-2 ml-6">
                    {/* 激活按钮 */}
                    {(market.blockchain_status === 'not_created' || market.blockchain_status === 'failed') && (
                      <button
                        onClick={() => handleActivate(market.id)}
                        disabled={activating === market.id}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {activating === market.id ? '激活中...' : '🚀 激活上链'}
                      </button>
                    )}
                    
                    {market.blockchain_status === 'creating' && (
                      <button
                        disabled
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-lg cursor-not-allowed"
                      >
                        ⏳ 激活中...
                      </button>
                    )}
                    
                    {market.blockchain_status === 'created' && (
                      <button
                        onClick={() => window.open(`https://amoy.polygonscan.com/address/${market.condition_id}`, '_blank')}
                        className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100"
                      >
                        🔗 查看链上
                      </button>
                    )}
                    
                    {/* 查看详情 */}
                    <button
                      onClick={() => router.push(`/market/${market.id}`)}
                      className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100"
                    >
                      👁️ 查看详情
                    </button>
                    
                    {/* 删除按钮（只能删除未上链的） */}
                    {market.blockchain_status === 'not_created' && (
                      <button
                        onClick={() => handleDelete(market.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100"
                      >
                        🗑️ 删除
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 区块链信息（如果已上链） */}
                {market.blockchain_status === 'created' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {market.condition_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">Condition ID:</span>
                          <span 
                            className="font-mono text-gray-700 cursor-pointer hover:text-blue-600" 
                            onClick={() => {
                              navigator.clipboard.writeText(market.condition_id);
                              alert('Condition ID 已复制到剪贴板');
                            }}
                            title="点击复制"
                          >
                            {market.condition_id}
                          </span>
                          <button
                            onClick={() => window.open(`https://amoy.polygonscan.com/address/${market.condition_id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                            title="查看链上详情"
                          >
                            🔗
                          </button>
                        </div>
                      )}
                      {market.question_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">Question ID:</span>
                          <span 
                            className="font-mono text-gray-700 cursor-pointer hover:text-blue-600" 
                            onClick={() => {
                              navigator.clipboard.writeText(market.question_id);
                              alert('Question ID 已复制到剪贴板');
                            }}
                            title="点击复制"
                          >
                            {market.question_id}
                          </span>
                        </div>
                      )}
                      {market.adapter_address && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">Adapter:</span>
                          <span className="font-mono text-gray-700">{market.adapter_address.substring(0, 20)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 激活失败信息 */}
                {market.blockchain_status === 'failed' && (
                  <div className="mt-4 pt-4 border-t border-red-100">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                      <div className="font-semibold mb-1">⚠️ 激活失败</div>
                      <div className="text-red-600">
                        可以点击"🚀 激活上链"按钮重试激活。
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 底部统计 */}
        {!loading && markets.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 统计信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {markets.length}
                </div>
                <div className="text-sm text-gray-600">总市场数</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {markets.filter(m => m.blockchain_status === 'not_created').length}
                </div>
                <div className="text-sm text-gray-600">未上链</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {markets.filter(m => m.blockchain_status === 'created').length}
                </div>
                <div className="text-sm text-gray-600">已上链</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {markets.filter(m => m.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">活跃中</div>
              </div>
            </div>
            
            {/* 成本估算 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">💰 成本估算（测试网免费）</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>未上链市场数：</span>
                  <span className="font-semibold text-gray-900">
                    {markets.filter(m => m.blockchain_status === 'not_created').length} 个
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>如果全部上链需要：</span>
                  <span className="font-semibold text-orange-600">
                    约 {markets.filter(m => m.blockchain_status === 'not_created').length * 10} USDC + gas 费
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>已节省：</span>
                  <span className="font-semibold text-green-600">
                    约 {markets.filter(m => m.blockchain_status === 'not_created').length * 10} USDC 🎉
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


