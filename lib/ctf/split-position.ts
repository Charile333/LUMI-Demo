import { ethers } from 'ethers';
import { CTF_CONFIG, ERC20_ABI, USDC_DECIMALS } from '@/lib/ctf/config';

const CONDITIONAL_TOKENS_ABI = [
  'function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] partition, uint256 amount) external',
  'function balanceOf(address account, uint256 id) view returns (uint256)'
];

const PARTITION_YES_NO = [1, 2];
const ZERO_COLLECTION_ID = ethers.constants.HashZero;

export async function ensureUsdcAllowance(
  signer: ethers.Signer,
  spender: string,
  requiredUnits: ethers.BigNumber
): Promise<void> {
  const usdc = new ethers.Contract(CTF_CONFIG.contracts.usdc, ERC20_ABI, signer);
  const owner = await signer.getAddress();
  const currentAllowance = await usdc.allowance(owner, spender);

  if (currentAllowance.gte(requiredUnits)) {
    return;
  }

  const tx = await usdc.approve(spender, ethers.constants.MaxUint256);
  await tx.wait();
}

export async function splitPosition(
  signer: ethers.Signer,
  conditionId: string,
  amount: number
): Promise<ethers.providers.TransactionReceipt> {
  if (!conditionId) {
    throw new Error('缺少 conditionId，无法铸造 Position Tokens');
  }
  if (amount <= 0) {
    throw new Error('铸造数量必须大于 0');
  }

  const conditionalTokens = new ethers.Contract(
    CTF_CONFIG.contracts.conditionalTokens,
    CONDITIONAL_TOKENS_ABI,
    signer
  );

  const amountUnits = ethers.utils.parseUnits(amount.toFixed(USDC_DECIMALS), USDC_DECIMALS);

  await ensureUsdcAllowance(signer, conditionalTokens.address, amountUnits);

  const tx = await conditionalTokens.splitPosition(
    CTF_CONFIG.contracts.usdc,
    ZERO_COLLECTION_ID,
    conditionId,
    PARTITION_YES_NO,
    amountUnits,
    {
      gasLimit: 500000
    }
  );

  return tx.wait();
}

export async function getPositionBalance(
  provider: ethers.providers.Provider,
  address: string,
  tokenId: string
): Promise<ethers.BigNumber> {
  const conditionalTokens = new ethers.Contract(
    CTF_CONFIG.contracts.conditionalTokens,
    CONDITIONAL_TOKENS_ABI,
    provider
  );
  return conditionalTokens.balanceOf(address, tokenId);
}



