/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
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