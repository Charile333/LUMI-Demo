/**
 * 本地部署 Conditional Tokens 合约的辅助函数
 * 在测试前自动部署
 */

const { ethers } = require("hardhat");

async function deployConditionalTokens() {
  const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
  const conditionalTokens = await ConditionalTokens.deploy();
  await conditionalTokens.deployed();
  
  console.log("✅ ConditionalTokens 部署成功:", conditionalTokens.address);
  
  return conditionalTokens;
}

module.exports = { deployConditionalTokens };


















