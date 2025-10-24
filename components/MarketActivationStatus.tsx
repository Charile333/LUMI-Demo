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
  };
  onActivated?: (conditionId: string) => void;
}

export function MarketActivationStatus({ market, onActivated }: MarketActivationStatusProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState(market.blockchain_status);
  const [interestedCount, setInterestedCount] = useState(market.interested_users || 0);
  const [activationProgress, setActivationProgress] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [isActivating, setIsActivating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>(null);

  const ACTIVATION_THRESHOLD = 5; // 5 人感兴趣即激活

  // 连接 WebSocket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // 订阅此市场
    newSocket.emit('subscribe:market', market.id);

    // 监听感兴趣用户更新
    newSocket.on('market:interested:update', (data) => {
      if (data.marketId === market.id) {
        setInterestedCount(data.interestedUsers);
        setActivationProgress(data.progress);
        
        // 显示通知
        if (data.interestedUsers >= ACTIVATION_THRESHOLD - 1) {
          setNotification({
            type: 'info',
            message: `🔥 还需 ${ACTIVATION_THRESHOLD - data.interestedUsers} 人，市场即将激活！`
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
  const progress = Math.min((interestedCount / ACTIVATION_THRESHOLD) * 100, 100);

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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">✓</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-800">市场已激活</h4>
            <p className="text-sm text-green-600">可以开始交易了！</p>
          </div>
        </div>
      </div>
    );
  }

  if (isActivating || status === 'creating') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* 旋转加载器 */}
            <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800">正在激活市场...</h4>
            <p className="text-sm text-blue-600">
              预计剩余时间: <span className="font-mono font-bold">{countdown}</span> 秒
            </p>
            {/* 进度条 */}
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
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
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      {/* 通知横幅 */}
      {notification && (
        <div className={`mb-4 p-3 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-yellow-800">市场尚未激活</h4>
          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
            需要 {ACTIVATION_THRESHOLD} 人感兴趣
          </span>
        </div>

        {/* 进度条 */}
        <div>
          <div className="flex justify-between text-sm text-yellow-700 mb-1">
            <span>{interestedCount} 人已感兴趣</span>
            <span>还需 {Math.max(0, ACTIVATION_THRESHOLD - interestedCount)} 人</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-3">
            <div 
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${progress}%` }}
            >
              {progress >= 50 && (
                <span className="text-xs text-white font-bold">{Math.round(progress)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* 状态提示 */}
        <div className="text-xs text-yellow-700 space-y-1">
          {interestedCount >= ACTIVATION_THRESHOLD - 2 && interestedCount < ACTIVATION_THRESHOLD && (
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-lg">🔥</span>
              <span className="font-semibold">即将激活！还差一点点</span>
            </div>
          )}
          {interestedCount >= ACTIVATION_THRESHOLD && (
            <div className="flex items-center gap-2 animate-bounce">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-green-600">达到激活条件！系统将在 1 分钟内激活</span>
            </div>
          )}
          {interestedCount < ACTIVATION_THRESHOLD - 2 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>点击"我感兴趣"加速激活</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



