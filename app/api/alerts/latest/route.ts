import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { queryAlerts } from '@/lib/supabase-client'

/**
 * 获取最新的实时警报
 * Vercel 兼容版本 - 优先使用 Supabase，回退到本地数据库
 */
export async function GET(request: NextRequest) {
  // 优先尝试 Supabase
  try {
    const supabaseData = await queryAlerts(20);
    if (supabaseData && supabaseData.length > 0) {
      const formattedAlerts = supabaseData.map((row: any) => ({
        id: row.id,
        symbol: row.symbol,
        type: row.type,
        message: row.message,
        timestamp: row.timestamp,
        severity: row.severity || 'medium',
        details: row.details
      }));
      
      return NextResponse.json({
        success: true,
        data: formattedAlerts,
        source: 'supabase',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.log('Supabase 不可用，尝试本地数据库');
  }
  
  // 回退到本地 SQLite
  try {
    const sqlite3 = require('sqlite3').verbose()
    
    // 尝试多个可能的数据库位置
    const possiblePaths = [
      path.join(process.cwd(), 'database', 'alerts.db'),
      path.join(process.cwd(), '..', 'duolume-master', 'utils', 'database', 'app.db'),
      '/tmp/alerts.db' // Vercel 临时存储
    ]
    
    let dbFile = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dbFile = p
        break
      }
    }
    
    if (!dbFile) {
      // 如果找不到数据库，返回空数组而不是错误
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No database found'
      })
    }

    return new Promise((resolve) => {
      const db = new sqlite3.Database(dbFile, (err: any) => {
        if (err) {
          resolve(NextResponse.json({
            success: true,
            data: [],
            error: err.message
          }))
          return
        }

        // 获取最近5分钟的实时警报（排除历史事件）
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        
        db.all(
          `SELECT * FROM alerts 
           WHERE type != 'historical_crash' 
             AND timestamp > ?
           ORDER BY id DESC 
           LIMIT 20`,
          [fiveMinutesAgo],
          (err: any, rows: any[]) => {
            db.close()

            if (err) {
              resolve(NextResponse.json({
                success: true,
                data: [],
                error: err.message
              }))
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
                id: row.id,
                symbol: row.symbol,
                type: row.type,
                message: row.message,
                timestamp: row.timestamp,
                severity: row.severity || 'medium',
                details: details
              }
            })

            resolve(NextResponse.json({
              success: true,
              data: formattedAlerts,
              timestamp: new Date().toISOString()
            }))
          }
        )
      })
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: [],
      error: error.message
    })
  }
}

// 启用边缘运行时以获得更好的性能（可选）
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

