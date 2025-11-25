// 🎯 紧凑交易弹窗 - 重新设计的小卡片样式
'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { signOrder, generateSalt, generateOrderId, type Order } from '@/lib/clob/signing';
import { signCTFOrder } from '@/lib/ctf-exchange/signing';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { useMarketPrice } from '@/hooks/useMarketPrice';
import { useWallet } from '@/app/provider-wagmi';
import { getBrowserWalletProvider } from '@/lib/wallet/getBrowserWalletProvider';
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';
import WalletConnect from '@/components/WalletConnect';
import { useBalance } from 'wagmi';
import type { Address } from 'viem';
import { CTF_CONFIG } from '@/lib/ctf/config';
import { splitPosition } from '@/lib/ctf/split-position';

interface CompactTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: number;
    title: string;
    questionId: string;
    conditionId?: string | null;
  };
  initialOutcome?: 'yes' | 'no'; // 初始选择的结果
}

export default function CompactTradeModal({
  isOpen,
  onClose,
  market,
  initialOutcome = 'yes'
}: CompactTradeModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  
  // 🔥 使用统一的 useWallet hook（和 OrderForm、导航栏一致）
  const { address: account, isConnected, provider: walletProvider } = useWallet();
  const polymarket = useLUMIPolymarket();
  
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState<'yes' | 'no'>(initialOutcome);
  const [amount, setAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingOnChainExecution, setPendingOnChainExecution] = useState<any>(null);
  const [isExecutingOnChain, setIsExecutingOnChain] = useState(false);
  const typedAccount = account ? (account as Address) : undefined;
  const usdcTokenAddress = useMemo(() => CTF_CONFIG.contracts.usdc as Address, []);
  const {
    data: usdcBalanceData,
    isFetching: isUsdcBalanceFetching,
    refetch: refetchUsdcBalance,
    error: usdcBalanceError
  } = useBalance({
    address: typedAccount,
    token: usdcTokenAddress,
    chainId: CTF_CONFIG.chainId,
    watch: true,
    scopeKey: 'compact-trade-usdc',
    query: {
      enabled: Boolean(isConnected && typedAccount)
    }
  });
  const usdcBalance = parseFloat(usdcBalanceData?.formatted || '0');
  
  // 🔥 使用统一的 useMarketPrice hook 获取实时价格（和市场卡片、详情页一致）
  const price = useMarketPrice(market.id, true);

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 当弹窗打开时，重置为初始选择
  useEffect(() => {
    if (isOpen) {
      setOutcome(initialOutcome);
      setPendingOnChainExecution(null); // 重置链上执行状态
    }
  }, [isOpen, initialOutcome]);

  // 辅助函数：获取待执行的 USDC 数量
  const getPendingUsdcAmount = () => {
    if (!pendingOnChainExecution?.onChainExecution) return null;
    const oc = pendingOnChainExecution.onChainExecution;
    try {
      const formatted = ethers.utils.formatUnits(oc.fillAmount || oc.ctfOrder.takerAmount, 6);
      return parseFloat(formatted).toFixed(2);
    } catch {
      return null;
    }
  };

  // 辅助函数：获取待执行的 Token 数量
  const getPendingTokenAmount = () => {
    if (!pendingOnChainExecution?.onChainExecution) return null;
    const amount = parseFloat(pendingOnChainExecution.onChainExecution.tradeAmount || '0');
    if (Number.isNaN(amount)) return pendingOnChainExecution.onChainExecution.tradeAmount || null;
    return amount.toFixed(2);
  };

  if (!isOpen || !mounted) return null;

  // 🎯 根据买卖方向选择正确的价格
  // 买入时使用 ask 价格（卖家的报价），卖出时使用 bid 价格（买家的报价）
  const currentPrice = side === 'buy' 
    ? (outcome === 'yes' ? price.bestAsk : price.bestAsk) // 买入使用卖价
    : (outcome === 'yes' ? price.bestBid : price.bestBid); // 卖出使用买价
  const normalizedPrice =
    typeof currentPrice === 'number' && Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice
      : 0;
  const numericAmount = Number(amount) || 0;
  const requiredCollateral = side === 'buy' ? normalizedPrice * numericAmount : 0;
  const insufficientBalance =
    side === 'buy' &&
    isConnected &&
    requiredCollateral > 0 &&
    usdcBalance + 1e-8 < requiredCollateral;
  const balanceStatusMessage =
    side === 'buy' && isConnected
      ? insufficientBalance
        ? `余额不足，至少需要 ${requiredCollateral.toFixed(2)} USDC`
        : `需要锁定 ${requiredCollateral.toFixed(2)} USDC`
      : '';

  const getActiveProvider = () => {
    const candidate = walletProvider ?? getBrowserWalletProvider();
    if (candidate && typeof candidate.request === 'function') {
      return candidate;
    }
    return null;
  };

  const handleTrade = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. 检查钱包连接状态（只检查，不在这里再次弹出连接对话框）
      if (!isConnected || !account) {
        toast.warning('请先在页面顶部或弹窗中的按钮连接钱包');
        setIsSubmitting(false);
        return;
      }

      console.log('[CompactTrade] 用户地址:', account);
      
      // 2. 获取 provider 和 signer（使用 Wagmi 的 provider）
      // ✅ 修复：先验证账户是否已授权，再创建 signer
      let provider, signer;
      
      try {
        const injectedProvider = getActiveProvider();
        if (!injectedProvider) {
          throw new Error('未找到钱包，请安装或启用浏览器钱包扩展');
        }
        
        // ✅ 先检查账户是否已授权
        const accounts = await injectedProvider.request({ method: 'eth_accounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('钱包未连接，请先连接钱包');
        }
        
        if (accounts[0].toLowerCase() !== account.toLowerCase()) {
          throw new Error('钱包地址不匹配，请重新连接');
        }
        
        // ✅ 账户已授权，现在可以安全创建 signer
        provider = new ethers.providers.Web3Provider(injectedProvider);
        signer = provider.getSigner(accounts[0]); // 明确指定账户地址
        
        // 验证地址是否匹配
        const signerAddress = await signer.getAddress();
        if (signerAddress.toLowerCase() !== account.toLowerCase()) {
          throw new Error('钱包地址不匹配，请重新连接');
        }
      } catch (walletError: any) {
        console.error('[CompactTrade] 获取 provider 失败:', walletError);
        
        // 处理特定错误
        if (walletError.code === 'UNSUPPORTED_OPERATION') {
          toast.error('钱包账户未授权，请先连接钱包');
        } else {
          toast.error(`钱包连接异常: ${walletError.message || '未知错误'}`);
        }
        setIsSubmitting(false);
        return;
      }
      
      const userAddress = account;
      const collateralToLock = requiredCollateral;
      if (side === 'buy') {
        if (!market.conditionId) {
          toast.error('该市场尚未上链，无法锁定 USDC。');
          setIsSubmitting(false);
          return;
        }
        if (collateralToLock <= 0) {
          toast.error('请输入有效的数量和价格');
          setIsSubmitting(false);
          return;
        }
        if (insufficientBalance) {
          toast.error(`USDC 余额不足，至少需要 ${collateralToLock.toFixed(2)} USDC`);
          setIsSubmitting(false);
          return;
        }

        try {
          toast.info('正在链上锁定 USDC，请在钱包中确认交易', { duration: 7000 });
          await splitPosition(signer, market.conditionId, collateralToLock);
          toast.success('USDC 已锁定，准备提交订单', { duration: 4000 });
          await refetchUsdcBalance?.();
        } catch (lockError: any) {
          console.error('锁定 USDC 失败:', lockError);
          toast.error(`锁定 USDC 失败：${lockError?.message || '未知错误'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // 3. 创建订单
      const outcomeValue = outcome === 'yes' ? 1 : 0;
      const orderData: Order = {
        orderId: generateOrderId(),
        marketId: market.id,
        maker: userAddress,
        side: side,
        outcome: outcomeValue,
        price: currentPrice.toString(),
        amount: amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400
      };

      // 4. 签名订单
      const signature = await signOrder(orderData, signer);
      
      const order = {
        ...orderData,
        questionId: market.questionId,
        signature
      };

      console.log('[CompactTrade] 提交订单:', order);

      // 5. 提交订单
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (result.success) {
        // 🚀 如果撮合成功且有链上执行数据，提示用户执行链上交易
        if (result.matched && result.onChainExecution) {
          toast.success(
            `✅ 订单已撮合！\n\n` +
            `需要执行链上交易以完成资产转移。\n` +
            `点击"执行链上交易"按钮继续。`,
            { duration: 8000 }
          );
          
          // 存储链上执行数据，供后续使用
          setPendingOnChainExecution({
            orderId: result.order.id,
            onChainExecution: result.onChainExecution,
            marketTitle: market.title,
            side,
            amount
          });
          
          // 不关闭弹窗，等待用户执行链上交易
          setIsSubmitting(false);
          return;
        } else {
          toast.success(
            `🎉 ${t('orderForm.orderSuccess')}\n\n` +
            `${side === 'buy' ? '买入' : '卖出'} ${outcome.toUpperCase()}\n` +
            `数量: $${amount}\n` +
            `价格: $${currentPrice.toFixed(2)}`,
            { duration: 5000 }
          );
          onClose();
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        throw new Error(result.error || '提交失败');
      }
      
    } catch (error: any) {
      console.error('交易失败:', error);
      
      if (error.code === 4001) {
        toast.warning(t('orderForm.userCancelled'));
      } else {
        toast.error(`${t('orderForm.orderFailed')}:\n${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 执行链上交易
   */
  const handleOnChainExecution = async () => {
    if (!pendingOnChainExecution || !polymarket.isConnected) {
      toast.warning('请先连接钱包');
      return;
    }

    try {
      setIsExecutingOnChain(true);

      const { onChainExecution } = pendingOnChainExecution;
      const ctfOrder = onChainExecution.ctfOrder;

      // 1. 检查是否需要 Maker 签名
      let makerSignature = onChainExecution.makerOrder?.signature || '';
      const makerAddress = onChainExecution.makerOrder?.address?.toLowerCase();

      if (!makerSignature) {
        const injectedProvider = getActiveProvider();
        if (!injectedProvider) {
          toast.error('检测不到钱包环境，无法签名');
          setIsExecutingOnChain(false);
          return;
        }

        // ✅ 统一：只使用 eth_accounts 静默检查，不调用 eth_requestAccounts
        // 使用 useWallet() hook 提供的 address
        const accounts = await injectedProvider.request({ method: 'eth_accounts' });
        
        if (!accounts || accounts.length === 0 || accounts[0].toLowerCase() !== account?.toLowerCase()) {
          throw new Error('钱包账户不匹配，请刷新页面后重试');
        }
        
        const currentUser = account?.toLowerCase();

        if (currentUser && makerAddress && currentUser === makerAddress) {
          // 当前用户是订单的 maker，要求其签署 CTF 订单
          toast.info('请在钱包中确认签名，以授权链上交易');
          
          // ✅ 修复：先验证账户，再创建 signer
          const accountsForSign = await injectedProvider.request({ method: 'eth_accounts' });
          
          if (!accountsForSign || accountsForSign.length === 0 || accountsForSign[0].toLowerCase() !== account?.toLowerCase()) {
            throw new Error('钱包账户未授权，请先连接钱包');
          }
          
          const providerForSignature = new ethers.providers.Web3Provider(injectedProvider);
          const signerForSignature = providerForSignature.getSigner(accountsForSign[0]); // 明确指定账户地址
          const orderForSign = {
            ...ctfOrder,
            side: Number(ctfOrder.side),
            signatureType: Number(ctfOrder.signatureType)
          };
          const signature = await signCTFOrder(orderForSign, signerForSignature as any);
          makerSignature = signature;

          // 保存签名到服务器
          await fetch(`/api/orders/${onChainExecution.makerOrder.id}/signature`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ signature })
          });

          setPendingOnChainExecution((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              onChainExecution: {
                ...prev.onChainExecution,
                makerOrder: {
                  ...prev.onChainExecution.makerOrder,
                  signature
                }
              }
            };
          });
        } else {
          toast.warning('订单需要 Maker 签名。请联系订单创建者完成签名后再执行。');
          setIsExecutingOnChain(false);
          return;
        }
      }

      // 2. 转换订单格式为 CTF Exchange 需要的格式
      const ctfOrderFormatted = {
        salt: ethers.BigNumber.from(ctfOrder.salt),
        maker: ctfOrder.maker,
        signer: ctfOrder.signer,
        taker: ctfOrder.taker,
        tokenId: ethers.BigNumber.from(ctfOrder.tokenId),
        makerAmount: ethers.BigNumber.from(ctfOrder.makerAmount),
        takerAmount: ethers.BigNumber.from(ctfOrder.takerAmount),
        expiration: ethers.BigNumber.from(ctfOrder.expiration),
        nonce: ethers.BigNumber.from(ctfOrder.nonce),
        feeRateBps: ethers.BigNumber.from(ctfOrder.feeRateBps),
        side: ctfOrder.side,
        signatureType: ctfOrder.signatureType
      };

      // 3. 调用 fillOrder
      const fillAmount = ethers.BigNumber.from(onChainExecution.fillAmount || ctfOrder.takerAmount);
      const result = await polymarket.fillOrder(
        ctfOrderFormatted as any,
        makerSignature,
        fillAmount
      );

      toast.success(
        `✅ 链上交易成功！\n\n` +
        `交易哈希: ${result.transactionHash.slice(0, 10)}...\n` +
        `查看: ${result.explorerUrl}`,
        { duration: 8000 }
      );

      // 清除待执行数据
      setPendingOnChainExecution(null);
      
      // 关闭弹窗并刷新
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('链上交易失败:', error);
      toast.error(`链上交易失败: ${error.message}`);
    } finally {
      setIsExecutingOnChain(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4
                 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 小卡片 */}
      <div 
        className="bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-sm 
                   border border-white/10 overflow-hidden
                   animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 市场标题 */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-white font-semibold text-base leading-tight flex-1">
              {market.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Buy / Sell 切换 */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${
                side === 'buy'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${
                side === 'sell'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Yes / No 价格选择 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOutcome('yes')}
              className={`relative p-4 rounded-xl transition-all ${
                outcome === 'yes'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 border-2 border-emerald-400'
                  : 'bg-white/5 border-2 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${
                outcome === 'yes' ? 'text-emerald-100' : 'text-gray-400'
              }`}>
                Yes
              </div>
              <div className={`text-2xl font-bold ${
                outcome === 'yes' ? 'text-white' : 'text-gray-300'
              }`}>
                {price.loading ? '...' : `$${price.yes.toFixed(2)}`}
              </div>
              {outcome === 'yes' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            
            <button
              onClick={() => setOutcome('no')}
              className={`relative p-4 rounded-xl transition-all ${
                outcome === 'no'
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30 border-2 border-rose-400'
                  : 'bg-white/5 border-2 border-white/10 hover:border-rose-500/30'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${
                outcome === 'no' ? 'text-rose-100' : 'text-gray-400'
              }`}>
                No
              </div>
              <div className={`text-2xl font-bold ${
                outcome === 'no' ? 'text-white' : 'text-gray-300'
              }`}>
                {price.loading ? '...' : `$${price.no.toFixed(2)}`}
              </div>
              {outcome === 'no' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* 数量输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              数量
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-lg font-semibold text-white 
                         bg-white/5 border-2 border-white/10 rounded-xl 
                         focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 
                         transition-all placeholder-gray-500"
                placeholder="10"
                min="1"
                step="1"
              />
            </div>
            {/* 快速金额按钮 */}
            <div className="mt-2 flex gap-2">
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-400 
                           bg-white/5 hover:bg-white/10 border border-white/10 
                           hover:border-amber-400/30 rounded-lg transition-all"
                >
                  ${preset}
                </button>
              ))}
            </div>
          {isConnected && side === 'buy' && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>USDC 余额</span>
                <button
                  type="button"
                  onClick={() => refetchUsdcBalance?.()}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  disabled={isUsdcBalanceFetching}
                >
                  {isUsdcBalanceFetching ? '同步中...' : '刷新'}
                </button>
              </div>
              <div
                className={`text-sm font-semibold ${
                  insufficientBalance ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {usdcBalanceError
                  ? '余额查询失败，请确认 RPC'
                  : `${usdcBalance.toFixed(2)} USDC`}
              </div>
              {balanceStatusMessage && (
                <p
                  className={`text-xs ${
                    insufficientBalance ? 'text-rose-400' : 'text-gray-400'
                  }`}
                >
                  {balanceStatusMessage}
                </p>
              )}
            </div>
          )}
          </div>

          {/* 钱包连接状态 */}
          {!isConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg">
                <p className="text-sm text-amber-400 text-center mb-3">
                  请先连接钱包
                </p>
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 显示已连接的钱包地址 */}
              {account && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-400 text-center">
                    已连接: {account.substring(0, 6)}...{account.substring(38)}
                  </p>
                </div>
              )}

              {/* 如果有待执行的链上交易 */}
              {pendingOnChainExecution ? (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-sm text-amber-400 mb-2">
                      ⚡ 订单已撮合，需要执行链上交易完成资产转移
                    </p>
                    <p className="text-xs text-gray-400">
                      成交数量: {getPendingTokenAmount() || pendingOnChainExecution.amount}，预计支付: {getPendingUsdcAmount() || '--'} USDC
                    </p>
                  </div>
                  <button
                    onClick={handleOnChainExecution}
                    disabled={isExecutingOnChain || !polymarket.isConnected}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all transform
                      bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 
                      text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] 
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isExecutingOnChain ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> 执行链上交易中...
                      </span>
                    ) : (
                      '🚀 执行链上交易'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPendingOnChainExecution(null);
                      onClose();
                      setTimeout(() => window.location.reload(), 500);
                    }}
                    className="w-full py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    稍后执行
                  </button>
                </>
              ) : (
                /* 交易按钮 */
                <button
                  onClick={handleTrade}
                  disabled={
                    isSubmitting ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    price.loading ||
                    (side === 'buy' && insufficientBalance)
                  }
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform
                    ${side === 'buy'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/30'
                  } text-white hover:scale-[1.02] 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      处理中...
                    </span>
                  ) : (
                    `${side === 'buy' ? '买入' : '卖出'} ${outcome.toUpperCase()}`
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

