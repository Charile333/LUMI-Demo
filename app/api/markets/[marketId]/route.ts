import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { UpdateMarketRequest } from '@/lib/types/market';
import { globalCache, cacheKeys } from '@/lib/cache/cache-manager';

// GET - 获取单个市场
export async function GET(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    
    // 🚀 检查缓存
    const cacheKey = cacheKeys.market(marketId);
    const cachedData = globalCache.markets.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ 从缓存返回市场 ${marketId} 数据`);
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      });
    }
    
    const { data, error } = await supabaseAdmin
      .from('markets')
      .select('*')
      .eq('id', params.marketId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    // 🚀 保存到缓存（30秒）
    globalCache.markets.set(cacheKey, data, 30000);
    
    return NextResponse.json({
      success: true,
      data: data,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - 更新市场
export async function PUT(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const body: UpdateMarketRequest = await request.json();
    const marketId = parseInt(params.marketId);
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    // 移除 id 字段，不需要更新
    delete (updateData as any).id;
    
    const { data, error } = await supabaseAdmin
      .from('markets')
      .update(updateData)
      .eq('id', params.marketId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 🚀 更新后清除相关缓存
    globalCache.markets.delete(cacheKeys.market(marketId));
    globalCache.stats.deleteByPrefix('batch-stats:');
    console.log(`🧹 已清除市场 ${marketId} 的缓存`);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '市场更新成功',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - 删除市场
export async function DELETE(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    
    const { error } = await supabaseAdmin
      .from('markets')
      .delete()
      .eq('id', params.marketId);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 🚀 删除后清除相关缓存
    globalCache.markets.delete(cacheKeys.market(marketId));
    globalCache.orderbooks.delete(cacheKeys.orderbook(marketId));
    globalCache.stats.deleteByPrefix('batch-stats:');
    console.log(`🧹 已清除市场 ${marketId} 的所有缓存`);
    
    return NextResponse.json({
      success: true,
      message: '市场删除成功',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}



