import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { UpdateMarketRequest } from '@/lib/types/market';

// GET - 获取单个市场
export async function GET(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
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
    
    return NextResponse.json({
      success: true,
      data: data,
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



