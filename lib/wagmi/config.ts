import { polygonAmoy } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Chain } from 'viem';

// WalletConnect 项目 ID（必需）
// 获取：https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('⚠️ 未检测到 NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID，钱包列表会受到限制');
}

// 定义 chains 数组，使用明确的类型以确保类型匹配
const chains: [Chain, ...Chain[]] = [polygonAmoy];

// 使用 RainbowKit 官方提供的默认配置，避免低级 API 兼容性问题
// getDefaultConfig 已经包含了所有默认钱包（MetaMask, WalletConnect, Coinbase Wallet 等）
// 不需要手动配置 wallets，这样可以避免类型兼容性问题
export const wagmiConfig = getDefaultConfig({
  appName: 'LUMI',
  projectId: projectId || '00000000000000000000000000000000',
  chains,
  ssr: true,
});

// 导出链配置供其他地方使用
export { polygonAmoy };

