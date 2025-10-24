import { NextResponse } from 'next/server';

// 最简单的测试API端点
export async function GET(request: Request) {
  try {
    console.log('测试API请求开始');
    
    // 返回简单的模拟数据
    const testData = {
      message: '测试API正常工作',
      status: 'success',
      data: [1, 2, 3, 4, 5]
    };
    
    return NextResponse.json(testData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('测试API错误:', error);
    return NextResponse.json(
      { error: '测试API失败', message: String(error) },
      { status: 500 }
    );
  }
}