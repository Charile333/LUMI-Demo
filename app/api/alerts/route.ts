import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Database helper function
async function queryAlerts() {
  try {
    // Dynamic import of sqlite3 to avoid build issues
    const sqlite3 = require('sqlite3').verbose()
    
    // Try to find the database file
    const dbFile = path.join(process.cwd(), '..', 'duolume-master', 'utils', 'database', 'app.db')
    
    if (!fs.existsSync(dbFile)) {
      console.log('Alert database not found at:', dbFile)
      return { success: true, data: [] }
    }

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbFile, (err: any) => {
        if (err) {
          console.error('Database connection error:', err)
          resolve({ success: true, data: [] })
          return
        }

        db.all('SELECT * FROM alerts WHERE symbol IN ("BTCUSDT", "ETHUSDT") ORDER BY timestamp DESC LIMIT 20', (err: any, rows: any[]) => {
          db.close()

          if (err) {
            console.error('Database query error:', err)
            resolve({ success: true, data: [] })
            return
          }

          const formattedAlerts = rows.map(row => {
            let details = null
            if (row.details) {
              try {
                details = JSON.parse(row.details)
              } catch (e) {
                console.error('Error parsing details:', e)
              }
            }

            return {
              symbol: row.symbol,
              type: row.type,
              message: row.message,
              timestamp: row.timestamp,
              details: details
            }
          })

          resolve({ success: true, data: formattedAlerts })
        })
      })
    })
  } catch (error) {
    console.error('Error querying alerts:', error)
    return { success: true, data: [] }
  }
}

export async function GET(request: NextRequest) {
  const result = await queryAlerts()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, just return success - you can implement alert creation later
    return NextResponse.json({
      success: true,
      message: 'Alert creation not yet implemented'
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

