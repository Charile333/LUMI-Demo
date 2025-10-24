import { NextResponse } from 'next/server';

/**
 * 分析 Polymarket 的实际分类分布
 */
export async function GET() {
  try {
    const response = await fetch('https://gamma-api.polymarket.com/markets?limit=100&active=true', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API 返回错误: ${response.status}`);
    }

    const markets = await response.json();
    
    // 统计分类
    const categoryStats: Record<string, number> = {};
    const tagStats: Record<string, number> = {};
    const sampleByCategory: Record<string, any[]> = {};

    markets.forEach((market: any) => {
      // 统计主分类
      const category = market.category || 'Uncategorized';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      // 保存每个分类的示例
      if (!sampleByCategory[category]) {
        sampleByCategory[category] = [];
      }
      if (sampleByCategory[category].length < 3) {
        sampleByCategory[category].push({
          question: market.question,
          tags: market.tags
        });
      }

      // 统计标签
      if (market.tags && Array.isArray(market.tags)) {
        market.tags.forEach((tag: string) => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });

    // 排序
    const sortedCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / markets.length) * 100).toFixed(1) + '%',
        samples: sampleByCategory[category]
      }));

    const sortedTags = Object.entries(tagStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: ((count / markets.length) * 100).toFixed(1) + '%'
      }));

    return NextResponse.json({
      success: true,
      totalMarkets: markets.length,
      categories: sortedCategories,
      topTags: sortedTags,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

