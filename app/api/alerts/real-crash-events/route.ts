import { NextRequest, NextResponse } from 'next/server'

// Real historical crash events data
const crashEvents = [
  {
    id: 'crash-1',
    date: '2022-05-12',
    timestamp: '2022-05-12T00:00:00Z',
    asset: 'LUNA/USDT',
    crashPercentage: -99.9,
    duration: '3 days',
    description: 'Terra Luna collapse - algorithmic stablecoin failure',
    details: {
      previous_price: 85.0,
      current_price: 0.0001,
      price_change: -0.999
    }
  },
  {
    id: 'crash-2',
    date: '2022-11-08',
    timestamp: '2022-11-08T12:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -25.4,
    duration: '12 hours',
    description: 'FTX exchange collapse - massive liquidity crisis',
    details: {
      previous_price: 21000,
      current_price: 15600,
      price_change: -0.254
    }
  },
  {
    id: 'crash-3',
    date: '2021-05-19',
    timestamp: '2021-05-19T10:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -30.2,
    duration: '6 hours',
    description: 'China mining ban announcement',
    details: {
      previous_price: 43500,
      current_price: 30300,
      price_change: -0.302
    }
  },
  {
    id: 'crash-4',
    date: '2020-03-12',
    timestamp: '2020-03-12T18:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -50.5,
    duration: '2 days',
    description: 'COVID-19 pandemic market crash',
    details: {
      previous_price: 7900,
      current_price: 3900,
      price_change: -0.505
    }
  },
  {
    id: 'crash-5',
    date: '2018-11-14',
    timestamp: '2018-11-14T08:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -15.8,
    duration: '4 hours',
    description: 'Hash war - BCH hard fork conflict',
    details: {
      previous_price: 6400,
      current_price: 5400,
      price_change: -0.158
    }
  },
  {
    id: 'crash-6',
    date: '2017-09-14',
    timestamp: '2017-09-14T14:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -40.2,
    duration: '1 day',
    description: 'China exchange ban announcement',
    details: {
      previous_price: 4300,
      current_price: 2570,
      price_change: -0.402
    }
  },
  {
    id: 'crash-7',
    date: '2013-04-10',
    timestamp: '2013-04-10T12:00:00Z',
    asset: 'BTC/USD',
    crashPercentage: -61.4,
    duration: '3 hours',
    description: 'Mt.Gox trading lag and panic sell-off',
    details: {
      previous_price: 266,
      current_price: 105,
      price_change: -0.614
    }
  },
  {
    id: 'crash-8',
    date: '2021-12-04',
    timestamp: '2021-12-04T16:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -20.5,
    duration: '8 hours',
    description: 'Omicron variant concerns and risk-off sentiment',
    details: {
      previous_price: 57000,
      current_price: 45300,
      price_change: -0.205
    }
  },
  {
    id: 'crash-9',
    date: '2019-09-24',
    timestamp: '2019-09-24T09:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -15.2,
    duration: '5 hours',
    description: 'BitMEX CEO indictment concerns',
    details: {
      previous_price: 10100,
      current_price: 8550,
      price_change: -0.152
    }
  },
  {
    id: 'crash-10',
    date: '2021-01-11',
    timestamp: '2021-01-11T03:00:00Z',
    asset: 'BTC/USDT',
    crashPercentage: -23.8,
    duration: '10 hours',
    description: 'Regulatory concerns and overheated market correction',
    details: {
      previous_price: 40800,
      current_price: 31100,
      price_change: -0.238
    }
  }
]

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: crashEvents
  })
}

