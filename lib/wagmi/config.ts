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

// 检查 Project ID 是否有效
const isValidProjectId = projectId && projectId !== 'YOUR_PROJECT_ID' && projectId.length > 0;

// 🔧 使用单例模式，避免在热重载时重复创建配置
let cachedConnectors: ReturnType<typeof connectorsForWallets> | undefined;
let cachedWagmiConfig: ReturnType<typeof createConfig> | undefined;

// 获取或创建钱包连接器
function getConnectors() {
  if (!cachedConnectors) {
    // 如果 Project ID 无效，只启用 MetaMask（不需要 WalletConnect）
    if (!isValidProjectId) {
      if (typeof window !== 'undefined') {
        console.warn('⚠️ WalletConnect Project ID 未配置！');
        console.warn('   其他钱包（Coinbase Wallet、OKX Wallet、Trust Wallet、Rainbow Wallet 等）将无法使用。');
        console.warn('   配置方法：');
        console.warn('   1. 访问 https://cloud.walletconnect.com/');
        console.warn('   2. 创建项目并获取 Project ID');
        console.warn('   3. 在 .env.local 中添加：NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id');
        console.warn('   当前仅支持 MetaMask 连接。');
      }
      
      // 只使用 MetaMask（不需要 WalletConnect Project ID）
      cachedConnectors = connectorsForWallets(
        [
          {
            groupName: 'Popular',
            wallets: [
              metaMaskWallet,
            ],
          },
        ],
        {
          appName: 'LUMI',
          projectId: projectId, // 仍然传递，但不会被使用
        }
      );
    } else {
      // Project ID 有效，启用所有钱包
      // 注意：RainbowKit 会自动将已安装的钱包（EIP-6963）归类到 "Installed" 分组
      // 未安装的钱包会显示在配置的分组中，或通过 WalletConnect 访问
      // 将所有钱包放在一个分组中，确保都能显示（包括未安装的）
      cachedConnectors = connectorsForWallets(
        [
          {
            groupName: 'Popular',
            wallets: [
              metaMaskWallet,
              walletConnectWallet, // 通过 WalletConnect 可以访问所有支持的钱包
              coinbaseWallet,
              okxWallet,
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
      
      if (typeof window !== 'undefined') {
        console.log('✅ 钱包连接器已配置，Project ID:', projectId.substring(0, 8) + '...');
        console.log('✅ 已配置钱包:', ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'OKX Wallet', 'Rainbow Wallet', 'Trust Wallet']);
        console.log('ℹ️  已安装的钱包会自动归类到 "Installed" 分组');
        console.log('ℹ️  未安装的钱包会显示在 "Popular" 分组或通过 WalletConnect 访问');
      }
    }
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

