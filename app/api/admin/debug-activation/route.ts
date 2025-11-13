// 🔍 调试市场激活配置
// 检查服务器端环境变量和 RPC 连接

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// 强制使用 Node.js Runtime（Edge Runtime 对 fetch 有限制）
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const debug: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    rpc: {},
    wallet: {},
    recommendations: []
  };

  try {
    // 1. 检查环境变量
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;

    debug.environment = {
      NEXT_PUBLIC_RPC_URL: rpcUrl ? {
        configured: true,
        preview: rpcUrl.substring(0, 50) + '...',
        length: rpcUrl.length
      } : {
        configured: false,
        error: '未配置'
      },
      PLATFORM_WALLET_PRIVATE_KEY: privateKey ? {
        configured: true,
        preview: privateKey.substring(0, 10) + '...',
        startsWith: privateKey.startsWith('0x') ? '0x' : privateKey.substring(0, 3),
        length: privateKey.length
      } : {
        configured: false,
        error: '未配置'
      },
      NODE_ENV: process.env.NODE_ENV
    };

    // 2. 测试 RPC 连接（先用原生 fetch 测试，再用 ethers.js）
    if (rpcUrl) {
      try {
        debug.rpc.testing = true;
        
        // 先用原生 fetch 测试 RPC 是否可访问
        const fetchStartTime = Date.now();
        
        // 使用 AbortController 实现超时（兼容性更好）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const fetchResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const fetchLatency = Date.now() - fetchStartTime;
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const fetchData = await fetchResponse.json();
        
        // 如果原生 fetch 成功，再用 ethers.js 测试
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
          name: 'polygon-amoy',
          chainId: 80002
        });

        const startTime = Date.now();
        const blockNumber = await provider.getBlockNumber();
        const latency = Date.now() - startTime;

        debug.rpc = {
          success: true,
          blockNumber,
          latency: `${latency}ms`,
          fetchLatency: `${fetchLatency}ms`,
          fetchSuccess: true,
          network: {
            chainId: provider.network.chainId,
            name: provider.network.name
          }
        };
      } catch (error: any) {
        // 检查是否是 fetch 错误还是 ethers.js 错误
        const isFetchError = error.name === 'AbortError' || error.message.includes('fetch');
        const isEthersError = error.code === 'SERVER_ERROR' || error.code === 'NETWORK_ERROR';
        
        debug.rpc = {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorName: error.name,
          isFetchError,
          isEthersError,
          stack: error.stack?.substring(0, 500) // 只显示前500字符
        };
      }
    } else {
      debug.rpc = {
        success: false,
        error: 'RPC URL 未配置'
      };
    }

    // 3. 检查钱包
    if (privateKey && rpcUrl) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
          name: 'polygon-amoy',
          chainId: 80002
        });

        const wallet = new ethers.Wallet(privateKey, provider);
        const address = wallet.address;
        const balance = await wallet.getBalance();
        const maticBalance = ethers.utils.formatEther(balance);

        debug.wallet = {
          address,
          maticBalance,
          hasEnoughMatic: balance.gte(ethers.utils.parseEther('0.1')),
          status: balance.gte(ethers.utils.parseEther('0.1')) ? '✅ 充足' : '⚠️ 不足'
        };

        // 检查 USDC
        try {
          const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a';
          const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
          const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
          const usdcBalance = await usdc.balanceOf(address);
          const usdcFormatted = ethers.utils.formatUnits(usdcBalance, 6);

          debug.wallet.usdcBalance = usdcFormatted;
          debug.wallet.hasEnoughUsdc = usdcBalance.gte(ethers.utils.parseUnits('10', 6));
        } catch (error: any) {
          debug.wallet.usdcError = error.message;
        }

      } catch (error: any) {
        debug.wallet = {
          error: error.message,
          stack: error.stack
        };
      }
    } else {
      debug.wallet = {
        error: '私钥或 RPC 未配置'
      };
    }

    // 4. 生成建议
    if (!rpcUrl) {
      debug.recommendations.push({
        level: 'error',
        message: 'NEXT_PUBLIC_RPC_URL 未配置',
        solution: '在 .env.local 中添加 NEXT_PUBLIC_RPC_URL'
      });
    }

    if (!privateKey) {
      debug.recommendations.push({
        level: 'error',
        message: 'PLATFORM_WALLET_PRIVATE_KEY 未配置',
        solution: '在 .env.local 中添加 PLATFORM_WALLET_PRIVATE_KEY'
      });
    }

    if (debug.rpc.success === false) {
      debug.recommendations.push({
        level: 'error',
        message: 'RPC 连接失败',
        solution: '检查 RPC URL 是否正确，网络是否可访问'
      });
    }

    if (debug.wallet.hasEnoughMatic === false) {
      debug.recommendations.push({
        level: 'warning',
        message: 'MATIC 余额不足',
        solution: '获取测试 MATIC: https://faucet.polygon.technology/'
      });
    }

    // 总结
    const allGood = 
      debug.environment.NEXT_PUBLIC_RPC_URL.configured &&
      debug.environment.PLATFORM_WALLET_PRIVATE_KEY.configured &&
      debug.rpc.success === true &&
      debug.wallet.hasEnoughMatic === true;

    debug.summary = allGood ? '✅ 所有配置正常' : '❌ 存在问题，请查看 recommendations';

    return NextResponse.json({
      success: true,
      debug
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      debug
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

