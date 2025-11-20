'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle, 
  faTimes,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    url: string;
  };
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    url: string;
  };
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      action: options.action,
      link: options.link
    };

    setToasts(prev => [...prev, toast]);

    // 自动移除
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  const info = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // 动画持续时间
  };

  // 图标配置
  const iconConfig = {
    success: { icon: faCheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' },
    error: { icon: faExclamationCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
    warning: { icon: faExclamationCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' },
    info: { icon: faInfoCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' }
  };

  const config = iconConfig[toast.type];

  return (
    <div
      className={`
        pointer-events-auto
        bg-zinc-900/95 backdrop-blur-md border ${config.border}
        rounded-xl shadow-2xl
        p-4 pr-12
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-y-[-20px] opacity-0 scale-95' 
          : 'translate-y-0 opacity-100 scale-100'
        }
        animate-in slide-in-from-top-4 fade-in duration-300
      `}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
          <FontAwesomeIcon icon={config.icon} className={`${config.color} text-lg`} />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm leading-relaxed whitespace-pre-line">
            {toast.message}
          </p>

          {/* 操作按钮 */}
          {(toast.action || toast.link) && (
            <div className="mt-3 flex gap-2">
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    handleRemove();
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 
                           rounded-lg text-xs text-amber-400 font-medium transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
              {toast.link && (
                <a
                  href={toast.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 
                           rounded-lg text-xs text-blue-400 font-medium transition-colors
                           flex items-center gap-1"
                >
                  {toast.link.label}
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
        </button>
      </div>

      {/* 进度条 */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${config.bg}`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}








































