/**
 * 市场去重器
 */

import { Market } from '@/lib/types/market';

export class Deduplicator {
  
  /**
   * 去除重复的市场
   * 规则：如果两个市场问题相似度>80%，保留优先级高的
   */
  static deduplicate(markets: Market[]): Market[] {
    if (markets.length === 0) return [];
    
    const result: Market[] = [];
    const fingerprints: string[] = [];
    
    for (const market of markets) {
      const fingerprint = this.generateFingerprint(market);
      
      // 检查是否有相似的
      let isDuplicate = false;
      for (let i = 0; i < fingerprints.length; i++) {
        const similarity = this.calculateSimilarity(fingerprint, fingerprints[i]);
        if (similarity > 0.8) {
          isDuplicate = true;
          
          // 如果当前市场优先级更高，替换
          const currentScore = market._priorityScore || 0;
          const existingScore = result[i]._priorityScore || 0;
          
          if (currentScore > existingScore) {
            result[i] = market;
            fingerprints[i] = fingerprint;
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        result.push(market);
        fingerprints.push(fingerprint);
      }
    }
    
    return result;
  }
  
  /**
   * 生成市场指纹（标准化的问题）
   */
  private static generateFingerprint(market: Market): string {
    return market.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // 移除标点
      .replace(/\s+/g, ' ')     // 标准化空格
      .trim();
  }
  
  /**
   * 计算两个字符串的相似度 (0-1)
   * 使用 Jaccard 相似度
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(str2.split(' ').filter(w => w.length > 2));
    
    if (words1.size === 0 && words2.size === 0) return 1;
    if (words1.size === 0 || words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

