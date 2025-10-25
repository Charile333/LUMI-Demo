import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Database helper function for stats
async function queryStats() {
  try {
    const sqlite3 = require('sqlite3').verbose()
    const dbFile = path.join(process.cwd(), '..', 'duolume-master', 'utils', 'database', 'app.db')
    
    if (!fs.existsSync(dbFile)) {
      console.log('Alert database not found at:', dbFile)
      return { 
        success: true, 
        data: {
          total_alerts: 0,
          monitored_assets: 2,
          alert_types: {},
          top_symbols: []
        }
      }
    }

    return new Promise((resolve) => {
      const db = new sqlite3.Database(dbFile, (err: any) => {
        if (err) {
          console.error('Database connection error:', err)
          resolve({ 
            success: true, 
            data: {
              total_alerts: 0,
              monitored_assets: 2,
              alert_types: {},
              top_symbols: []
            }
          })
          return
        }

        // Query alert type statistics
        db.all('SELECT type, COUNT(*) as count FROM alerts GROUP BY type', (err: any, typeStats: any[]) => {
          if (err) {
            db.close()
            resolve({ 
              success: true, 
              data: {
                total_alerts: 0,
                monitored_assets: 2,
                alert_types: {},
                top_symbols: []
              }
            })
            return
          }

          const alertTypes: Record<string, number> = {}
          let totalAlerts = 0
          typeStats.forEach(item => {
            alertTypes[item.type] = item.count
            totalAlerts += item.count
          })

          // Query top symbols with most alerts
          db.all('SELECT symbol, COUNT(*) as count FROM alerts GROUP BY symbol ORDER BY count DESC LIMIT 10', (symbolErr: any, topSymbols: any[]) => {
            // Query count of unique monitored symbols
            db.get('SELECT COUNT(DISTINCT symbol) as count FROM alerts', (monitorErr: any, monitorRow: any) => {
              db.close()

              const monitoredAssets = monitorRow?.count || 2

              resolve({
                success: true,
                data: {
                  total_alerts: totalAlerts,
                  monitored_assets: monitoredAssets,
                  alert_types: alertTypes,
                  top_symbols: topSymbols || []
                }
              })
            })
          })
        })
      })
    })
  } catch (error) {
    console.error('Error querying stats:', error)
    return { 
      success: true, 
      data: {
        total_alerts: 0,
        monitored_assets: 2,
        alert_types: {},
        top_symbols: []
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const result = await queryStats()
  return NextResponse.json(result)
}

