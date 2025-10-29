/**
 * 自定义数据提供者（Supabase）
 */

import { IDataProvider } from './base';
import { Market, CategoryType } from '@/lib/types/market';
import { supabaseAdmin } from '@/lib/supabase-client';

export class CustomProvider implements IDataProvider {
  name = 'custom';
  supportedCategories: CategoryType[] = [
    'automotive',
    'tech-ai',
    'entertainment',
    'smart-devices',
    'sports-gaming',
    'economy-social',
    'emerging'
  ];
  defaultPriority = 800;

  async fetchMarkets(category: CategoryType, limit: number): Promise<Market[]> {
    try {
      // 从 Supabase 查询
      let query = supabaseAdmin
        .from('markets')
        .select('*')
        .eq('categoryType', category)
        .eq('isActive', true)
        .order('createdAt', { ascending: false })
        .limit(limit * 2); // 多取一些，用于后续筛选

      const { data, error } = await query;

      if (error) {
        console.error('[CustomProvider] Supabase 错误:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // 转换为标准格式
      return data.map(item => ({
        ...item,
        source: 'custom' as const,
        volumeNum: this.parseVolume(item.volume),
        // 确保优先级字段存在
        priorityLevel: item.priorityLevel || 'normal',
        customWeight: item.customWeight || 50,
        isHomepage: item.isHomepage || false,
        isHot: item.isHot || false,
        isTrending: item.isTrending || false
      }));

    } catch (error) {
      console.error('[CustomProvider] 获取数据失败:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // 简单检查 Supabase 连接
      const { error } = await supabaseAdmin
        .from('markets')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  private parseVolume(volume?: string): number {
    if (!volume) return 0;
    
    // 解析 "$1.2M" -> 1200000
    const match = volume.match(/\$([\d.]+)([KMB])?/i);
    if (!match) return 0;
    
    const num = parseFloat(match[1]);
    const unit = match[2]?.toUpperCase();
    
    const multipliers: Record<string, number> = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000
    };
    
    return num * (multipliers[unit || ''] || 1);
  }
}

