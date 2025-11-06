// 🔔 市场激活状态组件（带实时通知和倒计时）

'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface MarketActivationStatusProps {
  market: {
    id: number;
    title: string;
    blockchain_status: string;
    interested_users: number;
    condition_id?: string;
    trading_volume?: number; // 交易量
  };
  onActivated?: (conditionId: string) => void;
}

export function MarketActivationStatus({ market, onActivated }: MarketActivationStatusProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState(market.blockchain_status);
  const [tradingVolume, setTradingVolume] = useState(market.trading_volume || 0);
  const [activationProgress, setActivationProgress] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [isActivating, setIsActivating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>(null);

  const ACTIVATION_THRESHOLD = 100; // $100 交易量即激活

  // 连接 WebSocket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // 订阅此市场
    newSocket.emit('subscribe:market', market.id);

    // 监听交易量更新
    newSocket.on('market:volume:update', (data) => {
      if (data.marketId === market.id) {
        setTradingVolume(data.tradingVolume);
        setActivationProgress(data.progress);
        
        // 显示通知
        const remaining = ACTIVATION_THRESHOLD - data.tradingVolume;
        if (remaining <= 20 && remaining > 0) {
          setNotification({
            type: 'info',
            message: `🔥 还需 $${remaining.toFixed(0)} 交易量，市场即将激活！`
          });
        }
      }
    });

    // 监听市场激活中
    newSocket.on('market:activating', (data) => {
      if (data.marketId === market.id) {
        setIsActivating(true);
        setStatus('creating');
        setNotification({
          type: 'info',
          message: '🚀 市场正在激活中...'
        });
        
        // 开始倒计时
        let timeLeft = 30;
        const timer = setInterval(() => {
          timeLeft--;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    });

    // 监听市场已激活
    newSocket.on('market:activated', (data) => {
      if (data.marketId === market.id) {
        setIsActivating(false);
        setStatus('created');
        setNotification({
          type: 'success',
          message: '✅ 市场已激活！现在可以交易了'
        });
        
        // 播放成功音效（可选）
        playSuccessSound();
        
        // 回调
        if (onActivated) {
          onActivated(data.conditionId);
        }
        
        // 3 秒后隐藏通知
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    });

    // 监听激活失败
    newSocket.on('market:activation:failed', (data) => {
      if (data.marketId === market.id) {
        setIsActivating(false);
        setStatus('failed');
        setNotification({
          type: 'error',
          message: '❌ 激活失败: ' + data.error
        });
      }
    });

    // 清理
    return () => {
      newSocket.emit('unsubscribe:market', market.id);
      newSocket.close();
    };
  }, [market.id]);

  // 计算进度百分比
  const progress = Math.min((tradingVolume / ACTIVATION_THRESHOLD) * 100, 100);

  // 播放成功音效
  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.play().catch(() => {
        // 忽略音频播放错误
      });
    } catch (error) {
      // 忽略
    }
  };

  // 渲染不同状态
  if (status === 'created') {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <span className="text-green-400 text-xl">✓</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-400">市场已激活</h4>
            <p className="text-sm text-green-300/80">可以开始交易了！</p>
          </div>
        </div>
      </div>
    );
  }

  if (isActivating || status === 'creating') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* 旋转加载器 */}
            <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-400">正在激活市场...</h4>
            <p className="text-sm text-blue-300/80">
              预计剩余时间: <span className="font-mono font-bold">{countdown}</span> 秒
            </p>
            {/* 进度条 */}
            <div className="w-full bg-blue-900/30 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((30 - countdown) / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 未激活状态
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
      {/* 通知横幅 */}
      {notification && (
        <div className={`mb-4 p-3 rounded-lg ${
          notification.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          notification.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
          'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-amber-400">市场未激活</h4>
          <span className="text-xs text-amber-300 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30">
            需要 ${ACTIVATION_THRESHOLD} 交易量
          </span>
        </div>

        {/* 进度条 */}
        <div>
          <div className="flex justify-between text-sm text-amber-300/80 mb-1">
            <span>当前交易量: ${tradingVolume.toFixed(2)}</span>
            <span>还需 ${Math.max(0, ACTIVATION_THRESHOLD - tradingVolume).toFixed(2)}</span>
          </div>
          <div className="w-full bg-amber-900/30 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${progress}%` }}
            >
              {progress >= 20 && (
                <span className="text-xs text-white font-bold">{Math.round(progress)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* 状态提示 */}
        <div className="text-xs text-amber-300/80 space-y-1">
          {progress >= 80 && progress < 100 && (
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-lg">🔥</span>
              <span className="font-semibold text-amber-400">即将激活！还差 ${(ACTIVATION_THRESHOLD - tradingVolume).toFixed(2)}</span>
            </div>
          )}
          {progress >= 100 && (
            <div className="flex items-center gap-2 animate-bounce">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-green-400">达到激活条件！系统正在自动激活...</span>
            </div>
          )}
          {progress < 80 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>开始交易以激活市场（当前可模拟交易）</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



