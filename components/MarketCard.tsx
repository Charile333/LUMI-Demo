// 📊 市场卡片组件（完整版 - 带实时价格）

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useMarketPrice } from '@/hooks/useMarketPrice';
import { useMarketParticipants } from '@/hooks/useMarketParticipants';
import { usePriceChange24h } from '@/hooks/usePriceChange24h';
import { supabase } from '@/lib/supabase-client';
import CompactTradeModal from './trading/CompactTradeModal';
import { PercentagePriceSkeleton } from './Loading';

interface MarketCardProps {
  market: {
    id: number;
    title: string;
    description: string;
    blockchain_status: string;
    interested_users: number;
    views: number;
    activity_score: number;
    condition_id?: string;
    main_category?: string;
    priority_level?: string;
    trading_volume?: number; // 交易量
    question_id?: string; // 添加 question_id
  };
  showPrice?: boolean; // 是否显示价格（默认 true）
}

export function MarketCard({ market: initialMarket, showPrice = true }: MarketCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [market, setMarket] = useState(initialMarket);
  const [tradingVolume, setTradingVolume] = useState(initialMarket.trading_volume || 0);
  
  // 🎯 快速交易弹窗状态
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [initialOutcome, setInitialOutcome] = useState<'yes' | 'no'>('yes');
  
  // 🔥 获取实时价格（所有市场都获取）
  const price = useMarketPrice(
    market.id, 
    showPrice
  );

  // 🔥 获取实际参与人数（交易过的用户数）
  const { participants, loading: participantsLoading } = useMarketParticipants(
    market.id,
    true
  );

  // 🔥 获取24小时价格变化（真实数据，方案A）
  const { change: priceChange24h, loading: priceChangeLoading } = usePriceChange24h(
    market.id,
    showPrice
  );

  // 🔥 订阅 markets 表的实时更新（交易量和参与人数）
  useEffect(() => {
    const channel = supabase
      .channel(`market_card:${market.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${market.id}`
        },
        (payload) => {
          // 实时更新交易量和其他统计数据
          if (payload.new) {
            const newData = payload.new as any;
            if (newData.volume !== undefined) {
              setTradingVolume(newData.volume || 0);
            }
            // 同时更新 market 状态
            setMarket(prev => ({
              ...prev,
              trading_volume: newData.volume || prev.trading_volume,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [market.id]);

  // 🎯 处理快速交易按钮点击
  const handleQuickTrade = (outcome: 'yes' | 'no', e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
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
  
  // 获取流动性指示器
  const getLiquidityIndicator = (spread: number) => {
    if (spread < 0.02) return { color: 'text-green-500', icon: '🟢', label: t('market.highLiquidity') };
    if (spread < 0.10) return { color: 'text-yellow-500', icon: '🟡', label: t('market.mediumLiquidity') };
    return { color: 'text-red-500', icon: '🔴', label: t('market.lowLiquidity') };
  };

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
          {/* 24小时价格变化（真实数据） */}
          {priceChangeLoading ? (
            <span className="flex items-center gap-0.5 text-xs text-gray-500 animate-pulse">
              <span>--</span>
            </span>
          ) : priceChange24h !== 0 ? (
            <span className={`flex items-center gap-0.5 text-xs font-semibold whitespace-nowrap ${
              priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{priceChange24h >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(priceChange24h).toFixed(1)}%</span>
            </span>
          ) : null}
        </div>

        {/* 标签区 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* 推荐标签 */}
          <span className="flex items-center gap-1 text-xs bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded border border-orange-500/30">
            <span>🔥</span>
            <span>{t('market.recommended')}</span>
          </span>
          
          {/* 自定义标签 */}
          <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded border border-green-500/30">
            <span>📊</span>
            <span>{t('market.custom')}</span>
          </span>
          
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
              {price.loading ? (
                <PercentagePriceSkeleton />
              ) : (
                <div className="text-5xl font-bold text-orange-500 leading-none">
                  {price.probability.toFixed(0)}%
                </div>
              )}
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
            {price.loading ? (
              <div className="text-green-400 text-lg font-semibold mt-0.5 animate-pulse">
                --¢
              </div>
            ) : (
              <div className="text-green-400 text-lg font-semibold mt-0.5 group-hover:scale-110 transition-transform">
                {(price.yes * 100).toFixed(0)}¢
              </div>
            )}
          </button>
          
          {/* NO 按钮 */}
          <button 
            onClick={(e) => handleQuickTrade('no', e)}
            className="bg-red-700/30 hover:bg-red-700/50 border border-red-600/50 hover:border-red-500 rounded-lg py-4 px-3 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 group"
          >
            <div className="text-red-400 font-bold text-base tracking-wide group-hover:scale-105 transition-transform">
              {t('market.no').toUpperCase()}
            </div>
            {price.loading ? (
              <div className="text-red-400 text-lg font-semibold mt-0.5 animate-pulse">
                --¢
              </div>
            ) : (
              <div className="text-red-400 text-lg font-semibold mt-0.5 group-hover:scale-110 transition-transform">
                {(price.no * 100).toFixed(0)}¢
              </div>
            )}
          </button>
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💰</span>
            {/* 优先显示 markets 表的交易量（实时更新），如果没有则显示订单簿的 volume24h */}
            <span>${(tradingVolume || price.volume24h || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">👥</span>
            {participantsLoading ? (
              <span className="animate-pulse">--{t('market.participants')}</span>
            ) : (
              <span>{participants}{t('market.participants')}</span>
            )}
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
          questionId: market.question_id || `market-${market.id}`,
          conditionId: market.condition_id || null
        }}
        initialOutcome={initialOutcome}
      />
    </div>
  );
}



