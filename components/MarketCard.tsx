// 📊 市场卡片组件（完整版 - 带实时价格）

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useMarketPrice } from '@/hooks/useMarketPrice';
import { useMarketParticipants } from '@/hooks/useMarketParticipants';

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
  };
  showPrice?: boolean; // 是否显示价格（默认 true）
}

export function MarketCard({ market: initialMarket, showPrice = true }: MarketCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [market, setMarket] = useState(initialMarket);
  const [priceChange24h, setPriceChange24h] = useState(0);
  
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

  // 🔥 计算24小时价格变化（模拟，实际应该从历史数据获取）
  // TODO: 从数据库获取历史价格数据进行计算
  const calculatePriceChange = () => {
    if (!price.loading && price.probability > 0) {
      // 这里是模拟数据，实际应该从历史表中获取24h前的价格
      const change = Math.random() * 10 - 5; // -5% 到 +5% 的随机变化
      setPriceChange24h(Number(change.toFixed(1)));
    }
  };

  // 当价格加载完成后计算变化
  if (!price.loading && priceChange24h === 0 && price.probability > 0) {
    calculatePriceChange();
  }
  
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
          {!price.loading && (
            <span className={`flex items-center gap-0.5 text-xs whitespace-nowrap ${
              priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{priceChange24h >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(priceChange24h)}%</span>
            </span>
          )}
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
                <div className="text-5xl font-bold text-orange-500 leading-none animate-pulse">
                  ---%
                </div>
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

        {/* YES/NO 按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* YES 按钮 */}
          <button className="bg-green-700/30 hover:bg-green-700/40 border border-green-600/50 rounded-lg py-4 px-3 transition-all duration-200">
            <div className="text-green-400 font-bold text-base tracking-wide">{t('market.yes').toUpperCase()}</div>
            {price.loading ? (
              <div className="text-green-400 text-lg font-semibold mt-0.5 animate-pulse">
                --¢
              </div>
            ) : (
              <div className="text-green-400 text-lg font-semibold mt-0.5">
                {(price.bestBid * 100).toFixed(0)}¢
              </div>
            )}
          </button>
          
          {/* NO 按钮 */}
          <button className="bg-red-700/30 hover:bg-red-700/40 border border-red-600/50 rounded-lg py-4 px-3 transition-all duration-200">
            <div className="text-red-400 font-bold text-base tracking-wide">{t('market.no').toUpperCase()}</div>
            {price.loading ? (
              <div className="text-red-400 text-lg font-semibold mt-0.5 animate-pulse">
                --¢
              </div>
            ) : (
              <div className="text-red-400 text-lg font-semibold mt-0.5">
                {(price.bestAsk * 100).toFixed(0)}¢
              </div>
            )}
          </button>
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💰</span>
            {price.loading ? (
              <span className="animate-pulse">--</span>
            ) : (
              <span>${price.volume24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            )}
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

    </div>
  );
}



