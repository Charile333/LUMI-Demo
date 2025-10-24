/**
 * 给测试账户铸造 Mock USDC
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

const MOCK_USDC = "0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a";

const USDC_ABI = [
  "function mint(address to, uint256 amount)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("当前账户:", signer.address);

  const usdc = new ethers.Contract(MOCK_USDC, USDC_ABI, signer);

  // 检查当前余额
  const balanceBefore = await usdc.balanceOf(signer.address);
  console.log("当前 USDC 余额:", ethers.utils.formatUnits(balanceBefore, 6));

  // 铸造 1000 USDC
  const amount = ethers.utils.parseUnits("1000", 6);
  console.log("\n铸造 1000 USDC...");
  
  const tx = await usdc.mint(signer.address, amount, {
    gasLimit: 200000
  });
  console.log("交易哈希:", tx.hash);
  await tx.wait();
  console.log("✅ 铸造完成");

  // 检查新余额
  const balanceAfter = await usdc.balanceOf(signer.address);
  console.log("新的 USDC 余额:", ethers.utils.formatUnits(balanceAfter, 6));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

