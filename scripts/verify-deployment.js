/**
 * 验证Amoy部署
 * 检查合约是否真的部署在指定地址
 */
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 验证Polygon Amoy部署\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 读取部署信息
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ 未找到部署文件: deployments/amoy.json");
    console.log("请先运行: npx hardhat run scripts/deploy-to-amoy.js --network amoy\n");
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("📄 读取部署信息:");
  console.log("   Network:", deployment.network);
  console.log("   Chain ID:", deployment.chainId);
  console.log("   Deployer:", deployment.deployer);
  console.log("   Timestamp:", deployment.timestamp);
  console.log("");
  
  // 连接到Amoy
  const provider = new hre.ethers.providers.JsonRpcProvider(
    process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"
  );
  
  console.log("🔗 连接到RPC:", provider.connection.url);
  console.log("");
  
  // 验证网络
  try {
    const network = await provider.getNetwork();
    console.log("✅ RPC连接成功");
    console.log("   Chain ID:", network.chainId);
    
    if (network.chainId !== 80002) {
      console.log("❌ 错误：连接到了错误的网络！");
      return;
    }
    console.log("");
  } catch (error) {
    console.log("❌ RPC连接失败:", error.message);
    return;
  }
  
  // 验证CTF合约
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🔍 验证 ConditionalTokens 合约\n");
  
  const ctfAddress = deployment.contracts.conditionalTokens.address;
  console.log("   地址:", ctfAddress);
  
  try {
    const ctfCode = await provider.getCode(ctfAddress);
    
    if (ctfCode === '0x' || ctfCode === '0x0') {
      console.log("   ❌ 合约未部署（地址上没有代码）");
      console.log("");
      console.log("🔧 解决方案：");
      console.log("   需要重新部署合约:");
      console.log("   npx hardhat run scripts/deploy-to-amoy.js --network amoy\n");
    } else {
      console.log("   ✅ 合约已部署");
      console.log("   📊 代码大小:", Math.floor(ctfCode.length / 2), "字节");
      console.log("   🔗 浏览器:", `https://amoy.polygonscan.com/address/${ctfAddress}`);
      console.log("");
    }
  } catch (error) {
    console.log("   ❌ 检查失败:", error.message);
    console.log("");
  }
  
  // 验证Adapter合约
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🔍 验证 UmaCTFAdapter 合约\n");
  
  const adapterAddress = deployment.contracts.umaCTFAdapter.address;
  console.log("   地址:", adapterAddress);
  
  try {
    const adapterCode = await provider.getCode(adapterAddress);
    
    if (adapterCode === '0x' || adapterCode === '0x0') {
      console.log("   ❌ 合约未部署（地址上没有代码）");
      console.log("");
      console.log("🔧 解决方案：");
      console.log("   需要重新部署合约:");
      console.log("   npx hardhat run scripts/deploy-to-amoy.js --network amoy\n");
    } else {
      console.log("   ✅ 合约已部署");
      console.log("   📊 代码大小:", Math.floor(adapterCode.length / 2), "字节");
      console.log("   🔗 浏览器:", `https://amoy.polygonscan.com/address/${adapterAddress}`);
      console.log("");
      
      // 尝试调用getMarketCount
      console.log("   🧪 测试合约功能...");
      
      const ADAPTER_ABI = [
        "function getMarketCount() view returns (uint256)",
        "function ctf() view returns (address)",
        "function oo() view returns (address)"
      ];
      
      const adapter = new hre.ethers.Contract(adapterAddress, ADAPTER_ABI, provider);
      
      try {
        const count = await adapter.getMarketCount();
        console.log("   ✅ getMarketCount() 调用成功");
        console.log("   📊 市场数量:", count.toString());
        
        const ctf = await adapter.ctf();
        console.log("   📍 CTF地址:", ctf);
        
        const oo = await adapter.oo();
        console.log("   📍 Oracle地址:", oo);
        console.log("");
      } catch (error) {
        console.log("   ❌ 合约调用失败:", error.message);
        console.log("");
        console.log("   这可能意味着：");
        console.log("   1. 合约代码与ABI不匹配");
        console.log("   2. 合约初始化有问题");
        console.log("   3. 需要重新部署");
        console.log("");
      }
    }
  } catch (error) {
    console.log("   ❌ 检查失败:", error.message);
    console.log("");
  }
  
  // 检查部署者余额
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("💰 检查部署者账户余额\n");
  
  try {
    const balance = await provider.getBalance(deployment.deployer);
    const balanceInPOL = hre.ethers.utils.formatEther(balance);
    console.log("   地址:", deployment.deployer);
    console.log("   余额:", balanceInPOL, "POL");
    
    if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
      console.log("   ⚠️  余额较低，可能需要充值");
      console.log("   📝 水龙头: https://faucet.polygon.technology/");
    }
    console.log("");
  } catch (error) {
    console.log("   ❌ 检查余额失败:", error.message);
    console.log("");
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ 验证完成\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  });

