type InjectedProvider = {
  request?: (args: { method: string; params?: unknown[] }) => Promise<any>;
  [key: string]: any;
};

const isProvider = (provider: any): provider is InjectedProvider =>
  !!provider && typeof provider.request === 'function';

const addCandidate = (list: InjectedProvider[], candidate?: InjectedProvider | null) => {
  if (candidate && !list.includes(candidate)) {
    list.push(candidate);
  }
};

const candidateMatchers = [
  (provider: any) => provider?.isMetaMask && !provider?.isOkxWallet,
  (provider: any) => provider?.isOkxWallet,
  (provider: any) => provider?.isCoinbaseWallet,
  (provider: any) => provider?.isRainbow,
  () => true,
];

/**
 * 获取当前浏览器环境中可用的 EIP-1193 Provider
 * - 支持 MetaMask、OKX、Coinbase 等多钱包共存的场景
 * - 如果 window.ethereum 不存在，会尝试 okxwallet 等自定义注入对象
 */
export const getBrowserWalletProvider = (): InjectedProvider | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const win = window as any;
  const candidates: InjectedProvider[] = [];

  if (Array.isArray(win.ethereum?.providers)) {
    win.ethereum.providers.forEach((provider: InjectedProvider) => addCandidate(candidates, provider));
  }

  addCandidate(candidates, win.ethereum);
  addCandidate(candidates, win.okxwallet?.ethereum);
  addCandidate(candidates, win.okxwallet);
  addCandidate(candidates, win.coinbaseWalletExtension);

  for (const matcher of candidateMatchers) {
    const provider = candidates.find((candidate) => isProvider(candidate) && matcher(candidate));
    if (provider) {
      return provider;
    }
  }

  return null;
};

export const ensureBrowserProvider = (): InjectedProvider => {
  const provider = getBrowserWalletProvider();
  if (!provider) {
    throw new Error('未检测到可用的浏览器钱包，请安装或启用钱包插件');
  }
  return provider;
};


