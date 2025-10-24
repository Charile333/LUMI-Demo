/**
 * 所有数据提供者的索引
 * 
 * 🎯 在这里注册所有的数据源 Provider
 * 
 * 添加新数据源的步骤：
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1️⃣ 创建 Provider 文件
 *    位置: lib/providers/你的api名.ts
 *    参考: polymarket.ts 的实现
 * 
 * 2️⃣ 在这里 import 并注册
 *    import { YourProvider } from './your-api';
 *    providers.your-api = new YourProvider();
 * 
 * 3️⃣ 在 config.ts 中配置使用
 *    打开 lib/aggregator/config.ts
 *    在对应分类的 providers 数组中添加 'your-api'
 *    设置 quotas
 * 
 * 4️⃣ 测试
 *    访问 /unified-test 查看效果
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 详细文档参考: ADD_API_EXAMPLE.md
 */

import { IDataProvider } from './base';
import { CustomProvider } from './custom';
import { PolymarketProvider } from './polymarket';
import { blockchainProvider } from './blockchain';

// 📌 已注册的数据源
export const providers: Record<string, IDataProvider> = {
  custom: new CustomProvider(),           // 自定义数据（Supabase）
  polymarket: new PolymarketProvider(),   // Polymarket API
  blockchain: blockchainProvider,         // 区块链市场（链上数据） 🆕
  
  // ↓↓↓ 在这里添加新的数据源 ↓↓↓
  // 示例:
  // kalshi: new KalshiProvider(),
  // metaculus: new MetaculusProvider(),
  // manifold: new ManifoldProvider(),
  // ↑↑↑ 在这里添加新的数据源 ↑↑↑
};

// 导出接口和类
export type { IDataProvider } from './base';
export { CustomProvider } from './custom';
export { PolymarketProvider } from './polymarket';

