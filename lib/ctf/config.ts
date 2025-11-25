export const DEFAULT_POLYGON_AMOY_RPC =
  'https://polygon-amoy-bor-rpc.publicnode.com';

const runtimeRpcUrl =
  (typeof window === 'undefined'
    ? process.env.POLYGON_AMOY_RPC_URL ||
      process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL
    : process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL) || DEFAULT_POLYGON_AMOY_RPC;

export const CTF_CONFIG = {
  chainId: 80002,
  rpcUrl: runtimeRpcUrl,
  contracts: {
    conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
    usdc: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
  }
};

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

export const USDC_DECIMALS = 6;





