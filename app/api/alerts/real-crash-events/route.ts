import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Database helper function to query historical crashes
async function queryHistoricalCrashes() {
  try {
    // Dynamic import of sqlite3 to avoid build issues
    const sqlite3 = require('sqlite3').verbose()
    
    // Try to find the database file
    const dbFile = path.join(process.cwd(), 'database', 'alerts.db')
    
    if (!fs.existsSync(dbFile)) {
      console.log('Historical crash database not found at:', dbFile)
      return { success: true, data: [] }
    }

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbFile, (err: any) => {
        if (err) {
          console.error('Database connection error:', err)
          resolve({ success: true, data: [] })
          return
        }

        // Query for historical crash events
        db.all(
          'SELECT * FROM alerts WHERE type = "historical_crash" ORDER BY timestamp DESC',
          (err: any, rows: any[]) => {
            db.close()

            if (err) {
              console.error('Database query error:', err)
              resolve({ success: true, data: [] })
              return
            }

            // Format the data to match the expected structure
            const formattedEvents = rows.map((row, index) => {
              let details = null
              if (row.details) {
                try {
                  details = JSON.parse(row.details)
                } catch (e) {
                  console.error('Error parsing details:', e)
                }
              }

              // Calculate crash percentage from details
              // Handle both formats: decimal (-0.158) and percentage (-15.8)
              let crashPercentage = 0
              if (details?.price_change !== undefined) {
                // If absolute value < 1, it's decimal format (e.g., -0.158 = -15.8%)
                // If absolute value >= 1, it's percentage format (e.g., -15.8 = -15.8%)
                if (Math.abs(details.price_change) < 1) {
                  crashPercentage = parseFloat((details.price_change * 100).toFixed(2))
                } else {
                  crashPercentage = parseFloat(details.price_change.toFixed(2))
                }
              }

              // Extract date from timestamp
              const date = row.timestamp ? row.timestamp.split('T')[0] : 'Unknown'

              // Format asset symbol
              const asset = row.symbol ? row.symbol.replace('USDT', '/USDT') : 'Unknown'

              // Calculate duration from details
              const duration = details?.duration_hours 
                ? `${details.duration_hours} hours` 
                : 'Unknown'

              // Get peak and bottom prices (try multiple field names for compatibility)
              const peakPrice = details?.peak_price || details?.previous_price || 0
              const bottomPrice = details?.bottom_price || details?.current_price || 0
              
              // Calculate price_change in decimal format for details (-0.45 for -45%)
              let priceChangeDecimal = 0
              if (details?.price_change !== undefined) {
                // If already in decimal format, use as is
                // If in percentage format, convert to decimal
                if (Math.abs(details.price_change) < 1) {
                  priceChangeDecimal = details.price_change
                } else {
                  priceChangeDecimal = details.price_change / 100
                }
              }

              return {
                id: `crash-${index + 1}`,
                date: date,
                timestamp: row.timestamp,
                asset: asset,
                crashPercentage: crashPercentage,
                duration: duration,
                description: row.message,
                details: {
                  previous_price: peakPrice,
                  current_price: bottomPrice,
                  price_change: priceChangeDecimal,
                  volume_change: details?.volume_change || details?.volume_spike || 0
                }
              }
            })

            resolve({ success: true, data: formattedEvents })
          }
        )
      })
    })
  } catch (error) {
    console.error('Error querying historical crashes:', error)
    return { success: true, data: [] }
  }
}

export async function GET(request: NextRequest) {
  // Get language from query parameter or accept-language header
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'zh'
  
  const result = await queryHistoricalCrashes()
  
  // If successful, translate descriptions based on language
  if (result.success && result.data) {
    result.data = result.data.map((event: any) => {
      // Try to get description from details object based on language
      let description = event.description
      
      if (event.details && typeof event.details === 'object') {
        if (lang === 'en' && event.details.description_en) {
          description = event.details.description_en
        } else if (lang === 'zh' && event.details.description_zh) {
          description = event.details.description_zh
        }
      }
      
      return {
        ...event,
        description
      }
    })
  }
  
  return NextResponse.json(result)
}

