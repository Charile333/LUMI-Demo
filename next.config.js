/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // 配置路径别名，确保 @ 映射到根目录
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };

    // 确保 webpack 能解析 .ts 和 .tsx 文件
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx', ...config.resolve.extensions];

    // 🔧 添加 fallback 来处理缺失的依赖（抑制警告）
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
      'lokijs': false,
      'encoding': false,
    };

    // 🔇 忽略特定的模块警告
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@walletconnect/ },
    ];

    // 排除admin和test页面在生产环境
    if (process.env.NODE_ENV === 'production') {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /app\/(admin|.*-test|test-.*|simple-test|unified-test)\//,
        use: 'null-loader'
      });
    }
    return config;
  },
  // 排除特定页面不参与构建
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'app/admin/**/*',
        'app/*-test/**/*',
        'app/test-*/**/*'
      ]
    }
  }
}

module.exports = nextConfig