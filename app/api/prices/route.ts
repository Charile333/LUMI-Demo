import { NextRequest, NextResponse } from 'next/server'

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    const url = symbol 
      ? `${FLASK_API_URL}/api/prices?symbol=${symbol}`
      : `${FLASK_API_URL}/api/prices`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prices from backend' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    // Flask backend is not running - this is OK
    // console.error('Flask backend not available:', error)
    return NextResponse.json(
      { success: true, data: [], message: 'Flask backend not running' },
      { status: 200 }
    )
  }
}

