/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 🚀 性能优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 压缩配置
  compress: true,
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
  
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

    return config;
  },
  // 排除特定页面不参与构建（保留测试页面，admin 页面现在参与构建）
  // experimental: {
  //   outputFileTracingExcludes: {
  //     '*': [
  //       'app/admin/**/*', // ❌ 已移除，让管理页面参与构建
  //       'app/*-test/**/*',
  //       'app/test-*/**/*'
  //     ]
  //   }
  // }
}

module.exports = nextConfig