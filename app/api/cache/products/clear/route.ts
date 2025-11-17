import { NextRequest, NextResponse } from 'next/server';
import { productCache } from '@/lib/cache/product-cache';
import { CategoryType } from '@/lib/types/market';

/**
 * 清除产品缓存 API
 * POST /api/cache/products/clear
 * 
 * Body:
 * {
 *   type: 'all' | 'category' | 'product',
 *   category?: string,  // type=category 时需要
 *   marketId?: number   // type=product 时需要
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'all', category, marketId } = body;
    
    let message = '';
    
    switch (type) {
      case 'category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: '缺少 category 参数' },
            { status: 400 }
          );
        }
        productCache.clearCategory(category as CategoryType);
        message = `已清除分类 ${category} 的缓存`;
        break;
        
      case 'product':
        if (!marketId) {
          return NextResponse.json(
            { success: false, error: '缺少 marketId 参数' },
            { status: 400 }
          );
        }
        productCache.clearProduct(Number(marketId));
        message = `已清除产品 ${marketId} 的缓存`;
        break;
        
      case 'all':
      default:
        productCache.clearAll();
        message = '已清除所有产品缓存';
        break;
    }
    
    console.log(`🧹 ${message}`);
    
    return NextResponse.json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: '清除缓存失败'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取可清除的缓存类型
 * GET /api/cache/products/clear
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    availableTypes: [
      {
        type: 'all',
        description: '清除所有产品缓存',
        parameters: {}
      },
      {
        type: 'category',
        description: '清除特定分类的缓存',
        parameters: {
          category: 'string (required)'
        }
      },
      {
        type: 'product',
        description: '清除单个产品的缓存',
        parameters: {
          marketId: 'number (required)'
        }
      }
    ],
    example: {
      method: 'POST',
      url: '/api/cache/products/clear',
      body: {
        type: 'category',
        category: 'sports-gaming'
      }
    }
  });
}










