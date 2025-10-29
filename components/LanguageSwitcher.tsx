'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface LanguageSwitcherProps {
  theme?: 'dark' | 'light';
}

export default function LanguageSwitcher({ theme = 'dark' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 根据主题选择颜色
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 85, 247, 0.1)';
  const bgHoverColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(168, 85, 247, 0.2)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.3)';
  const borderHoverColor = isDark ? 'rgba(245, 158, 11, 0.5)' : 'rgba(168, 85, 247, 0.5)';
  const textColor = isDark ? 'rgb(251, 191, 36)' : 'rgb(109, 40, 217)';
  const dropdownBg = isDark ? 'rgb(24, 24, 27)' : 'rgb(255, 255, 255)';
  const dropdownBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.3)';

  if (!mounted) {
    return (
      <div style={{ position: 'relative' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: textColor }}>EN</span>
        </button>
      </div>
    );
  }

  const currentLanguage = i18n.language || 'en';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lumi-language', lng);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          background: bgColor,
          border: `2px solid ${borderColor}`,
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = bgHoverColor;
          e.currentTarget.style.borderColor = borderHoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor;
          e.currentTarget.style.borderColor = borderColor;
        }}
      >
        <svg 
          style={{ width: '1.25rem', height: '1.25rem', color: textColor }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: textColor, textTransform: 'uppercase' }}>
          {currentLanguage}
        </span>
        <svg
          style={{ 
            width: '1rem', 
            height: '1rem', 
            color: textColor,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: '12rem',
            borderRadius: '0.5rem',
            background: dropdownBg,
            border: `2px solid ${dropdownBorder}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            overflow: 'hidden',
            backdropFilter: 'blur(24px)'
          }}>
            <button
              onClick={() => changeLanguage('en')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: currentLanguage === 'en' ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 85, 247, 0.1)') : 'transparent',
                color: isDark ? (currentLanguage === 'en' ? 'rgb(251, 191, 36)' : 'rgb(209, 213, 219)') : (currentLanguage === 'en' ? 'rgb(109, 40, 217)' : 'rgb(107, 114, 128)'),
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(168, 85, 247, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLanguage === 'en' ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 85, 247, 0.1)') : 'transparent'}
            >
              <span style={{ fontWeight: '600' }}>English</span>
              {currentLanguage === 'en' && (
                <svg style={{ width: '1.25rem', height: '1.25rem', color: isDark ? 'rgb(245, 158, 11)' : 'rgb(168, 85, 247)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => changeLanguage('zh')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: currentLanguage === 'zh' ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 85, 247, 0.1)') : 'transparent',
                color: isDark ? (currentLanguage === 'zh' ? 'rgb(251, 191, 36)' : 'rgb(209, 213, 219)') : (currentLanguage === 'zh' ? 'rgb(109, 40, 217)' : 'rgb(107, 114, 128)'),
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(168, 85, 247, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLanguage === 'zh' ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(168, 85, 247, 0.1)') : 'transparent'}
            >
              <span style={{ fontWeight: '600' }}>中文</span>
              {currentLanguage === 'zh' && (
                <svg style={{ width: '1.25rem', height: '1.25rem', color: isDark ? 'rgb(245, 158, 11)' : 'rgb(168, 85, 247)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}




