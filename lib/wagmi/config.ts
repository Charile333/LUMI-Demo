import { createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { 
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  okxWallet,
  trustWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

// WalletConnect 项目 ID
// 获取：https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// 🔧 使用单例模式，避免在热重载时重复创建配置
let cachedConnectors: ReturnType<typeof connectorsForWallets> | undefined;
let cachedWagmiConfig: ReturnType<typeof createConfig> | undefined;

// 获取或创建钱包连接器
function getConnectors() {
  if (!cachedConnectors) {
    cachedConnectors = connectorsForWallets(
      [
        {
          groupName: 'Popular',
          wallets: [
            metaMaskWallet,
            coinbaseWallet,
            okxWallet,
            walletConnectWallet,
          ],
        },
        {
          groupName: 'More',
          wallets: [
            rainbowWallet,
            trustWallet,
          ],
        },
      ],
      {
        appName: 'LUMI',
        projectId,
      }
    );
  }
  return cachedConnectors;
}

// 获取或创建 Wagmi 配置（单例模式）
function getWagmiConfig() {
  if (!cachedWagmiConfig) {
    cachedWagmiConfig = createConfig({
      chains: [polygonAmoy],
      connectors: getConnectors(),
      transports: {
        [polygonAmoy.id]: http(),
      },
      ssr: true, // 支持 SSR
    });
    console.log('✅ Wagmi Config 已初始化');
  }
  return cachedWagmiConfig;
}

// 导出 Wagmi 配置
export const wagmiConfig = getWagmiConfig();

// 导出链配置供其他地方使用
export { polygonAmoy };

