// 🚀 快速交易弹窗组件（类似 Polymarket）
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { signOrder, generateSalt, generateOrderId, type Order } from '@/lib/clob/signing';
import { convertToCTFOrder, type CTFOrder } from '@/lib/ctf-exchange/service';
import { signCTFOrder } from '@/lib/ctf-exchange/signing';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';
import { useWallet } from '@/app/provider-wagmi';
import { getBrowserWalletProvider } from '@/lib/wallet/getBrowserWalletProvider';

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: number;
    title: string;
    questionId: string;
    conditionId?: string;
    condition_id?: string;
  };
  side: 'YES' | 'NO';
}

export default function QuickTradeModal({
  isOpen,
  onClose,
  market,
  side
}: QuickTradeModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const polymarket = useLUMIPolymarket();
  // ✅ 统一：使用 useWallet() hook 获取钱包状态
  const { address: account, isConnected, provider: walletProvider } = useWallet();
  const [amount, setAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0.50);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pendingOnChainExecution, setPendingOnChainExecution] = useState<any>(null);
  const [isExecutingOnChain, setIsExecutingOnChain] = useState(false);

  const conditionIdFromMarket = market.conditionId || market.condition_id;

  const serializeCTFOrder = (ctfOrder: CTFOrder) => ({
    salt: ctfOrder.salt.toString(),
    maker: ctfOrder.maker,
    signer: ctfOrder.signer,
    taker: ctfOrder.taker,
    tokenId: ctfOrder.tokenId.toString(),
    makerAmount: ctfOrder.makerAmount.toString(),
    takerAmount: ctfOrder.takerAmount.toString(),
    expiration: ctfOrder.expiration.toString(),
    nonce: ctfOrder.nonce.toString(),
    feeRateBps: ctfOrder.feeRateBps.toString(),
    side: ctfOrder.side,
    signatureType: ctfOrder.signatureType
  });
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

  const getPendingTokenAmount = () => {
    if (!pendingOnChainExecution?.onChainExecution) return null;
    const amount = parseFloat(pendingOnChainExecution.onChainExecution.tradeAmount || '0');
    if (Number.isNaN(amount)) return pendingOnChainExecution.onChainExecution.tradeAmount || null;
    return amount.toFixed(2);
  };

  // 确保只在客户端渲染（避免 SSR 问题）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 📊 从订单簿获取实时价格（带超时处理）
  useEffect(() => {
    const fetchOrderBookPrice = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        
        // 🔧 添加请求超时（3秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const outcome = side === 'YES' ? 1 : 0;
        const response = await fetch(
          `/api/orders/book?marketId=${market.id}&outcome=${outcome}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.success && data.orderBook) {
          // 获取最佳买入价格
          const bestPrice = data.orderBook.asks?.[0]?.price || 
                           data.orderBook.bids?.[0]?.price || 
                           0.50;
          setCurrentPrice(parseFloat(bestPrice));
        } else {
          console.warn('⚠️ 订单簿为空，使用默认价格');
          setCurrentPrice(0.50);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('⚠️ 获取价格超时，使用默认价格');
        } else {
          console.error('❌ 获取价格失败:', error.message);
        }
        setCurrentPrice(0.50); // 默认价格
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBookPrice();
  }, [isOpen, market.id, side]);

  const getActiveProvider = () => {
    const candidate = walletProvider ?? getBrowserWalletProvider();
    if (candidate && typeof candidate.request === 'function') {
      return candidate;
    }
    return null;
  };

  if (!isOpen) return null;

  const handleTrade = async () => {
    try {
      setIsSubmitting(true);
      
      const injectedProvider = getActiveProvider();
      
      if (!injectedProvider) {
        toast.warning(t('orderForm.installMetaMask'));
        setIsSubmitting(false);
        return;
      }
      
      // ✅ 双重验证：先检查 hook 状态，再验证实际钱包连接
      // 1. 检查 hook 状态
      if (!account || !isConnected) {
        toast.warning('请先连接钱包');
        setIsSubmitting(false);
        return;
      }
      
      // 2. 验证实际钱包连接状态（通过 eth_accounts）
      const accounts = await injectedProvider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        toast.warning('钱包未连接，请先连接钱包');
        setIsSubmitting(false);
        return;
      }
      
      if (accounts[0].toLowerCase() !== account.toLowerCase()) {
        toast.warning('钱包地址不匹配，请重新连接钱包');
        setIsSubmitting(false);
        return;
      }

      // 3. 确保在正确的网络（Polygon Amoy 80002）
      try {
        const targetChainIdHex = '0x13882'; // 80002
        const currentChainId = await injectedProvider.request({ method: 'eth_chainId' });
        if (currentChainId?.toLowerCase() !== targetChainIdHex) {
          try {
            await injectedProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainIdHex }]
            });
          } catch (switchError: any) {
            // 链未添加到钱包
            if (switchError?.code === 4902) {
              try {
                await injectedProvider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: targetChainIdHex,
                    chainName: 'Polygon Amoy',
                    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                    rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com'],
                    blockExplorerUrls: ['https://www.oklink.com/amoy']
                  }]
                });
              } catch (addError: any) {
                toast.error('请在钱包中手动切换至 Polygon Amoy (80002) 网络');
                setIsSubmitting(false);
                return;
              }
            } else {
              toast.error('请在钱包中切换至 Polygon Amoy (80002) 网络');
              setIsSubmitting(false);
              return;
            }
          }
        }
      } catch (netErr) {
        // 忽略，继续后续流程，但很可能会在签名时报错
        console.warn('网络检查/切换失败', netErr);
      }

      // 4. 获取 provider 和 signer（仅用于签名，不用于连接）
      // ✅ 账户已验证，现在可以安全创建 signer
      let provider, signer;
      
      try {
        
        // ✅ 修复：明确指定账户地址创建 signer，避免 "unknown account #0" 错误
        provider = new ethers.providers.Web3Provider(injectedProvider);
        signer = provider.getSigner(accounts[0]); // 明确指定账户地址
        
        console.log('[QuickTrade] 使用已连接的钱包地址:', account);
      } catch (walletError: any) {
        console.error('[QuickTrade] 获取签名器失败:', walletError);
        toast.error(`获取签名器失败: ${walletError.message || '未知错误'}`);
        setIsSubmitting(false);
        return;
      }
      
      // 确保已获取到必要的对象
      if (!provider || !signer) {
        toast.error('钱包连接异常，请刷新页面后重试');
        setIsSubmitting(false);
        return;
      }
      
      const userAddress = account; // 使用 hook 提供的 address

      if (!conditionIdFromMarket) {
        toast.error('该市场缺少链上 conditionId，无法执行链上交易');
        setIsSubmitting(false);
        return;
      }

      // 4. 创建订单数据（使用标准Order接口）
      const outcome = side === 'YES' ? 1 : 0;
      const orderData: Order = {
        orderId: generateOrderId(),
        marketId: market.id,
        maker: userAddress,
        side: 'buy' as const,
        outcome: outcome,
        price: currentPrice.toString(),
        amount: amount,
        salt: generateSalt(),
        nonce: Date.now(),
        expiration: Math.floor(Date.now() / 1000) + 86400 // 24小时有效期
      };

      // 5. 生成 CTF Exchange 订单并签名
      const ctfOrderRaw = convertToCTFOrder(
        {
          maker: userAddress,
          marketId: market.id,
          outcome,
          side: 'buy',
          price: currentPrice.toString(),
          amount,
          expiration: orderData.expiration,
          nonce: orderData.nonce,
          salt: orderData.salt
        },
        conditionIdFromMarket
      );

      const ctfOrderForSigning = {
        salt: ctfOrderRaw.salt,
        maker: ctfOrderRaw.maker,
        signer: ctfOrderRaw.signer,
        taker: ctfOrderRaw.taker,
        tokenId: ctfOrderRaw.tokenId,
        makerAmount: ctfOrderRaw.makerAmount,
        takerAmount: ctfOrderRaw.takerAmount,
        expiration: ctfOrderRaw.expiration,
        nonce: ctfOrderRaw.nonce,
        feeRateBps: ctfOrderRaw.feeRateBps,
        side: ctfOrderRaw.side,
        signatureType: ctfOrderRaw.signatureType
      };

      const ctfSignature = await signCTFOrder(ctfOrderForSigning, signer);
      const ctfOrderPayload = serializeCTFOrder(ctfOrderRaw);

      // 6. 使用链下签名函数签名（用于数据库校验）
      const signature = await signOrder(orderData, signer);
      
      const order = {
        ...orderData,
        questionId: market.questionId,
        signature,
        conditionId: conditionIdFromMarket,
        ctfOrder: ctfOrderPayload,
        ctfSignature
      };

      console.log('[QuickTrade] 提交订单:', order);

      // 7. 提交订单到 API
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
          return;
        } else {
          toast.success(
            `🎉 ${t('orderForm.orderSuccess')}\n\n` +
            `${t('quickTrade.market')}: ${market.title}\n` +
            `${t('orderForm.outcome')}: ${side}\n` +
            `${t('quickTrade.amount')}: $${amount}\n` +
            `${t('quickTrade.avgPrice')}: $${currentPrice.toFixed(2)}`,
            { duration: 5000 }
          );
          onClose();
          
          // 刷新页面以显示更新后的数据
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
      } else if (error.message?.includes('user rejected')) {
        toast.warning(t('orderForm.userRejected'));
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
          
          // ✅ 修复：明确指定账户地址创建 signer，避免 "unknown account #0" 错误
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

      // 4. 调用 fillOrder
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

  const expectedShares = parseFloat(amount) / currentPrice;
  const potentialReturn = side === 'YES' 
    ? (expectedShares * 1) - parseFloat(amount)
    : (expectedShares * 1) - parseFloat(amount);

  // 如果不在客户端或未打开，不渲染
  if (!isOpen || !mounted) return null;

  // 使用 Portal 渲染到 body，确保在最顶层
  return createPortal(
    <>
      {/* 背景遮罩 - 最高层级（仅次于Toast） */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center 
                   animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* 弹窗内容 */}
        <div 
          className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden 
                     border-2 border-amber-400/30
                     animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className={`p-6 ${side === 'YES' ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-pink-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm border border-white/30">
                  {side === 'YES' ? '✓' : '✗'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {t('quickTrade.buy')} {side}
                  </h3>
                  <p className="text-white/90 text-sm font-medium">
                    ${currentPrice.toFixed(2)} {t('quickTrade.perShare')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 
                         flex items-center justify-center transition-all text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 市场信息 */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <p className="text-gray-400 text-sm mb-1">{t('quickTrade.market')}</p>
            <p className="text-white font-semibold text-base">
              {market.title}
            </p>
          </div>

          {/* 交易表单 */}
          <div className="p-6 space-y-4">
            {/* 金额输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {t('quickTrade.amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg font-semibold text-white 
                           bg-white/5 border-2 border-white/10 rounded-xl 
                           focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                           transition-all placeholder-gray-500"
                  placeholder="10"
                  min="1"
                  step="1"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-gray-300 
                             bg-white/5 hover:bg-amber-400/20 border border-white/10 
                             hover:border-amber-400/50 rounded-lg transition-all"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 预估信息 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('quickTrade.avgPrice')}</span>
                <span className="font-semibold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('quickTrade.shares')}</span>
                <span className="font-semibold text-white">
                  {expectedShares.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">{t('quickTrade.potentialReturn')}</span>
                <span className={`font-bold ${potentialReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {potentialReturn > 0 ? '+' : ''}${potentialReturn.toFixed(2)} 
                  {potentialReturn > 0 && ` (+${((potentialReturn / parseFloat(amount)) * 100).toFixed(0)}%)`}
                </span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-400 leading-relaxed">
                ⚡ {t('quickTrade.quickTradeNote')}
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 pt-0 space-y-3">
            {/* 如果有待执行的链上交易 */}
            {pendingOnChainExecution ? (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
                  <p className="text-sm text-amber-400 mb-2">
                    ⚡ 订单已撮合，需要执行链上交易完成资产转移
                  </p>
                  <p className="text-xs text-gray-400">
                    成交数量: {getPendingTokenAmount() || pendingOnChainExecution.amount} ，预计支付: {getPendingUsdcAmount() || '--'} USDC
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
              <button
                onClick={handleTrade}
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform
                  ${side === 'YES'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/50'
                    : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-red-500/50'
                } text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> {t('quickTrade.processing')}
                  </span>
                ) : (
                  `${t('quickTrade.buyFor')} ${side} ${t('quickTrade.for')} $${amount}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

