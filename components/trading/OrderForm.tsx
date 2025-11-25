// 📝 下单表单组件

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/app/provider-wagmi';
import { signOrder, generateSalt, generateOrderId } from '@/lib/clob/signing';
import { Order } from '@/lib/clob/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { getBrowserWalletProvider } from '@/lib/wallet/getBrowserWalletProvider';
import { CTF_CONFIG, ERC20_ABI, USDC_DECIMALS } from '@/lib/ctf/config';
import {
  calculateTokenId,
  convertToCTFOrder,
  serializeCTFOrder
} from '@/lib/ctf-exchange/utils';
import { signCTFOrder } from '@/lib/ctf-exchange/signing';
import { splitPosition, getPositionBalance } from '@/lib/ctf/split-position';

interface OrderFormProps {
  marketId: number;
  questionId: string;
  conditionId?: string | null;
  currentPriceYes?: number;
  currentPriceNo?: number;
  bestBid?: number;  // 最佳买价（用户可以卖出的价格）
  bestAsk?: number;  // 最佳卖价（用户需要买入的价格）
  polymarket?: any;  // 🎯 Polymarket 集成
  onSuccess?: () => void;  // 订单成功回调
}

export default function OrderForm({ 
  marketId, 
  questionId,
  conditionId,
  currentPriceYes = 0.5,
  currentPriceNo = 0.5,
  bestBid = 0.49,
  bestAsk = 0.51,
  polymarket,
  onSuccess
}: OrderFormProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const { address: account, isConnected, provider: walletProvider } = useWallet();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState(1); // 1 = YES, 0 = NO
  const [amount, setAmount] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [positionBalances, setPositionBalances] = useState<{ yes: string; no: string }>({
    yes: '0',
    no: '0'
  });
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [splitLoading, setSplitLoading] = useState(false);
  
  // 根据买卖方向获取市场价格（不可修改）
  const marketPrice = side === 'buy' ? bestAsk : bestBid;
  
  // 当买卖方向改变时
  const handleSideChange = (newSide: 'buy' | 'sell') => {
    setSide(newSide);
  };
  
  // 当结果选择改变时
  const handleOutcomeChange = (newOutcome: number) => {
    setOutcome(newOutcome);
  };
  
  const getActiveProvider = () => {
    const candidate = walletProvider ?? getBrowserWalletProvider();
    if (candidate && typeof candidate.request === 'function') {
      return candidate;
    }
    return null;
  };
  
  const fetchUsdcBalance = useCallback(async () => {
    if (!account || !isConnected) {
      setUsdcBalance('0');
      return;
    }
    
    const injectedProvider = getActiveProvider();
    if (!injectedProvider) {
      return;
    }
    
    try {
      setBalanceLoading(true);
      const provider = new ethers.providers.Web3Provider(injectedProvider);
      const usdcContract = new ethers.Contract(
        CTF_CONFIG.contracts.usdc,
        ERC20_ABI,
        provider
      );
      const balance = await usdcContract.balanceOf(account);
      setUsdcBalance(ethers.utils.formatUnits(balance, USDC_DECIMALS));
      setBalanceError(null);
    } catch (error: any) {
      console.error('[OrderForm] 获取 USDC 余额失败:', error);
      setBalanceError(error.message || '获取 USDC 余额失败');
    } finally {
      setBalanceLoading(false);
    }
  }, [account, isConnected]);
  
  useEffect(() => {
    fetchUsdcBalance();
  }, [fetchUsdcBalance]);

  const fetchPositionBalances = useCallback(async () => {
    if (!account || !isConnected || !conditionId) {
      setPositionBalances({ yes: '0', no: '0' });
      return;
    }

    const injectedProvider = getActiveProvider();
    if (!injectedProvider) {
      return;
    }

    try {
      setPositionLoading(true);
      const provider = new ethers.providers.Web3Provider(injectedProvider);
      const [yesId, noId] = [
        calculateTokenId(conditionId, 1),
        calculateTokenId(conditionId, 0)
      ];
      const [yesBalance, noBalance] = await Promise.all([
        getPositionBalance(provider, account, yesId),
        getPositionBalance(provider, account, noId)
      ]);
      setPositionBalances({
        yes: ethers.utils.formatEther(yesBalance),
        no: ethers.utils.formatEther(noBalance)
      });
      setPositionError(null);
    } catch (error: any) {
      console.error('[OrderForm] 获取 Position Tokens 余额失败:', error);
      setPositionError(error.message || '获取 Position Tokens 失败');
    } finally {
      setPositionLoading(false);
    }
  }, [account, conditionId, isConnected]);

  useEffect(() => {
    fetchPositionBalances();
  }, [fetchPositionBalances]);
  
  const amountNumber = parseFloat(amount || '0') || 0;
  const estimatedCost = (marketPrice * amountNumber).toFixed(2);
  const spread = ((bestAsk - bestBid) * 100).toFixed(2);
  const potentialProfit = side === 'buy'
    ? ((1 - marketPrice) * amountNumber).toFixed(2)
    : (marketPrice * amountNumber).toFixed(2);
  const requiredCollateral = side === 'buy' ? marketPrice * amountNumber : 0;
  const hasSufficientBalance =
    side === 'buy'
      ? parseFloat(usdcBalance || '0') + 1e-6 >= requiredCollateral
      : true;
  const yesPosition = parseFloat(positionBalances.yes || '0');
  const noPosition = parseFloat(positionBalances.no || '0');
  const targetPositionBalance = outcome === 1 ? yesPosition : noPosition;
  const hasSufficientPosition =
    side === 'sell'
      ? targetPositionBalance + 1e-6 >= amountNumber
      : true;
  
  const handleSplitPosition = async () => {
    if (!conditionId) {
      toast.error('该市场暂无 conditionId，无法铸造 Position Tokens');
      return;
    }
    if (!amountNumber || amountNumber <= 0) {
      toast.warning('请输入需要铸造的 USDC 数量');
      return;
    }

    const injectedProvider = getActiveProvider();
    if (!injectedProvider) {
      toast.warning(t('orderForm.installMetaMask'));
      return;
    }

    try {
      setSplitLoading(true);
      const provider = new ethers.providers.Web3Provider(injectedProvider);
      const signer = provider.getSigner();
      await splitPosition(signer, conditionId, amountNumber);
      toast.success('Position Tokens 铸造成功');
      await fetchPositionBalances();
      await fetchUsdcBalance();
    } catch (error: any) {
      console.error('[OrderForm] 铸造 Position Tokens 失败:', error);
      toast.error(error.message || '铸造失败，请稍后重试');
    } finally {
      setSplitLoading(false);
    }
  };

  // 提交订单
  const handleSubmit = async () => {
    const injectedProvider = getActiveProvider();
    
    if (!injectedProvider) {
      toast.warning(t('orderForm.installMetaMask'));
      return;
    }
    
    setSubmitting(true);
    
    try {
      // ✅ 双重验证：先检查 hook 状态，再验证实际钱包连接
      // 1. 检查 hook 状态
      if (!account || !isConnected) {
        toast.warning(t('orderForm.connectWalletFirst'));
        setSubmitting(false);
        return;
      }
      
      // 2. 验证实际钱包连接状态（通过 eth_accounts）
      const accounts = await injectedProvider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        toast.warning('钱包未连接，请先连接钱包');
        setSubmitting(false);
        return;
      }
      
      if (accounts[0].toLowerCase() !== account.toLowerCase()) {
        toast.warning('钱包地址不匹配，请重新连接钱包');
        setSubmitting(false);
        return;
      }
      
      // 🎯 如果有 Polymarket 集成，优先使用区块链交易
      if (polymarket && polymarket.isConnected) {
        console.log('🎯 使用 Polymarket 官方组件执行交易...');
        
        // 连接钱包（如果还没连接）
        if (!polymarket.isConnected) {
          await polymarket.connect();
        }
        
        // 创建区块链订单
        const tokenId = outcome === 1 ? 1 : 2; // YES=1, NO=2
        const { order: polyOrder, signature: polySig } = await polymarket.createOrder(
          tokenId,
          parseFloat(amount),
          marketPrice,
          side === 'buy' ? 'BUY' : 'SELL'
        );
        
        console.log('📋 Polymarket订单已创建:', polyOrder);
        
        // 执行区块链交易
        const result = await polymarket.fillOrder(polyOrder, polySig);
        
        console.log('✅ Polymarket交易成功！', result.transactionHash);
        
        // 显示成功通知
        toast.success(
          `${t('orderForm.tradeSuccess')}\n\n${t('orderForm.usingPolymarket')}\n\n${t('orderForm.txHash')}: ${result.transactionHash.slice(0, 10)}...`,
          {
            duration: 8000,
            link: result.explorerUrl ? {
              label: t('orderForm.viewOnExplorer'),
              url: result.explorerUrl
            } : undefined
          }
        );
        
        // 重置表单
        setAmount('10');
        
        // 触发回调刷新页面数据
        if (onSuccess) {
          onSuccess();
        }
        await fetchUsdcBalance();
        
        setSubmitting(false);
        return;
      }
      
      // 📊 默认模式：链下订单簿
      console.log('📊 使用链下订单簿模式...');
      
      // 1. 获取 provider 和 signer（仅用于签名，不用于连接）
      let provider, signer;
      
      try {
        // ✅ 账户已验证，现在可以安全创建 signer
        
        // ✅ 修复：明确指定账户地址创建 signer，避免 "unknown account #0" 错误
        provider = new ethers.providers.Web3Provider(injectedProvider);
        signer = provider.getSigner(accounts[0]); // 明确指定账户地址
        
        console.log('[OrderForm] 使用已连接的钱包地址:', account);
      } catch (walletError: any) {
        console.error('[OrderForm] 获取签名器失败:', walletError);
        toast.error(`获取签名器失败: ${walletError.message || '未知错误'}`);
        setSubmitting(false);
        return;
      }
      
      if (!provider || !signer) {
        toast.error('钱包连接异常，请刷新页面后重试');
        setSubmitting(false);
        return;
      }
      
      const address = account; // 使用 hook 提供的 address
      
      // 2.a 校验 USDC 余额（仅买单）
      if (side === 'buy') {
        try {
          const usdcContract = new ethers.Contract(
            CTF_CONFIG.contracts.usdc,
            ERC20_ABI,
            provider
          );
          const balance = await usdcContract.balanceOf(address);
          const requiredUnits = ethers.utils.parseUnits(
            requiredCollateral.toFixed(USDC_DECIMALS),
            USDC_DECIMALS
          );
          
          if (balance.lt(requiredUnits)) {
            toast.error(
              `USDC 余额不足，需 ${requiredCollateral.toFixed(2)} USDC`
            );
            await fetchUsdcBalance();
            setSubmitting(false);
            return;
          }
        } catch (balanceError) {
          console.error('[OrderForm] 检查 USDC 余额失败:', balanceError);
          toast.error('无法获取 USDC 余额，请稍后重试');
          setSubmitting(false);
          return;
        }
      }

      if (side === 'sell') {
        if (!conditionId) {
          toast.error('该市场缺少 conditionId，无法验证 Position Tokens');
          setSubmitting(false);
          return;
        }
        if (!hasSufficientPosition) {
          toast.error('Position Tokens 余额不足，无法卖出该数量');
          setSubmitting(false);
          return;
        }
      }
      
      // 2. 构造订单（使用市场价）
      const order: Order = {
        orderId: generateOrderId(),
        marketId,
        questionId,
        maker: address.toLowerCase(), // 使用统一格式
        side,
        outcome,
        price: marketPrice.toFixed(2), // 使用市场价
        amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400 * 7 // 7天有效期
      };
      
      console.log('[OrderForm] 创建订单:', order);
      
      // 3. 签名订单
      const signature = await signOrder(order, signer);
      order.signature = signature;
      
      console.log('[OrderForm] 订单已签名');

      let ctfOrderPayload: ReturnType<typeof serializeCTFOrder> | null = null;
      let ctfSignature: string | null = null;

      if (conditionId) {
        try {
          const ctfOrderRaw = convertToCTFOrder(
            {
              maker: address.toLowerCase(),
              marketId,
              outcome,
              side,
              price: order.price,
              amount: order.amount,
              expiration: order.expiration,
              nonce: order.nonce,
              salt: order.salt
            },
            conditionId
          );
          ctfOrderPayload = serializeCTFOrder(ctfOrderRaw);
          ctfSignature = await signCTFOrder(ctfOrderRaw, signer);
        } catch (ctfError) {
          console.warn('[OrderForm] 准备 CTF 订单失败:', ctfError);
        }
      }
      
      // 4. 提交到链下匹配引擎
      const requestBody = {
        ...order,
        conditionId,
        ctfOrder: ctfOrderPayload,
        ctfSignature
      };
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 显示成功通知
        toast.success(
          `${t('orderForm.orderSuccess')}\n\n${t('orderForm.orderSuccessDetail')}\n\n${t('market.orderId')}: ${order.orderId}`,
          {
            duration: 6000
          }
        );
        
        // 重置表单
        setAmount('10');
        
        // 触发回调刷新页面数据
        if (onSuccess) {
          onSuccess();
        }
        
        await fetchUsdcBalance();
        await fetchPositionBalances();
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('提交订单失败:', error);
      if (error.code === 4001) {
        toast.warning(t('orderForm.userCancelled'));
      } else if (error.message?.includes('user rejected')) {
        toast.warning(t('orderForm.userRejected'));
      } else {
        toast.error(`${t('orderForm.orderFailed')}:\n\n${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* 钱包状态提示 */}
      {!isConnected ? (
        <div className="mb-4 p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg">
          <p className="text-sm text-amber-400 text-center">
            {t('orderForm.connectWalletFirst')}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg space-y-1">
          <div className="text-sm text-gray-300">
            {t('wallet.connect', 'Connected')}: {account?.substring(0, 6)}...{account?.substring(38)}
          </div>
          <div className="text-sm text-gray-300 flex items-center justify-between">
            <span>USDC {t('orderForm.balance', 'Balance')}:</span>
            <span className="font-semibold text-amber-300">
              {balanceLoading ? '...' : `${Number(usdcBalance || '0').toFixed(2)} USDC`}
            </span>
          </div>
          {side === 'buy' && (
            <div className="text-xs text-gray-400">
              {t('orderForm.requiredCollateral', 'Required')}:{' '}
              {requiredCollateral > 0 ? `${requiredCollateral.toFixed(2)} USDC` : '--'}
            </div>
          )}
          {balanceError && (
            <div className="text-xs text-amber-400">{balanceError}</div>
          )}
          {side === 'buy' && !hasSufficientBalance && !balanceLoading && (
            <div className="text-xs text-red-400">
              {t('orderForm.insufficientUsdc', 'USDC 余额不足，无法下单')}
            </div>
          )}
        </div>
      )}
      {conditionId ? (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Position Tokens (YES / NO)</span>
            <span className="text-xs text-gray-400">
              condition: {conditionId.slice(0, 6)}...{conditionId.slice(-4)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-amber-300">
            <div>
              YES:{' '}
              {positionLoading
                ? '...'
                : `${Number(positionBalances.yes || '0').toFixed(2)} PT`}
            </div>
            <div>
              NO:{' '}
              {positionLoading
                ? '...'
                : `${Number(positionBalances.no || '0').toFixed(2)} PT`}
            </div>
          </div>
          {positionError && (
            <div className="text-xs text-amber-400">{positionError}</div>
          )}
          {side === 'sell' && !hasSufficientPosition && !positionLoading && (
            <div className="text-xs text-red-400">
              Position Tokens 余额不足，无法卖出 {outcome === 1 ? 'YES' : 'NO'} 该数量
            </div>
          )}
          <button
            type="button"
            onClick={handleSplitPosition}
            disabled={
              splitLoading ||
              !isConnected ||
              amountNumber <= 0 ||
              balanceLoading
            }
            className="w-full py-2 text-sm bg-amber-500/20 border border-amber-400/50 text-amber-100 rounded-lg hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {splitLoading
              ? '铸造中...'
              : `用 ${amountNumber || '--'} USDC 铸造 Position Tokens`}
          </button>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-200">
          该市场尚未同步 conditionId，暂无法铸造 Position Tokens
        </div>
      )}
      
      {/* 市场实时价格 */}
      <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="text-xs font-semibold text-amber-400 mb-2">{t('orderForm.livePrice')}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-400 text-xs">{t('orderForm.bid')}</div>
            <div className="font-bold text-green-400">${bestBid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">{t('orderForm.ask')}</div>
            <div className="font-bold text-red-400">${bestAsk.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {t('orderForm.spread')}: {spread}¢
        </div>
      </div>
      
      {/* 结果选择（YES/NO） */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleOutcomeChange(1)}
          disabled={submitting || !isConnected}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            outcome === 1
              ? 'bg-green-500 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-green-500/50'
          }`}
        >
          <div>YES</div>
          <div className="text-xs opacity-80">{(currentPriceYes * 100).toFixed(1)}%</div>
        </button>
        <button
          onClick={() => handleOutcomeChange(0)}
          disabled={submitting || !isConnected}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            outcome === 0
              ? 'bg-red-500 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-500/50'
          }`}
        >
          <div>NO</div>
          <div className="text-xs opacity-80">{(currentPriceNo * 100).toFixed(1)}%</div>
        </button>
      </div>
      
      {/* 买/卖切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleSideChange('buy')}
          disabled={submitting || !isConnected}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            side === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-green-600/50'
          }`}
        >
          {t('orderForm.buy')}
        </button>
        <button
          onClick={() => handleSideChange('sell')}
          disabled={submitting || !isConnected}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-600/50'
          }`}
        >
          {t('orderForm.sell')}
        </button>
      </div>
      
      {/* 市场价格（只读显示） */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          {t('orderForm.executionPrice')}
        </label>
        <div className="w-full px-4 py-3 bg-white/5 border-2 border-amber-400/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-amber-400">
              ${marketPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">
              {side === 'buy' ? t('orderForm.ask') : t('orderForm.bid')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('orderForm.marketPrice')}
        </p>
      </div>
      
      {/* 数量 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 flex justify-between items-center text-gray-300">
          <span>{t('orderForm.amount')}</span>
          <div className="flex gap-1">
            {['10', '50', '100', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                disabled={submitting || !isConnected}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded disabled:opacity-50"
              >
                {val}
              </button>
            ))}
          </div>
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="1"
          disabled={submitting || !isConnected}
          className="w-full px-4 py-2 bg-white/5 border-2 border-white/10 text-white rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={t('orderForm.amount')}
        />
      </div>
      
      {/* 交易摘要 */}
      <div className="mb-4 p-4 bg-white/5 border-2 border-white/10 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('orderForm.marketPrice')}:</span>
          <span className="font-bold text-gray-200">${marketPrice.toFixed(2)} / {t('orderForm.shares')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('market.quantity')}:</span>
          <span className="font-bold text-gray-200">{amount} {t('orderForm.shares')}</span>
        </div>
        <div className="border-t border-white/10 pt-2 mt-2"></div>
        <div className="flex justify-between text-base">
          <span className="text-gray-300 font-semibold">
            {t('orderForm.totalCost')}:
          </span>
          <span className="font-bold text-lg text-amber-400">
            ${estimatedCost} USDC
          </span>
        </div>
        {side === 'buy' && (
          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">
            {t('orderForm.estimatedShares')}: ${(parseFloat(amount) * 1).toFixed(2)} USDC
            <br />
            {t('orderForm.potentialProfit')}: <span className="text-green-400 font-semibold">+${potentialProfit} USDC</span>
          </div>
        )}
      </div>
      
      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={
          submitting ||
          !isConnected ||
          (side === 'buy' && !hasSufficientBalance) ||
          (side === 'sell' && !hasSufficientPosition)
        }
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
          side === 'buy'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {submitting 
          ? t('orderForm.submitting')
          : !isConnected 
            ? t('orderForm.connectWalletFirst')
            : side === 'buy' && !hasSufficientBalance
              ? t('orderForm.insufficientUsdc', 'USDC 余额不足')
              : side === 'sell' && !hasSufficientPosition
                ? 'Position Tokens 余额不足'
                : `${side === 'buy' ? t('orderForm.confirmBuy') : t('orderForm.confirmSell')} ${outcome === 1 ? 'YES' : 'NO'}`
        }
      </button>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        {t('orderForm.orderNote')}
      </p>
    </div>
  );
}




