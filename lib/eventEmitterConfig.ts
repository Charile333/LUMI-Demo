/**
 * EventEmitter 配置
 * 用于解决 WalletConnect 的 MaxListenersExceededWarning
 */

// 仅在服务端运行
if (typeof window === 'undefined') {
  // 增加 EventEmitter 的最大监听器数量
  // WalletConnect 需要更多的监听器
  require('events').EventEmitter.defaultMaxListeners = 20;
  
  console.log('✅ EventEmitter maxListeners 已设置为 20');
}

export {};











































