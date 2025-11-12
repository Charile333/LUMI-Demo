/**
 * 获取订单签名 API
 * 用于链上执行时获取 Maker 的订单签名
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '无效的订单ID' },
        { status: 400 }
      );
    }

    // 获取订单信息
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, user_address, ctf_signature')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 返回签名（如果有）
    return NextResponse.json({
      success: true,
      signature: order.ctf_signature || null,
      maker: order.user_address,
      hasSignature: !!order.ctf_signature
    });

  } catch (error: any) {
    console.error('获取订单签名失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取签名失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '无效的订单ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const signature = body.signature as string | undefined;

    if (!signature) {
      return NextResponse.json(
        { success: false, error: '缺少签名' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        ctf_signature: signature,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('保存订单签名失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '保存签名失败' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

