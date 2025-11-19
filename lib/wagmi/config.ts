import { polygonAmoy } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// WalletConnect 项目 ID（必需）
// 获取：https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('⚠️ 未检测到 NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID，钱包列表会受到限制');
}

const chains = [polygonAmoy];

// 使用 RainbowKit 官方提供的默认配置，避免低级 API 兼容性问题
export const wagmiConfig = getDefaultConfig({
  appName: 'LUMI',
  projectId: projectId || '00000000000000000000000000000000',
  chains,
  ssr: true,
});

// 导出链配置供其他地方使用
export { polygonAmoy };

