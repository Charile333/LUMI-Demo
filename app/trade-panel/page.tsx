import React from 'react';

/**
 * Polymarket 交易面板页面
 * 
 * 展示使用Wagmi和MetaMask连接钱包并提交订单的功能
 */
const TradePanelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <header className="bg-white shadow-sm mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Polymarket 交易面板</h1>
          <p className="mt-2 text-lg text-gray-600">使用 MetaMask 连接钱包并提交订单</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Polymarket交易面板组件正在开发中</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">注意事项</h2>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            <li>此交易面板将使用 MetaMask 钱包进行身份验证</li>
            <li>提交订单时会生成签名用于验证身份</li>
            <li>实际的订单处理逻辑将在后端 API 中实现</li>
            <li>将配置 <code>/api/placeOrder</code> 路由用于处理订单</li>
          </ul>
        </div>
      </main>
      
      <footer className="mt-16 bg-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            Polymarket 交易面板演示 | 使用 Wagmi 和 MetaMask
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TradePanelPage;