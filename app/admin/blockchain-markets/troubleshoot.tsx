'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import deployment from '@/deployments/amoy.json';

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function ctf() view returns (address)",
];

/**
 * 故障排查组件
 * 帮助诊断为什么合约调用失败
 */
export function Troubleshoot() {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (label: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { label, success, data, time: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setTesting(true);

    try {
      // 1. 检查window.ethereum
      addResult('检查 window.ethereum', typeof window !== 'undefined' && !!window.ethereum, 
        window.ethereum ? '已找到' : '未找到');

      if (!window.ethereum) {
        setTesting(false);
        return;
      }

      // 2. 检查钱包连接
      try {
        const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await walletProvider.listAccounts();
        addResult('钱包连接', accounts.length > 0, accounts[0] || '未连接');
        
        if (accounts.length === 0) {
          addResult('提示', false, '请先连接钱包');
          setTesting(false);
          return;
        }

        // 3. 检查网络
        const network = await walletProvider.getNetwork();
        const isCorrectNetwork = network.chainId === 80002;
        addResult('网络检查', isCorrectNetwork, 
          `Chain ID: ${network.chainId} (${isCorrectNetwork ? '正确' : '错误 - 应为 80002'})`);

        if (!isCorrectNetwork) {
          addResult('提示', false, '请切换到 Polygon Amoy 测试网');
          setTesting(false);
          return;
        }

        // 4. 使用钱包 Provider 测试合约调用
        addResult('测试开始', true, '使用钱包 Provider 调用合约...');
        
        try {
          const adapter = new ethers.Contract(
            deployment.contracts.umaCTFAdapter.address,
            ADAPTER_ABI,
            walletProvider
          );

          const count = await adapter.getMarketCount();
          addResult('钱包 Provider 调用', true, `市场数量: ${count.toString()}`);
        } catch (error: any) {
          addResult('钱包 Provider 调用', false, error.message);
        }

        // 5. 使用公共 RPC 测试
        addResult('测试开始', true, '使用公共 RPC 调用合约...');
        
        try {
          const publicProvider = new ethers.providers.JsonRpcProvider(
            'https://rpc-amoy.polygon.technology'
          );

          const adapter = new ethers.Contract(
            deployment.contracts.umaCTFAdapter.address,
            ADAPTER_ABI,
            publicProvider
          );

          const count = await adapter.getMarketCount();
          addResult('公共 RPC 调用', true, `市场数量: ${count.toString()}`);
        } catch (error: any) {
          addResult('公共 RPC 调用', false, error.message);
        }

        // 6. 检查合约代码
        try {
          const code = await walletProvider.getCode(deployment.contracts.umaCTFAdapter.address);
          const hasCode = code !== '0x' && code !== '0x0';
          addResult('合约代码检查', hasCode, 
            hasCode ? `代码大小: ${Math.floor(code.length / 2)} 字节` : '合约未部署');
        } catch (error: any) {
          addResult('合约代码检查', false, error.message);
        }

        // 7. 检查余额
        try {
          const balance = await walletProvider.getBalance(accounts[0]);
          const balanceStr = ethers.utils.formatEther(balance);
          const hasBalance = balance.gt(ethers.utils.parseEther('0.001'));
          addResult('余额检查', hasBalance, 
            `${balanceStr} POL ${hasBalance ? '' : '(余额较低)'}`);
        } catch (error: any) {
          addResult('余额检查', false, error.message);
        }

      } catch (error: any) {
        addResult('钱包错误', false, error.message);
      }

    } catch (error: any) {
      addResult('总体错误', false, error.message);
    }

    setTesting(false);
  };

  const tryFix = async () => {
    if (!window.ethereum) {
      alert('未检测到钱包！');
      return;
    }

    try {
      // 尝试切换网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }],
      });
      
      alert('已切换到 Amoy 测试网，请刷新页面');
      window.location.reload();
    } catch (error: any) {
      if (error.code === 4902) {
        // 网络未添加，添加它
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'POL',
                symbol: 'POL',
                decimals: 18
              },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
          });
          
          alert('网络已添加！请刷新页面');
          window.location.reload();
        } catch (addError) {
          alert('添加网络失败: ' + (addError as any).message);
        }
      } else {
        alert('切换网络失败: ' + error.message);
      }
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 my-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-4">🔧 故障诊断</h3>
      
      <p className="text-yellow-800 mb-4">
        如果遇到"call revert exception"错误，点击下面的按钮进行诊断。
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {testing ? '诊断中...' : '🔍 开始诊断'}
        </button>

        <button
          onClick={tryFix}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          🔧 尝试修复网络
        </button>

        {results.length > 0 && (
          <button
            onClick={() => setResults([])}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            清除结果
          </button>
        )}
      </div>

      {/* 诊断结果 */}
      {results.length > 0 && (
        <div className="bg-white rounded border border-yellow-300 p-4 max-h-96 overflow-y-auto">
          <h4 className="font-bold mb-3 text-gray-900">诊断结果：</h4>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 p-2 rounded ${
                  result.label === '提示' ? 'bg-blue-50' :
                  result.label.includes('开始') ? 'bg-gray-50' :
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <span className="text-lg">
                  {result.label === '提示' ? 'ℹ️' :
                   result.label.includes('开始') ? '▶️' :
                   result.success ? '✅' : '❌'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {result.label}
                  </div>
                  <div className="text-sm text-gray-700 break-all">
                    {typeof result.data === 'string' ? result.data : JSON.stringify(result.data)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 解决方案建议 */}
      {results.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded">
          <h4 className="font-bold text-blue-900 mb-2">💡 解决方案：</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {results.some(r => !r.success && r.label.includes('Provider')) && (
              <>
                <li>• <strong>钱包 Provider 调用失败：</strong>这通常是因为钱包缓存或连接问题</li>
                <li>• <strong>解决方法：</strong></li>
                <li>&nbsp;&nbsp;1. 断开钱包连接，然后重新连接</li>
                <li>&nbsp;&nbsp;2. 刷新页面（F5 或 Ctrl+R）</li>
                <li>&nbsp;&nbsp;3. 如果使用 OKX 钱包，尝试切换到 MetaMask</li>
                <li>&nbsp;&nbsp;4. 清除浏览器缓存后重试</li>
              </>
            )}
            {results.some(r => r.label.includes('网络') && !r.success) && (
              <li>• 点击上面的"尝试修复网络"按钮切换到正确的网络</li>
            )}
            {results.some(r => r.label.includes('余额') && !r.success) && (
              <li>• 访问 <a href="https://faucet.polygon.technology/" target="_blank" className="underline">水龙头</a> 获取测试 POL</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

