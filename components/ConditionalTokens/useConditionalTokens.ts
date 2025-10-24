/**
 * Conditional Tokens 合约 Hook
 * 用于在前端直接连接 BSC 合约
 * 
 * 支持测试网和主网自动切换
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// 扩展 Window 类型
declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
  }
}

// BSC 合约地址
const CONTRACT_ADDRESS_MAINNET = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";
const CONTRACT_ADDRESS_TESTNET = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";
// 本地 Hardhat 合约地址
const CONTRACT_ADDRESS_LOCAL = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// 默认使用主网
const USE_TESTNET = false;
const USE_LOCAL = process.env.NEXT_PUBLIC_USE_LOCAL === 'true';

// 合约 ABI
const CONTRACT_ABI = [
  "function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external",
  "function getConditionId(address oracle, bytes32 questionId, uint outcomeSlotCount) external pure returns (bytes32)",
  "function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)",
  "function payoutDenominator(bytes32 conditionId) external view returns (uint)",
];

export interface ConditionalTokensHook {
  loading: boolean;
  error: string | null;
  getConditionId: (oracle: string, questionId: string, outcomeCount: number) => Promise<string>;
  getOutcomeSlotCount: (conditionId: string) => Promise<number>;
  checkConditionResolved: (conditionId: string) => Promise<boolean>;
  createMarket: (questionId: string, outcomeCount: number) => Promise<ethers.providers.TransactionReceipt>;
}

export function useConditionalTokens(): ConditionalTokensHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReadOnlyContract = useCallback(() => {
    const rpcUrl = USE_TESTNET 
      ? "https://data-seed-prebsc-1-s1.binance.org:8545"
      : "https://bsc-dataseed1.binance.org";
    
    const contractAddress = USE_TESTNET
      ? CONTRACT_ADDRESS_TESTNET
      : CONTRACT_ADDRESS_MAINNET;
    
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
  }, []);

  const getWritableContract = useCallback(async () => {
    // 强制优先使用 MetaMask（本地开发推荐）
    let ethereum: any = null;
    
    // 优先顺序：MetaMask > providers 中的 MetaMask > 其他
    
    // 方法 1: 直接查找 MetaMask
    if (window.ethereum?.isMetaMask && !window.ethereum?.isRainbow && !window.ethereum?.isOkxWallet) {
      ethereum = window.ethereum;
      console.log('🦊 检测到 MetaMask 钱包');
    }
    // 方法 2: 从 providers 数组中优先查找 MetaMask
    else if (window.ethereum?.providers?.length > 0) {
      // 强制优先 MetaMask
      ethereum = window.ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isRainbow
      );
      if (ethereum) {
        console.log('🦊 从 providers 中找到 MetaMask');
      } else {
        // 如果没有 MetaMask，使用第一个可用的
        ethereum = window.ethereum.providers[0];
        console.log('💼 使用钱包:', ethereum.isMetaMask ? 'MetaMask' : ethereum.isOkxWallet ? 'OKX' : '其他');
      }
    }
    // 方法 3: 查找独立的 OKX 钱包（仅作为备选）
    else if (window.okxwallet) {
      ethereum = window.okxwallet;
      console.log('⚠️ 使用 OKX 钱包（可能有兼容性问题，建议使用 MetaMask）');
    }
    // 方法 4: 使用默认钱包
    else if (window.ethereum) {
      ethereum = window.ethereum;
      console.log('💼 使用默认钱包');
    }
    
    if (!ethereum) {
      throw new Error('请安装 MetaMask 钱包扩展（推荐用于本地开发）');
    }

    await ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    
    // 🔥 强制优先使用本地网络（用于开发测试）
    let contractAddress: string;
    
    console.log('🌐 检测到的网络 Chain ID:', network.chainId);
    
    // Hardhat 本地网络（31337）- 最高优先级
    if (network.chainId === 31337) {
      contractAddress = CONTRACT_ADDRESS_LOCAL;
      console.log('✅ 使用 Hardhat 本地合约:', contractAddress);
      console.log('📍 合约地址确认:', CONTRACT_ADDRESS_LOCAL);
    }
    // BSC 测试网
    else if (USE_TESTNET || network.chainId === 97) {
      contractAddress = CONTRACT_ADDRESS_TESTNET;
      console.log('✅ 使用 BSC 测试网合约:', contractAddress);
      if (network.chainId !== 97) {
        throw new Error('请切换到 BSC 测试网 (Chain ID: 97)');
      }
    }
    // BSC 主网
    else {
      contractAddress = CONTRACT_ADDRESS_MAINNET;
      console.log('✅ 使用 BSC 主网合约:', contractAddress);
      if (network.chainId !== 56) {
        throw new Error('请切换到 BSC 主网 (Chain ID: 56)');
      }
    }
    
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    console.log('📝 合约实例创建成功，地址:', contract.address);
    return contract;
  }, []);

  const getConditionId = useCallback(async (
    oracle: string,
    questionId: string,
    outcomeCount: number
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const contract = getReadOnlyContract();
      const questionIdBytes = ethers.utils.formatBytes32String(questionId);
      const conditionId = await contract.getConditionId(oracle, questionIdBytes, outcomeCount);
      return conditionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  const getOutcomeSlotCount = useCallback(async (conditionId: string): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      const contract = getReadOnlyContract();
      const count = await contract.getOutcomeSlotCount(conditionId);
      return count.toNumber();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  const checkConditionResolved = useCallback(async (conditionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const contract = getReadOnlyContract();
      const denominator = await contract.payoutDenominator(conditionId);
      return denominator.gt(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  const createMarket = useCallback(async (
    questionId: string,
    outcomeCount: number
  ): Promise<ethers.providers.TransactionReceipt> => {
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getWritableContract();
      const signer = contract.signer as ethers.Signer;
      const oracle = await signer.getAddress();
      const questionIdBytes = ethers.utils.formatBytes32String(questionId);
      
      console.log('📝 创建市场...', { oracle, questionId, outcomeCount });
      
      const gasEstimate = await contract.estimateGas.prepareCondition(oracle, questionIdBytes, outcomeCount);
      console.log('⛽ 预估 Gas:', gasEstimate.toString());
      
      const tx = await contract.prepareCondition(
        oracle,
        questionIdBytes,
        outcomeCount,
        { gasLimit: gasEstimate.mul(120).div(100) }
      );
      
      console.log('⏳ 交易已发送:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ 交易确认，区块:', receipt.blockNumber);
      
      const conditionId = await contract.getConditionId(oracle, questionIdBytes, outcomeCount);
      console.log('🎯 Condition ID:', conditionId);
      
      return receipt;
    } catch (err) {
      let errorMessage = '未知错误';
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = '余额不足，请充值 BNB';
        } else if (err.message.includes('user rejected')) {
          errorMessage = '用户取消了交易';
        } else if (err.message.includes('already prepared')) {
          errorMessage = '该条件已存在';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getWritableContract]);

  return {
    loading,
    error,
    getConditionId,
    getOutcomeSlotCount,
    checkConditionResolved,
    createMarket
  };
}

export { CONTRACT_ADDRESS_MAINNET, CONTRACT_ADDRESS_TESTNET, CONTRACT_ABI, USE_TESTNET };
