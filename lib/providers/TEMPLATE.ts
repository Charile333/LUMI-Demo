/**
 * 📝 新数据源 Provider 模板
 * 
 * 复制这个文件创建你自己的 Provider
 * 
 * 步骤：
 * 1. 复制这个文件，重命名为 your-api.ts
 * 2. 修改类名为 YourApiProvider
 * 3. 实现 fetchMarkets() 方法
 * 4. 在 index.ts 中注册
 * 5. 在 config.ts 中配置使用
 */

import { IDataProvider } from './base';
import { Market, CategoryType } from '@/lib/types/market';

export class TemplateProvider implements IDataProvider {
  // Provider 名称（用于标识）
  name = 'your-api';
  
  // 这个 Provider 支持哪些分类
  supportedCategories: CategoryType[] = [
    'tech-ai',
    'sports-gaming',
    'economy-social',
    // ... 根据你的 API 支持的分类添加
  ];
  
  // 默认优先级分数（用于排序）
  // 建议值: 400-600 之间
  defaultPriority = 500;

  // API 基础 URL
  private API_BASE_URL = 'https://api.your-api.com';

  /**
   * 获取市场数据（必须实现）
   * 
   * @param category - 分类类型
   * @param limit - 需要获取的数量
   * @returns Market 数组
   */
  async fetchMarkets(category: CategoryType, limit: number): Promise<Market[]> {
    try {
      console.log(`[YourProvider] 开始获取 ${category} 分类的数据，limit=${limit}`);
      
      // 1️⃣ 映射分类（如果需要）
      const apiCategory = this.mapCategory(category);
      
      // 2️⃣ 构建 API URL
      const url = `${this.API_BASE_URL}/markets?category=${apiCategory}&limit=${limit}`;
      
      // 3️⃣ 调用 API
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // 如果需要 API Key:
          // 'Authorization': `Bearer ${process.env.YOUR_API_KEY}`
        },
        cache: 'no-store', // 不缓存，确保数据新鲜
      });

      // 4️⃣ 检查响应
      if (!response.ok) {
        console.error(`[YourProvider] API 返回错误: ${response.status}`);
        return [];
      }

      // 5️⃣ 解析数据
      const data = await response.json();
      
      // 6️⃣ 转换为标准格式
      const markets = this.transformMarkets(data.markets || data.data || [], category);
      
      console.log(`[YourProvider] 成功获取 ${markets.length} 条数据`);
      return markets;
      
    } catch (error) {
      console.error(`[YourProvider] 获取失败:`, error);
      return []; // 出错时返回空数组，不影响其他数据源
    }
  }

  /**
   * 检查 API 是否可用（必须实现）
   * 
   * @returns 是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      // 调用 API 的健康检查端点
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        cache: 'no-store'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 映射分类到 API 的分类名称
   * （如果你的 API 分类名称和系统不一样）
   */
  private mapCategory(category: CategoryType): string {
    const mapping: Record<string, string> = {
      'tech-ai': 'technology',
      'sports-gaming': 'sports',
      'economy-social': 'economics',
      'entertainment': 'entertainment',
      // ... 根据你的 API 添加映射
    };
    
    return mapping[category] || category;
  }

  /**
   * 转换 API 数据为标准 Market 格式
   * 这是最重要的方法，需要根据你的 API 响应格式调整
   */
  private transformMarkets(rawMarkets: any[], categoryType: CategoryType): Market[] {
    return rawMarkets.map(raw => {
      // 解析各个字段
      // 👇 根据你的 API 响应格式修改字段名
      
      const id = `your-api-${raw.id || raw.market_id}`;
      const title = raw.question || raw.title || raw.name;
      const probability = this.parseProbability(raw.probability || raw.yes_price);
      const volumeNum = this.parseVolume(raw.volume);
      const participants = parseInt(raw.participants || raw.traders || '0');
      
      return {
        // 基础字段
        id: id,
        title: title,
        category: raw.category || 'General',
        categoryType: categoryType,
        
        // 市场数据
        probability: probability,
        volume: this.formatVolume(volumeNum),
        volumeNum: volumeNum,
        participants: participants,
        endDate: this.formatDate(raw.close_date || raw.end_date),
        
        // 趋势
        trend: this.calculateTrend(raw),
        change: this.calculateChange(raw),
        
        // 描述
        description: raw.description || title,
        resolutionCriteria: raw.rules ? [raw.rules] : [],
        relatedMarkets: [],
        
        // 时间戳
        createdAt: raw.created_at || new Date().toISOString(),
        updatedAt: raw.updated_at || new Date().toISOString(),
        
        // 状态
        isActive: true,
        
        // 数据源标识
        source: 'other', // 👈 使用 'other' 或在 Market 类型中添加你的 API 名称
        
        // 优先级（默认普通）
        priorityLevel: 'normal',
        customWeight: 50,
        isHomepage: false,
        isHot: false,
        isTrending: false,
      };
    });
  }

  /**
   * 解析概率
   * 处理不同的概率格式
   */
  private parseProbability(value: any): number {
    if (typeof value === 'number') {
      // 如果是 0-1 之间的小数，转换为百分比
      if (value <= 1) return Math.round(value * 100);
      // 如果已经是百分比
      return Math.round(value);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value.replace('%', ''));
      return Math.round(num);
    }
    return 50; // 默认 50%
  }

  /**
   * 解析成交量
   */
  private parseVolume(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // 移除货币符号和逗号
      return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    }
    return 0;
  }

  /**
   * 格式化成交量为友好显示
   */
  private formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(1)}M`;
    } else if (volume >= 1_000) {
      return `$${(volume / 1_000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  }

  /**
   * 格式化日期
   */
  private formatDate(dateString: string | undefined): string {
    if (!dateString) return 'TBD';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * 计算趋势
   */
  private calculateTrend(raw: any): 'up' | 'down' {
    // 如果 API 提供了价格变化
    if (raw.price_change !== undefined) {
      return parseFloat(raw.price_change) >= 0 ? 'up' : 'down';
    }
    // 如果 API 提供了趋势字段
    if (raw.trend) {
      return raw.trend.toLowerCase() === 'up' ? 'up' : 'down';
    }
    // 默认：根据概率判断
    return (raw.probability || 0.5) > 0.5 ? 'up' : 'down';
  }

  /**
   * 计算变化百分比
   */
  private calculateChange(raw: any): string {
    if (raw.price_change !== undefined) {
      const change = parseFloat(raw.price_change);
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    }
    if (raw.change) {
      return raw.change;
    }
    // 占位符
    return '+0%';
  }
}

/**
 * 使用示例：
 * 
 * 1. 复制这个文件为 kalshi.ts
 * 2. 修改类名为 KalshiProvider
 * 3. 修改 API_BASE_URL
 * 4. 调整 transformMarkets 中的字段映射
 * 5. 在 index.ts 中注册：
 *    import { KalshiProvider } from './kalshi';
 *    providers.kalshi = new KalshiProvider();
 * 6. 在 config.ts 中配置：
 *    'tech-ai': {
 *      providers: ['custom', 'polymarket', 'kalshi'],
 *      quotas: { custom: 12, polymarket: 10, kalshi: 5 },
 *      minCustom: 6
 *    }
 */

