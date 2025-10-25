# WebSocket Connection Fix - Complete ✅

## What Was Fixed

The WebSocket connection error `WebSocket connection to 'ws://localhost:3000/ws/alerts' failed` has been resolved by:

1. **Integrated Alert WebSocket**: Added native WebSocket support at `/ws/alerts` endpoint to the Next.js server
2. **Created API Routes**: Added missing API endpoints for alert data
3. **Database Integration**: Connected to the SQLite alert database
4. **Updated Default Script**: Changed the default dev script to use the WebSocket-enabled server

## Changes Made

### 1. Server (`server-with-websocket.js`)
- ✅ Added native WebSocket server for `/ws/alerts` endpoint
- ✅ Integrated Socket.IO (for markets) and native WebSocket (for alerts) on same port
- ✅ Added database watcher to broadcast new alerts in real-time
- ✅ Proper upgrade handler to route WebSocket connections

### 2. API Routes
- ✅ `/api/alerts` - Fetch recent alerts from database
- ✅ `/api/alerts/stats` - Get alert statistics
- ✅ `/api/alerts/real-crash-events` - Get historical crash events

### 3. Package Configuration
- ✅ Updated default `npm run dev` to use WebSocket server
- ✅ Dependencies `ws` and `sqlite3` already installed

## How to Start the Server

### Option 1: Using npm (Recommended)
```bash
cd LUMI
npm run dev
```

### Option 2: Using Node directly
```bash
cd LUMI
node server-with-websocket.js
```

## Verify It's Working

Once the server starts, you should see:
```
============================================================
🚀 服务器已启动
📍 地址: http://localhost:3000
🔌 Socket.IO: ws://localhost:3000
🦢 Alert WebSocket: ws://localhost:3000/ws/alerts
🌍 环境: development
============================================================
```

## Testing the WebSocket Connection

1. **Open the Black Swan page**: http://localhost:3000/black-swan
2. **Check browser console**: You should see `✅ 已连接到预警系统`
3. **Watch for alerts**: Real-time alerts will appear in the right panel

## If Database is Not Found

If you see: `⚠️  警报数据库未找到，跳过数据库监视器`

This is **normal** if the alert database hasn't been set up yet. The WebSocket will still work, but won't broadcast database alerts. You can:

1. **Set up the alert database** by running the duolume alert server first:
   ```bash
   cd duolume-master
   node alert_server.js
   ```
   This creates the database at `duolume-master/utils/database/app.db`

2. **Or use mock data**: The frontend will still work with the historical crash events from the API

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js App (Port 3000)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HTTP Server                                            │
│    ├─ Next.js pages & API routes                       │
│    ├─ /api/alerts (REST)                               │
│    ├─ /api/alerts/stats (REST)                         │
│    └─ /api/alerts/real-crash-events (REST)            │
│                                                         │
│  WebSocket Servers (on same port)                      │
│    ├─ Socket.IO (for market data)                      │
│    └─ Native WS at /ws/alerts (for Black Swan alerts) │
│                                                         │
│  Database Integration                                   │
│    └─ SQLite watcher → broadcasts new alerts          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:
```bash
# On Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change the port
$env:PORT=3001
npm run dev
```

### WebSocket Still Not Connecting
1. Make sure you're running the **WebSocket-enabled server**: `npm run dev` (not `npm run dev:next`)
2. Check that port 3000 is accessible
3. Clear browser cache and reload
4. Check browser console for detailed error messages

## Testing Alert Broadcasting

To manually trigger a test alert (if database is set up):
```bash
# In duolume-master directory
curl http://localhost:3002/api/trigger-test-alert
```

## Next Steps

- ✅ WebSocket connection working
- ✅ API endpoints responding
- 🔄 Optional: Set up alert database for real-time alerts
- 🔄 Optional: Configure alert detection scripts

---

**Status**: ✅ WebSocket connection fixed and ready to use!

