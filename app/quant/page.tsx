'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';

export default function QuantPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* 背景动画效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-cyan-950 opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* 动态光晕效果 */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slower"></div>

      {/* 返回按钮 - 左上角 */}
      <a
        href="/markets/hot"
        className="fixed top-8 left-8 z-20 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-all group backdrop-blur-sm bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
        <span className="text-sm tracking-wider">BACK TO MARKETS</span>
      </a>

      <div className="text-center relative z-10">
        {/* SOON - 带渐变和阴影 */}
        <h1 className="text-8xl md:text-9xl font-black mb-8 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(59,130,246,0.5)] tracking-tight">
          {t('nav.soon')}
        </h1>

        {/* 产品名字 - 优雅字体 */}
        <h2 className="text-4xl md:text-6xl font-light text-white mb-8 tracking-widest uppercase">
          {t('nav.aiQuant')}
        </h2>

        {/* 分割线 */}
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>

        {/* 上线时间 - 精致样式 */}
        <div className="inline-block">
          <p className="text-2xl md:text-3xl font-extralight text-blue-300 tracking-[0.3em] relative">
            2026-Q3
            <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

