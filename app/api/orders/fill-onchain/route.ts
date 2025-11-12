// 🔗 填充链上订单 API
// 实际调用 CTF Exchange 合约执行交易

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { supabaseAdmin } from '@/lib/supabase-client';

// CTF Exchange 合约配置
const CTF_EXCHANGE_ADDRESS = process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDRESS || '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';

// CTF Exchange ABI（fillOrder 函数）
const CTF_EXCHANGE_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "name": "salt", "type": "uint256" },
          { "name": "maker", "type": "address" },
          { "name": "signer", "type": "address" },
          { "name": "taker", "type": "address" },
          { "name": "tokenId", "type": "uint256" },
          { "name": "makerAmount", "type": "uint256" },
          { "name": "takerAmount", "type": "uint256" },
          { "name": "expiration", "type": "uint256" },
          { "name": "nonce", "type": "uint256" },
          { "name": "feeRateBps", "type": "uint256" },
          { "name": "side", "type": "uint8" },
          { "name": "signatureType", "type": "uint8" }
        ],
        "name": "order",
        "type": "tuple"
      },
      { "name": "signature", "type": "bytes" },
      { "name": "fillAmount", "type": "uint256" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      ctfOrder, 
      makerSignature, 
      fillAmount, 
      takerAddress,
      makerOrderId,
      takerOrderId,
      useFrontend = true // 默认使用前端执行
    } = body;

    // 验证必需参数
    if (!ctfOrder || !makerSignature || !fillAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必需参数：ctfOrder, makerSignature, fillAmount' 
        },
        { status: 400 }
      );
    }

    console.log('🔗 开始执行链上交易:', {
      maker: ctfOrder.maker,
      taker: takerAddress || 'frontend',
      tokenId: ctfOrder.tokenId,
      fillAmount
    });

    // 检查是否配置了平台钱包
    const platformPrivateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    
    // 如果使用前端执行模式，或未配置平台钱包，返回交易数据
    if (useFrontend || !platformPrivateKey) {
      console.log('📱 使用前端执行模式');
      
      // 编码交易数据
      const iface = new ethers.utils.Interface(CTF_EXCHANGE_ABI);
      const data = iface.encodeFunctionData('fillOrder', [
        ctfOrder,
        makerSignature,
        fillAmount
      ]);

      return NextResponse.json({
        success: true,
        requiresFrontendExecution: true,
        message: '请在前端使用您的钱包执行此交易',
        transaction: {
          to: CTF_EXCHANGE_ADDRESS,
          data,
          value: '0',
          chainId: 80002
        },
        explorerUrl: `https://amoy.polygonscan.com/address/${CTF_EXCHANGE_ADDRESS}#writeContract`
      });
    }

    // ============================================
    // 平台中继模式（需要配置 PLATFORM_WALLET_PRIVATE_KEY）
    // ============================================
    
    console.log('🤖 使用平台中继模式');

    // 创建 provider 和 wallet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(platformPrivateKey, provider);
    
    console.log('💰 平台钱包地址:', wallet.address);

    // 检查 Gas 余额
    const balance = await wallet.getBalance();
    console.log('💰 钱包余额:', ethers.utils.formatEther(balance), 'MATIC');
    
    if (balance.lt(ethers.utils.parseEther('0.01'))) {
      return NextResponse.json(
        { 
          success: false, 
          error: '平台钱包 MATIC 余额不足，请充值至少 0.01 MATIC' 
        },
        { status: 400 }
      );
    }

    // 创建合约实例
    const ctfExchange = new ethers.Contract(
      CTF_EXCHANGE_ADDRESS,
      CTF_EXCHANGE_ABI,
      wallet
    );

    // 估算 Gas
    let gasEstimate;
    try {
      gasEstimate = await ctfExchange.estimateGas.fillOrder(
        ctfOrder,
        makerSignature,
        fillAmount
      );
      console.log('⛽ 预估 Gas:', gasEstimate.toString());
    } catch (error: any) {
      console.error('❌ Gas 估算失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `交易可能失败：${error.reason || error.message}`,
          details: '请检查：1) 订单是否有效 2) 余额是否足够 3) 是否已授权'
        },
        { status: 400 }
      );
    }

    // 执行 fillOrder
    const tx = await ctfExchange.fillOrder(
      ctfOrder,
      makerSignature,
      fillAmount,
      {
        gasLimit: gasEstimate.mul(120).div(100) // 增加 20% 的 Gas 余量
      }
    );

    console.log('📝 交易已提交:', tx.hash);

    // 等待 1 个确认
    const receipt = await tx.wait(1);

    console.log('✅ 交易已确认:', receipt.transactionHash);

    // 更新数据库中的订单状态
    const updates = {
      status: 'filled',
      filled_amount: fillAmount,
      tx_hash: receipt.transactionHash,
      updated_at: new Date().toISOString()
    };

    if (makerOrderId) {
      await supabaseAdmin
        .from('orders')
        .update(updates)
        .eq('id', makerOrderId);
      console.log('✅ Maker 订单状态已更新');
    }

    if (takerOrderId) {
      await supabaseAdmin
        .from('orders')
        .update(updates)
        .eq('id', takerOrderId);
      console.log('✅ Taker 订单状态已更新');
    }

    return NextResponse.json({
      success: true,
      message: '链上交易执行成功',
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
      explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`,
      ordersUpdated: {
        maker: makerOrderId || null,
        taker: takerOrderId || null
      }
    });

  } catch (error: any) {
    console.error('❌ 链上执行失败:', error);
    
    // 提取详细错误信息
    let errorMessage = error.message || '链上执行失败';
    let errorDetails = '';
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Gas 费不足';
      errorDetails = '请确保钱包有足够的 MATIC';
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      errorMessage = '交易预计会失败';
      errorDetails = '请检查：1) USDC 余额 2) CTF Exchange 授权 3) 订单有效性';
    } else if (error.code === 'NONCE_EXPIRED') {
      errorMessage = 'Nonce 已过期';
      errorDetails = '请重试';
    } else if (error.reason) {
      errorMessage = error.reason;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails || error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

