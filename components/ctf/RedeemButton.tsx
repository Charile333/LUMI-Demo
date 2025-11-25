/**
 * Redeem Button Component
 * 用于用户提取市场解析后的奖励
 */

'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  redeemPositions, 
  checkRedeemableBalance, 
  isMarketResolved,
  calculateRedeemablePayout 
} from '@/lib/ctf/redeem';

interface RedeemButtonProps {
  conditionId: string;
  outcomeIndex: number; // 0 = NO, 1 = YES
  marketTitle?: string;
  onSuccess?: (result: { payout: string; txHash: string }) => void;
  onError?: (error: string) => void;
}

export default function RedeemButton({
  conditionId,
  outcomeIndex,
  marketTitle,
  onSuccess,
  onError
}: RedeemButtonProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [redeemable, setRedeemable] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [payout, setPayout] = useState<string>('0');
  const [balance, setBalance] = useState<string>('0');
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // 检查可赎回状态
  useEffect(() => {
    async function checkRedeemable() {
      if (!window.ethereum) {
        setChecking(false);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        // 检查市场是否已解析
        const isResolved = await isMarketResolved(provider, conditionId);
        setResolved(isResolved);

        if (!isResolved) {
          setChecking(false);
          return;
        }

        // 检查可赎回余额
        const balanceInfo = await checkRedeemableBalance(
          provider,
          address,
          conditionId,
          outcomeIndex
        );

        if (balanceInfo.hasBalance) {
          // 计算预期 payout
          const payoutInfo = await calculateRedeemablePayout(
            provider,
            address,
            conditionId,
            outcomeIndex
          );

          setRedeemable(true);
          setBalance(balanceInfo.balance);
          setPayout(payoutInfo.payout);
        }
      } catch (error: any) {
        console.error('Error checking redeemable:', error);
      } finally {
        setChecking(false);
      }
    }

    checkRedeemable();
  }, [conditionId, outcomeIndex]);

  // 执行赎回
  const handleRedeem = async () => {
    if (!window.ethereum) {
      onError?.('Please connect your wallet');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const result = await redeemPositions(signer, conditionId, outcomeIndex);

      if (result.success) {
        onSuccess?.({
          payout: result.payout || '0',
          txHash: result.transactionHash || ''
        });
        
        // 更新状态
        setRedeemable(false);
        setBalance('0');
        setPayout('0');
      } else {
        onError?.(result.error || 'Redeem failed');
      }
    } catch (error: any) {
      console.error('Redeem error:', error);
      onError?.(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        检查中...
      </button>
    );
  }

  if (!resolved) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        市场未解析
      </button>
    );
  }

  if (!redeemable) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        无可赎回余额
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-600">
        <div>持仓: {balance} USDC</div>
        <div>可提取: {payout} USDC</div>
      </div>
      <button
        onClick={handleRedeem}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {loading ? '提取中...' : `提取奖励 (${payout} USDC)`}
      </button>
    </div>
  );
}




