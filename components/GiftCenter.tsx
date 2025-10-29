'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function GiftCenter() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(5);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ title: '', message: '' });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClaimGift = (giftType: string) => {
    let title = '';
    let message = '';
    
    switch (giftType) {
      case 'new-user':
        title = t('giftCenter.newUserSuccess', '新手礼包领取成功');
        message = t('giftCenter.newUserMessage', '0.01 ETH 和 20 免费 spins 已存入您的账户');
        break;
      case 'vip':
        title = t('giftCenter.vipSuccess', 'VIP专属礼包领取成功');
        message = t('giftCenter.vipMessage', '1 ETH 和 100 免费 spins 已存入您的账户');
        break;
    }
    
    setToastData({ title, message });
    setShowToast(true);
    if (unreadCount > 0) setUnreadCount(unreadCount - 1);
    
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* 福利图标按钮 */}
      <div className="relative" ref={popupRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-[#b8860b] transition-colors relative p-1.5 rounded-full hover:bg-[#1a1a1a] focus:outline-none"
        >
          <i className="fa fa-gift text-[#b8860b] text-lg animate-bounce-slow"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-[#121212] text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 福利中心弹窗 */}
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <div className="fixed inset-0 bg-black/50 z-[110]" style={{ backdropFilter: 'blur(1px)' }} />
            
            {/* 弹窗内容 */}
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden z-[120] transform origin-top-right transition-all duration-300 ease-in-out">
              {/* 弹窗头部 */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center" suppressHydrationWarning>
                <h3 className="text-lg font-semibold flex items-center">
                  <i className="fa fa-gift text-[#b8860b] mr-2"></i>
                  {t('giftCenter.title', '福利中心')}
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-[#b8860b]/20 text-[#b8860b] text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}{t('giftCenter.unclaimed', '个未领取')}
                  </span>
                )}
              </div>

              {/* 弹窗内容区 */}
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin" suppressHydrationWarning>
                {/* 新手福利 */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-white flex items-center">
                      <i className="fa fa-rocket text-[#f59e0b] mr-2"></i>
                      {t('giftCenter.newUserTitle', '新手专享')}
                    </h4>
                    <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">
                      {t('giftCenter.viewAll', '查看全部')}
                    </a>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg border border-gray-700 p-3 transition-all duration-300 hover:border-[#b8860b]/70 hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-medium">{t('giftCenter.registerGift', '注册即领礼包')}</h5>
                        <p className="text-xs text-gray-400 mt-1">0.01 ETH + 20 {t('giftCenter.freeSpins', '免费 spins')}</p>
                        <div className="flex items-center mt-2 text-xs">
                          <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded mr-2">{t('giftCenter.noDeposit', '无需存款')}</span>
                          <span className="text-gray-500">{t('giftCenter.remaining', '剩余')}: 3{t('giftCenter.days', '天')}2{t('giftCenter.hours', '小时')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimGift('new-user')}
                        className="bg-[#b8860b] text-[#121212] text-xs font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity"
                      >
                        {t('giftCenter.claim', '立即领取')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 存款福利 */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-white flex items-center">
                      <i className="fa fa-money text-[#3b82f6] mr-2"></i>
                      {t('giftCenter.depositRewards', '存款奖励')}
                    </h4>
                    <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">
                      {t('giftCenter.viewAll', '查看全部')}
                    </a>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-[#121212] rounded-lg border border-gray-700 p-3 transition-all duration-300 hover:border-[#b8860b]/70 hover:-translate-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-medium">{t('giftCenter.firstDepositDouble', '首次存款翻倍')}</h5>
                          <p className="text-xs text-gray-400 mt-1">100% {t('giftCenter.bonusCap', '奖金上限')} 2 ETH</p>
                          <div className="flex items-center mt-2 text-xs">
                            <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded mr-2">{t('giftCenter.firstDepositOnly', '首存专享')}</span>
                            <span className="text-gray-500">{t('giftCenter.remaining', '剩余')}: 7{t('giftCenter.days', '天')}5{t('giftCenter.hours', '小时')}</span>
                          </div>
                        </div>
                        <button className="bg-[#121212] border border-[#b8860b]/30 text-[#b8860b] text-xs font-medium px-3 py-1 rounded hover:bg-[#b8860b]/10 transition-colors">
                          {t('giftCenter.goDeposit', '去存款')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 任务奖励 */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-white flex items-center">
                      <i className="fa fa-tasks text-[#10b981] mr-2"></i>
                      {t('giftCenter.taskRewards', '任务奖励')}
                    </h4>
                    <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">
                      {t('giftCenter.viewAll', '查看全部')}
                    </a>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg border border-gray-700 p-3 transition-all duration-300 hover:border-[#b8860b]/70 hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-medium">{t('giftCenter.dailyCheckin', '每日签到奖励')}</h5>
                        <p className="text-xs text-gray-400 mt-1">{t('giftCenter.checkinDesc', '连续签到7天领大奖')}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                              <div
                                key={day}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                  day <= 3
                                    ? 'bg-[#b8860b] text-[#121212]'
                                    : 'bg-[#1a1a1a] border border-gray-600 text-gray-500'
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button className="bg-[#10b981] text-white text-xs font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity">
                        {t('giftCenter.checkedIn', '已签到')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIP专属 */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-white flex items-center">
                      <i className="fa fa-diamond text-[#b8860b] mr-2"></i>
                      {t('giftCenter.exclusiveGifts', '专属福利')}
                    </h4>
                    <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">
                      {t('giftCenter.viewAll', '查看全部')}
                    </a>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg border border-[#b8860b]/30 p-3 transition-all duration-300 hover:border-[#b8860b]/70 hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-medium flex items-center">
                          <i className="fa fa-star text-[#b8860b] mr-1"></i>
                          {t('giftCenter.vipGift', 'VIP 专属礼包')}
                        </h5>
                        <p className="text-xs text-gray-400 mt-1">1 ETH + 100 {t('giftCenter.freeSpins', '免费 spins')}</p>
                        <div className="flex items-center mt-2 text-xs">
                          <span className="bg-[#b8860b]/20 text-[#b8860b] px-1.5 py-0.5 rounded mr-2">VIP {t('giftCenter.exclusive', '专享')}</span>
                          <span className="text-gray-500">{t('giftCenter.remaining', '剩余')}: 15{t('giftCenter.days', '天')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimGift('vip')}
                        className="bg-[#b8860b] text-[#121212] text-xs font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity"
                      >
                        {t('giftCenter.claim', '立即领取')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 弹窗底部 */}
              <div className="p-4 border-t border-gray-800 bg-[#121212]/50" suppressHydrationWarning>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    <i className="fa fa-info-circle text-[#b8860b] mr-1"></i>
                    {t('giftCenter.wageringNote', '福利领取后需满足相应 wagering 要求')}
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {t('giftCenter.close', '关闭')} <i className="fa fa-times ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast 通知 */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[#1a1a1a] border border-[#b8860b]/30 rounded-lg p-4 shadow-lg z-[100] animate-in slide-in-from-top-5 max-w-xs">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-[#b8860b] mr-3">
              <i className="fa fa-check-circle text-xl"></i>
            </div>
            <div>
              <h4 className="font-medium text-white">{toastData.title}</h4>
              <p className="text-sm text-gray-300 mt-1">{toastData.message}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-auto text-gray-400 hover:text-white">
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #121212;
        }
      `}</style>
    </>
  );
}

