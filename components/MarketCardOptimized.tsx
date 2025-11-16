// 📊 优化后的市场卡片组件
// 使用全局Context，无需独立请求数据

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useMarketData } from '@/lib/contexts/MarketDataContext';
import CompactTradeModal from './trading/CompactTradeModal';

interface MarketCardOptimizedProps {
  market: {
    id: number;
    title: string;
    description: string;
    blockchain_status: string;
    main_category?: string;
    priority_level?: string;
    question_id?: string;
  };
}

export function MarketCardOptimized({ market }: MarketCardOptimizedProps) {
  const { t } = useTranslation();
  const router = useRouter();
  
  // 🔥 从全局Context获取数据（核心优化）
  const { stats, loading } = useMarketData(market.id);
  
  // 🐛 调试：输出接收到的数据
  useEffect(() => {
    if (stats && !loading) {
      console.log(`📊 MarketCardOptimized [${market.id}] 显示数据:`, {
        marketId: market.id,
        title: market.title,
        probability: stats.probability,
        yes: stats.yes,
        no: stats.no,
        bestBid: stats.bestBid,
        bestAsk: stats.bestAsk,
        计算验证: {
          中间价: (stats.bestBid + stats.bestAsk) / 2,
          应该显示YES: ((stats.bestBid + stats.bestAsk) / 2 * 100).toFixed(0) + '¢',
          实际显示YES: (stats.yes * 100).toFixed(0) + '¢'
        }
      });
    }
  }, [stats, loading, market.id, market.title]);
  
  // 🎯 交易弹窗状态
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [initialOutcome, setInitialOutcome] = useState<'yes' | 'no'>('yes');

  // 🎯 处理快速交易
  const handleQuickTrade = (outcome: 'yes' | 'no', e: React.MouseEvent) => {
    e.stopPropagation();
    setInitialOutcome(outcome);
    setIsTradeModalOpen(true);
  };

  // 类别徽章颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      automotive: 'bg-blue-100 text-blue-800',
      'tech-ai': 'bg-purple-100 text-purple-800',
      'sports-gaming': 'bg-green-100 text-green-800',
      'economy-social': 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-pink-100 text-pink-800',
      'smart-devices': 'bg-indigo-100 text-indigo-800',
      emerging: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // 🎨 骨架屏（加载中）
  if (loading || !stats) {
    return (
      <div className="bg-black rounded-2xl shadow-xl overflow-hidden border border-zinc-800 animate-pulse">
        <div className="p-5">
          {/* 标题骨架 */}
          <div className="h-6 bg-zinc-800 rounded mb-3 w-3/4"></div>
          
          {/* 标签骨架 */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-zinc-800 rounded w-20"></div>
            <div className="h-6 bg-zinc-800 rounded w-16"></div>
          </div>
          
          {/* 概率骨架 */}
          <div className="mb-5">
            <div className="h-12 bg-zinc-800 rounded w-32"></div>
          </div>
          
          {/* 按钮骨架 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-16 bg-zinc-800 rounded"></div>
            <div className="h-16 bg-zinc-800 rounded"></div>
          </div>
          
          {/* 底部信息骨架 */}
          <div className="flex justify-between pt-3 border-t border-zinc-800/50">
            <div className="h-4 bg-zinc-800 rounded w-20"></div>
            <div className="h-4 bg-zinc-800 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-zinc-800">
      {/* 卡片头部 */}
      <div className="p-5">
        {/* 标题和涨跌 */}
        <div className="flex items-start justify-between mb-3">
          <h3 
            className="text-base font-semibold text-white leading-tight flex-1 pr-2 cursor-pointer hover:text-orange-400 transition-colors duration-200"
            onClick={() => router.push(`/market/${market.id}`)}
          >
            {market.title}
          </h3>
          
          {/* 24小时价格变化 */}
          {stats.priceChange24h !== 0 && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold whitespace-nowrap ${
              stats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{stats.priceChange24h >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(stats.priceChange24h).toFixed(1)}%</span>
            </span>
          )}
        </div>

        {/* 标签区 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* 推荐标签 */}
          {market.priority_level === 'hot' && (
            <span className="flex items-center gap-1 text-xs bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded border border-orange-500/30">
              <span>🔥</span>
              <span>{t('market.recommended')}</span>
            </span>
          )}
          
          {/* 分类标签 */}
          {market.main_category && (
            <span className="text-xs bg-zinc-800 text-gray-400 px-2.5 py-1 rounded">
              {t(`categories.${market.main_category.replace('-', '')}`) || market.main_category}
            </span>
          )}
        </div>

        {/* 当前概率和截止日期 */}
        <div className="mb-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">{t('market.currentProbability')}</div>
              <div className="text-5xl font-bold text-orange-500 leading-none">
                {stats.probability.toFixed(0)}%
              </div>
            </div>
            <div className="text-right pb-1">
              <div className="text-xs text-gray-500 mb-1">{t('market.deadline')}</div>
              <div className="text-sm text-gray-400">2025/12/31</div>
            </div>
          </div>
        </div>

        {/* YES/NO 交易按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* YES 按钮 */}
          <button 
            onClick={(e) => handleQuickTrade('yes', e)}
            className="bg-green-700/30 hover:bg-green-700/50 border border-green-600/50 hover:border-green-500 rounded-lg py-4 px-3 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 group"
          >
            <div className="text-green-400 font-bold text-base tracking-wide group-hover:scale-105 transition-transform">
              {t('market.yes').toUpperCase()}
            </div>
            <div className="text-green-400 text-lg font-semibold mt-0.5 group-hover:scale-110 transition-transform">
              {(stats.yes * 100).toFixed(0)}¢
            </div>
          </button>
          
          {/* NO 按钮 */}
          <button 
            onClick={(e) => handleQuickTrade('no', e)}
            className="bg-red-700/30 hover:bg-red-700/50 border border-red-600/50 hover:border-red-500 rounded-lg py-4 px-3 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 group"
          >
            <div className="text-red-400 font-bold text-base tracking-wide group-hover:scale-105 transition-transform">
              {t('market.no').toUpperCase()}
            </div>
            <div className="text-red-400 text-lg font-semibold mt-0.5 group-hover:scale-110 transition-transform">
              {(stats.no * 100).toFixed(0)}¢
            </div>
          </button>
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💰</span>
            <span>
              ${(stats.volume24h || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">👥</span>
            <span>{stats.participants}{t('market.participants')}</span>
          </div>
        </div>
      </div>

      {/* 🎯 紧凑交易弹窗 */}
      <CompactTradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        market={{
          id: market.id,
          title: market.title,
          questionId: market.question_id || `market-${market.id}`
        }}
        initialOutcome={initialOutcome}
      />
    </div>
  );
}


