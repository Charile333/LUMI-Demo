// 🔮 UMA 预言机状态展示组件
// 显示市场结算状态、倒计时、操作按钮

'use client';

import { useEffect, useState } from 'react';
import { useOracleStatus } from '@/lib/contexts/UMAOracleContext';
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';

interface UMAOracleStatusProps {
  marketId: number;
  questionId?: string;
  showActions?: boolean; // 是否显示操作按钮
  compact?: boolean;      // 紧凑模式（用于卡片）
}

export function UMAOracleStatus({ 
  marketId, 
  questionId,
  showActions = true,
  compact = false
}: UMAOracleStatusProps) {
  const { status, loading } = useOracleStatus(marketId);
  const polymarket = useLUMIPolymarket();
  const [countdown, setCountdown] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 倒计时逻辑
  useEffect(() => {
    if (!status) return;

    const updateCountdown = () => {
      const now = new Date();
      let targetDate: Date | null = null;
      let label = '';

      if (status.state === 'active' && status.settlementDeadline) {
        targetDate = status.settlementDeadline;
        label = '距离截止';
      } else if (status.state === 'requested' && status.challengePeriodEnd) {
        targetDate = status.challengePeriodEnd;
        label = '挑战期剩余';
      }

      if (targetDate) {
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setCountdown(`${label}: ${hours}小时 ${minutes}分 ${seconds}秒`);
        } else {
          setCountdown('已到期');
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [status]);

  // 处理结算操作
  const handleRequestSettlement = async () => {
    if (!questionId || !polymarket.isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await polymarket.requestSettlement(questionId);
      console.log('✅ 结算请求已提交:', result.transactionHash);
      alert('结算请求已提交！请等待2小时挑战期。');
    } catch (error: any) {
      console.error('❌ 结算请求失败:', error);
      alert('结算请求失败: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveMarket = async () => {
    if (!questionId || !polymarket.isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await polymarket.resolveMarket(questionId);
      console.log('✅ 市场已结算:', result.transactionHash);
      alert('市场已成功结算！');
    } catch (error: any) {
      console.error('❌ 结算失败:', error);
      alert('结算失败: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !status) {
    return null; // 或返回骨架屏
  }

  // 🎨 紧凑模式（用于卡片）
  if (compact) {
    return (
      <div className="text-xs">
        {status.state === 'active' && (
          <div className="flex items-center gap-1 text-green-400">
            <span>🟢</span>
            <span>交易中</span>
          </div>
        )}
        
        {status.state === 'ended' && (
          <div className="flex items-center gap-1 text-yellow-400">
            <span>🟡</span>
            <span>等待结算</span>
          </div>
        )}
        
        {status.state === 'requested' && (
          <div className="flex items-center gap-1 text-orange-400">
            <span>⏳</span>
            <span>挑战期中</span>
          </div>
        )}
        
        {status.state === 'resolved' && status.finalResult && (
          <div className={`flex items-center gap-1 font-semibold ${
            status.finalResult === 'YES' ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>✅</span>
            <span>结果: {status.finalResult}</span>
          </div>
        )}
      </div>
    );
  }

  // 🎨 完整模式（用于详情页）
  return (
    <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        🔮 UMA 预言机状态
      </h3>

      {/* 状态卡片 */}
      <div className="space-y-4">
        
        {/* 交易中 */}
        {status.state === 'active' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🟢</span>
              <span className="font-semibold text-green-400">市场交易中</span>
            </div>
            <div className="text-sm text-gray-400">
              {countdown || '正在交易...'}
            </div>
          </div>
        )}

        {/* 已到期，等待结算 */}
        {status.state === 'ended' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🟡</span>
              <span className="font-semibold text-yellow-400">市场已到期</span>
            </div>
            <div className="text-sm text-gray-400 mb-4">
              等待发起结算请求
            </div>
            
            {showActions && status.canSettle && (
              <button
                onClick={handleRequestSettlement}
                disabled={isProcessing || !polymarket.isConnected}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isProcessing ? '处理中...' : '🔮 请求 UMA 结算'}
              </button>
            )}
          </div>
        )}

        {/* 结算请求中（挑战期） */}
        {status.state === 'requested' && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏳</span>
              <span className="font-semibold text-orange-400">挑战期中</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {countdown}
            </div>
            <div className="text-xs text-gray-500">
              任何人都可以在挑战期内争议结果
            </div>
          </div>
        )}

        {/* 提案已通过，可以最终确认 */}
        {status.state === 'proposed' && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-blue-400">挑战期已过</span>
            </div>
            <div className="text-sm text-gray-400 mb-4">
              可以最终确认结算结果
            </div>
            
            {showActions && status.canResolve && (
              <button
                onClick={handleResolveMarket}
                disabled={isProcessing || !polymarket.isConnected}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isProcessing ? '处理中...' : '✅ 最终确认结算'}
              </button>
            )}
          </div>
        )}

        {/* 已争议 */}
        {status.state === 'disputed' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold text-red-400">结果被争议</span>
            </div>
            <div className="text-sm text-gray-400">
              等待 UMA 代币持有者投票决定
            </div>
          </div>
        )}

        {/* 已结算 */}
        {status.state === 'resolved' && status.finalResult && (
          <div className={`border rounded-lg p-4 ${
            status.finalResult === 'YES' 
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className={`font-semibold ${
                status.finalResult === 'YES' ? 'text-green-400' : 'text-red-400'
              }`}>
                市场已结算
              </span>
            </div>
            <div className="text-lg font-bold mb-2">
              结果: <span className={status.finalResult === 'YES' ? 'text-green-400' : 'text-red-400'}>
                {status.finalResult}
              </span>
            </div>
            
            {showActions && status.canRedeem && (
              <button
                onClick={() => {
                  // 跳转到赎回页面
                  window.location.href = `/market/${marketId}/redeem`;
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                💰 赎回奖励
              </button>
            )}
          </div>
        )}

        {/* 时间线 */}
        <div className="border-t border-white/10 pt-4">
          <div className="text-sm text-gray-500 mb-2">时间线</div>
          <div className="space-y-2 text-sm">
            {status.settlementDeadline && (
              <div className="flex justify-between">
                <span className="text-gray-400">市场截止:</span>
                <span className="text-white">
                  {status.settlementDeadline.toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            
            {status.requestedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">请求结算:</span>
                <span className="text-white">
                  {status.requestedAt.toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            
            {status.challengePeriodEnd && (
              <div className="flex justify-between">
                <span className="text-gray-400">挑战期结束:</span>
                <span className="text-white">
                  {status.challengePeriodEnd.toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            
            {status.resolvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">最终结算:</span>
                <span className="text-white">
                  {status.resolvedAt.toLocaleString('zh-CN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 紧凑状态徽章（用于卡片） ====================

export function OracleStatusBadge({ marketId }: { marketId: number }) {
  const { status } = useOracleStatus(marketId);

  if (!status) return null;

  const badges = {
    active: {
      icon: '🟢',
      text: '交易中',
      className: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    ended: {
      icon: '🟡',
      text: '待结算',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    requested: {
      icon: '⏳',
      text: '挑战期',
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    proposed: {
      icon: '✓',
      text: '可确认',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    disputed: {
      icon: '⚠️',
      text: '争议中',
      className: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    resolved: {
      icon: '✅',
      text: status.finalResult || '已结算',
      className: status.finalResult === 'YES'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  };

  const badge = badges[status.state];

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium ${badge.className}`}>
      <span>{badge.icon}</span>
      <span>{badge.text}</span>
    </div>
  );
}

// ==================== 倒计时组件 ====================

export function OracleCountdown({ marketId }: { marketId: number }) {
  const { status } = useOracleStatus(marketId);
  const [countdown, setCountdown] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    if (!status) return;

    const updateCountdown = () => {
      const now = new Date();
      let targetDate: Date | null = null;
      let startDate: Date | null = null;

      if (status.state === 'requested' && status.challengePeriodEnd && status.requestedAt) {
        startDate = status.requestedAt;
        targetDate = status.challengePeriodEnd;
      } else {
        return;
      }

      const total = targetDate.getTime() - startDate.getTime();
      const remaining = targetDate.getTime() - now.getTime();
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        setCountdown(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setPercentage(100 - (remaining / total * 100));
      } else {
        setCountdown('00:00:00');
        setPercentage(100);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [status]);

  if (!countdown) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-2">挑战期倒计时</div>
      <div className="text-3xl font-bold text-orange-400 mb-3">
        {countdown}
      </div>
      
      {/* 进度条 */}
      <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        {percentage >= 100 ? '挑战期已结束，可以最终确认' : '等待挑战期结束'}
      </div>
    </div>
  );
}























