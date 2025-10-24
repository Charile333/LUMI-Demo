import { NextResponse } from 'next/server';

/**
 * 测试 Polymarket API
 * 尝试多个 endpoint 获取真实的预测市场数据
 */
export async function GET() {
  const testResults: any[] = [];
  
  // 尝试多个 Polymarket API endpoints
  const endpoints = [
    {
      name: 'CLOB Markets API',
      url: 'https://clob.polymarket.com/markets',
      params: ''
    },
    {
      name: 'Gamma Markets API', 
      url: 'https://gamma-api.polymarket.com/markets',
      params: '?limit=10&active=true'
    },
    {
      name: 'Strapi API',
      url: 'https://strapi-matic.poly.market/markets',
      params: '?_limit=10'
    },
    {
      name: 'CLOB Sampling Markets',
      url: 'https://clob.polymarket.com/sampling-markets',
      params: '?next_cursor=MA=='
    }
  ];

  // 测试每个 endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`测试 ${endpoint.name}: ${endpoint.url}${endpoint.params}`);
      
      const response = await fetch(`${endpoint.url}${endpoint.params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const status = response.status;
      const statusText = response.statusText;
      
      let data = null;
      let parseError = null;
      
      try {
        data = await response.json();
      } catch (e) {
        parseError = '无法解析 JSON 响应';
      }

      testResults.push({
        endpoint: endpoint.name,
        url: `${endpoint.url}${endpoint.params}`,
        status,
        statusText,
        success: response.ok,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataCount: Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0),
        parseError,
        sample: data ? (Array.isArray(data) ? data[0] : data) : null
      });

    } catch (error) {
      testResults.push({
        endpoint: endpoint.name,
        url: `${endpoint.url}${endpoint.params}`,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // 找到第一个成功的 endpoint
  const successfulTest = testResults.find(test => test.success && test.dataCount > 0);

  if (successfulTest) {
    return NextResponse.json({
      success: true,
      message: `成功从 ${successfulTest.endpoint} 获取数据`,
      recommendedEndpoint: successfulTest.url,
      timestamp: new Date().toISOString(),
      allTests: testResults,
      bestResult: successfulTest
    });
  }

  // 如果都失败了，返回所有测试结果
  return NextResponse.json({
    success: false,
    message: '所有 endpoint 测试均未成功获取数据',
    timestamp: new Date().toISOString(),
    allTests: testResults,
    suggestion: '可能需要 API key 或者 Polymarket API 已更改'
  });
}

