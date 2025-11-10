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
      // 从 Supabase 查询（使用新架构字段）
      let query = supabaseAdmin
        .from('markets')
        .select('*')
        .eq('main_category', category) // 新架构：main_category
        .eq('status', 'active') // 新架构：status = 'active'
        .order('id', { ascending: false }) // 使用 id 排序
        .limit(limit * 2); // 多取一些，用于后续筛选

      const { data, error } = await query;

      if (error) {
        console.error('[CustomProvider] Supabase 错误:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // 转换为标准格式（映射新架构到旧接口）
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.sub_category || '', // sub_category -> category
        categoryType: item.main_category, // main_category -> categoryType（保持兼容）
        probability: 50, // 从实时数据获取
        volume: `$${item.volume || 0}`, // 格式化显示
        volumeNum: parseFloat(item.volume) || 0,
        participants: item.participants || 0,
        endDate: item.end_time ? new Date(item.end_time).toLocaleDateString('zh-CN') : '2025-12-31',
        trend: 'up' as const,
        change: '+0%',
        resolutionCriteria: item.description ? [item.description] : [],
        relatedMarkets: [],
        isActive: true,
        source: 'custom' as const,
        priorityLevel: item.priority_level || 'normal',
        customWeight: 50,
        isHomepage: false,
        isHot: false,
        isTrending: false,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        // 新架构字段
        question_id: item.question_id,
        condition_id: item.condition_id,
        blockchain_status: item.blockchain_status,
        image_url: item.image_url
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

