require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config({ path: ".env.local" });

/**
 * Hardhat 配置 - 用于测试 BSC 上的 Conditional Tokens
 */

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  
  networks: {
    // BSC 测试网
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    
    // BSC 主网
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },
    
    // Polygon Mumbai 测试网（已弃用，改用Amoy）
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/demo",
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
      timeout: 60000, // 60秒超时
    },
    
    // Polygon Amoy 测试网（新的测试网，替代Mumbai）
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 37000000000, // 37 gwei (根据当前网络 Gas 价格)
      timeout: 120000, // 增加到 120 秒
    },
    
    // Polygon 主网
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 50000000000, // 50 gwei
    },
    
    // Optimism Goerli 测试网
    optimismGoerli: {
      url: "https://goerli.optimism.io",
      chainId: 420,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // Optimism 主网
    optimism: {
      url: "https://mainnet.optimism.io",
      chainId: 10,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // 本地 Hardhat 网络
    hardhat: {
      forking: {
        url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
        enabled: process.env.FORK_BSC === "true", // 通过环境变量控制
        blockNumber: undefined, // 使用最新区块
        httpHeaders: {
          // 如果使用付费 RPC，可以在这里添加 API key
          // "Authorization": `Bearer ${process.env.ALCHEMY_API_KEY}`
        }
      },
      chainId: process.env.FORK_BSC === "true" ? 56 : 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      }
    }
  },
  
  mocha: {
    timeout: 60000 // 60 秒超时
  },
  
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

