'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

export default function SimpleTest() {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [status, setStatus] = useState<string>('未连接');
  const [result, setResult] = useState<string>('');

  // 合约地址和 ABI
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CONTRACT_ABI = [
    "function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external",
    "function getConditionId(address oracle, bytes32 questionId, uint outcomeSlotCount) external pure returns (bytes32)",
  ];

  // 步骤 1: 连接钱包
  const connectWallet = async () => {
    try {
      setStatus('正在连接钱包...');
      console.log('🔍 检查钱包...');

      // 检测 OKX 钱包或其他钱包
      let ethereum: any = null;
      
      if (window.okxwallet) {
        ethereum = window.okxwallet;
        console.log('✅ 检测到 OKX 钱包');
      } else if (window.ethereum?.isMetaMask) {
        ethereum = window.ethereum;
        console.log('✅ 检测到 MetaMask');
      } else if (window.ethereum) {
        ethereum = window.ethereum;
        console.log('✅ 检测到钱包');
      } else {
        throw new Error('未检测到钱包');
      }

      // 请求连接
      console.log('📞 请求连接...');
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ 账户:', accounts[0]);

      // 获取网络信息
      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();
      console.log('🌐 网络 Chain ID:', network.chainId);

      setAccount(accounts[0]);
      setChainId(network.chainId);
      setStatus('✅ 已连接');
      setResult(`账户: ${accounts[0].slice(0, 10)}...\nChain ID: ${network.chainId}`);

    } catch (error: any) {
      console.error('❌ 连接失败:', error);
      setStatus('❌ 连接失败');
      setResult(error.message);
    }
  };

  // 步骤 2: 创建市场
  const createMarket = async () => {
    try {
      setStatus('正在创建市场...');
      console.log('📝 开始创建市场...');

      // 获取钱包
      let ethereum: any = window.okxwallet || window.ethereum;
      if (!ethereum) {
        throw new Error('请先连接钱包');
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      console.log('🌐 当前网络:', network.chainId);
      console.log('📍 合约地址:', CONTRACT_ADDRESS);

      // 连接合约
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log('✅ 合约实例创建成功');

      // 准备参数
      const oracle = await signer.getAddress();
      const questionId = ethers.utils.formatBytes32String('simple-test-001');
      const outcomeSlotCount = 2;

      console.log('📋 参数:');
      console.log('  Oracle:', oracle);
      console.log('  Question ID:', questionId);
      console.log('  Outcomes:', outcomeSlotCount);

      // 发送交易
      console.log('📤 发送交易...');
      const tx = await contract.prepareCondition(oracle, questionId, outcomeSlotCount);
      console.log('⏳ 交易哈希:', tx.hash);

      setStatus('⏳ 等待确认...');
      setResult(`交易哈希: ${tx.hash}`);

      // 等待确认
      const receipt = await tx.wait();
      console.log('✅ 交易确认，区块:', receipt.blockNumber);

      setStatus('✅ 创建成功！');
      setResult(`交易成功！\n区块: ${receipt.blockNumber}\n交易哈希: ${tx.hash}`);

    } catch (error: any) {
      console.error('❌ 创建失败:', error);
      setStatus('❌ 创建失败');
      setResult(error.message || String(error));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 超级简单测试页面</h1>

        {/* 状态显示 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">状态</div>
            <div className="text-xl font-semibold">{status}</div>
          </div>
          
          {account && (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">账户</div>
                <div className="text-sm font-mono">{account}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Chain ID</div>
                <div className="text-sm font-mono">{chainId}</div>
              </div>
            </>
          )}

          {result && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-1">结果</div>
              <div className="text-sm font-mono bg-gray-900 p-3 rounded whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            步骤 1: 连接钱包
          </button>

          <button
            onClick={createMarket}
            disabled={!account}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-colors ${
              account
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            步骤 2: 创建市场
          </button>
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-sm">
          <h2 className="font-semibold mb-3">📋 测试步骤</h2>
          <ol className="space-y-2 list-decimal list-inside text-gray-300">
            <li>确保 OKX 钱包已切换到 <strong>Hardhat Local (Chain ID: 31337)</strong></li>
            <li>点击"连接钱包"，OKX 应该会弹出连接请求</li>
            <li>连接成功后，点击"创建市场"</li>
            <li>OKX 会弹出交易确认 → 点击确认</li>
            <li>等待几秒，应该显示成功消息</li>
          </ol>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="font-semibold mb-2">🔍 调试信息</h3>
            <div className="text-gray-400 space-y-1">
              <div>合约地址: <code className="text-blue-400">{CONTRACT_ADDRESS}</code></div>
              <div>网络: Hardhat Local (31337)</div>
              <div>RPC: http://127.0.0.1:8545</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
  }
}


















