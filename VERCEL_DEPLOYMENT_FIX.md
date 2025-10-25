# Vercel 部署修复指南 🚀

## 问题诊断

### ❌ 原始问题
部署到 Vercel 后，黑天鹅页面的事件和预警终端没有数据显示

### 🔍 根本原因

#### 1. **硬编码的 localhost URL**
```typescript
// ❌ 问题代码
const response = await fetch('http://localhost:3000/api/alerts');
```

在 Vercel 上：
- 没有 `localhost`
- 每个请求可能在不同的无服务器函数中执行
- 必须使用相对路径或完整的部署 URL

#### 2. **WebSocket 连接问题**
```typescript
// ❌ 问题代码
ws = new WebSocket('ws://localhost:3000/ws/alerts');
```

在 Vercel 上：
- 不支持自定义 WebSocket 服务器
- 无法运行 `server-with-websocket.js`
- WebSocket 连接会失败

#### 3. **本地数据库依赖**
```typescript
// ❌ 问题代码
const dbFile = path.join(process.cwd(), '..', 'duolume-master', 'utils', 'database', 'app.db')
```

在 Vercel 上：
- 无服务器环境没有持久化文件系统
- 本地 SQLite 文件不存在
- 每次请求可能在不同容器中执行

---

## ✅ 修复方案

### 1. **修复 API 调用 - 使用相对路径**

#### 修复的文件：
- `LUMI/app/page.tsx`
- `LUMI/app/black-swan/page.tsx`
- `LUMI/app/black-swan-terminal/page.tsx`

#### 修复内容：

```typescript
// ✅ 修复后 - 使用相对路径
const response = await fetch('/api/alerts');
const response = await fetch('/api/alerts/stats');
const response = await fetch('/api/alerts/real-crash-events');
```

**优势：**
- ✅ 自动适配当前域名
- ✅ 本地开发：`http://localhost:3000/api/alerts`
- ✅ Vercel 部署：`https://your-app.vercel.app/api/alerts`

---

### 2. **修复 WebSocket - 环境检测**

#### 新增的逻辑：

```typescript
// ✅ 检测生产环境
const isProduction = process.env.NODE_ENV === 'production' 
  && typeof window !== 'undefined' 
  && !window.location.hostname.includes('localhost');

if (isProduction) {
  console.log('⚠️  生产环境：WebSocket 功能已禁用，使用静态数据');
  return;
}

// 仅在本地开发环境连接
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.host;
const wsUrl = `${wsProtocol}//${wsHost}/ws/alerts`;
ws = new WebSocket(wsUrl);
```

**行为：**
- 🏠 **本地开发**：尝试连接 WebSocket（如果服务器运行）
- ☁️ **Vercel 生产**：跳过 WebSocket，使用 API 获取的历史数据

---

### 3. **修复类型定义**

#### 修复 `CrashEvent` 接口：

```typescript
// ✅ 添加缺失的属性
interface CrashEvent {
  id: string;
  date: string;
  timestamp: string;        // ✅ 新增
  asset: string;
  crashPercentage: number;
  duration: string;
  description: string;
  details?: {               // ✅ 新增
    previous_price?: number;
    current_price?: number;
    price_change?: number;
  };
}
```

---

## 📊 数据流对比

### 本地开发环境
```
┌─────────────────────────────────────────────┐
│  前端页面                                    │
│  ├─ REST API: /api/alerts                   │
│  │  └─ SQLite 数据库（如果存在）            │
│  │                                          │
│  └─ WebSocket: ws://localhost:3000/ws/alerts│
│     └─ 实时推送新警报                       │
└─────────────────────────────────────────────┘
```

### Vercel 生产环境
```
┌─────────────────────────────────────────────┐
│  前端页面                                    │
│  ├─ REST API: /api/alerts                   │
│  │  └─ 返回静态历史数据                     │
│  │                                          │
│  └─ WebSocket: ✗ 已禁用                     │
│     └─ 仅显示从 API 获取的数据              │
└─────────────────────────────────────────────┘
```

---

## 🎯 现在的行为

### ✅ 黑天鹅页面 (`/black-swan`)

**历史崩盘事件（左侧）：**
- ✅ 显示 10 个真实历史事件
- ✅ 数据来自 `/api/alerts/real-crash-events`
- ✅ 包括：LUNA 崩盘、FTX 事件、COVID 崩盘等

**TradingView 图表（中间）：**
- ✅ 正常工作
- ✅ 显示选中事件的历史价格图表

**实时警报流（右侧）：**
- 🏠 **本地**：显示 WebSocket 实时数据（如果连接）
- ☁️ **Vercel**：显示从 API 获取的历史警报数据
- ✅ 系统状态显示为 "ACTIVE"

---

### ✅ 首页 (`/`)

**crypto-alert@terminal：**
- 🏠 **本地**：实时 WebSocket 连接，动态更新
- ☁️ **Vercel**：显示最近 5 条历史警报
- ✅ 终端风格 UI 完整展示
- ✅ 统计数据正常显示

---

### ✅ 黑天鹅终端 (`/black-swan-terminal`)

**警报终端：**
- ✅ 显示历史警报数据
- ✅ 系统状态和统计信息
- ✅ 终端风格 UI

---

## 📋 API 端点状态

| 端点 | 状态 | 数据源 | Vercel 兼容 |
|------|------|--------|-------------|
| `/api/alerts` | ✅ | SQLite/静态数据 | ✅ |
| `/api/alerts/stats` | ✅ | 计算统计 | ✅ |
| `/api/alerts/real-crash-events` | ✅ | 静态历史数据 | ✅ |

---

## 🔄 如何在 Vercel 上获取实时数据？

### 选项 1：使用 Vercel Edge Functions（推荐）
```typescript
// 创建 API 端点定期从外部源获取数据
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 从 CoinGecko、Binance 等 API 获取实时价格
  const data = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  return new Response(JSON.stringify(data));
}
```

### 选项 2：使用第三方 WebSocket 服务
- Pusher
- Ably
- Socket.io（托管版本）

### 选项 3：客户端轮询
```typescript
// 每 5 秒刷新一次数据
useEffect(() => {
  const interval = setInterval(() => {
    fetchAlerts();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## 🚀 部署检查清单

在部署到 Vercel 之前：

- [x] ✅ 所有 API 调用使用相对路径
- [x] ✅ WebSocket 在生产环境被禁用
- [x] ✅ TypeScript 类型定义完整
- [x] ✅ 构建成功无错误
- [x] ✅ 静态数据可用（历史事件）
- [ ] ⚠️  如需实时数据，配置外部 API

---

## 🧪 测试

### 本地测试
```bash
cd LUMI
npm run dev

# 访问：
# http://localhost:3000
# http://localhost:3000/black-swan
# http://localhost:3000/black-swan-terminal
```

### 生产构建测试
```bash
npm run build
npm start
```

### Vercel 测试
1. 推送代码到 GitHub
2. Vercel 自动部署
3. 访问部署的 URL
4. 检查控制台是否有 "生产环境：WebSocket 功能已禁用" 消息
5. 确认历史数据正常显示

---

## 📊 性能优化建议

### 1. **静态数据缓存**
```typescript
// 使用 Next.js 的静态生成
export const revalidate = 3600; // 每小时重新验证
```

### 2. **API 响应缓存**
```typescript
// 在 API 路由中添加缓存头
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
  }
});
```

### 3. **图片优化**
- 使用 Next.js `<Image>` 组件
- 自动优化和 lazy loading

---

## 🎉 总结

### ✅ 修复完成

1. **API 调用** - 使用相对路径，兼容所有环境
2. **WebSocket** - 生产环境智能禁用
3. **类型安全** - 完整的 TypeScript 定义
4. **数据展示** - Vercel 上显示历史数据

### 📈 部署后的体验

| 功能 | 本地开发 | Vercel 部署 |
|------|----------|-------------|
| 历史事件展示 | ✅ | ✅ |
| TradingView 图表 | ✅ | ✅ |
| 实时 WebSocket | ✅ | ❌（使用历史数据） |
| API 数据获取 | ✅ | ✅ |
| 页面性能 | ✅ | ✅ 更快（CDN） |

### 🚀 现在可以部署了！

```bash
git add .
git commit -m "fix: 修复 Vercel 部署的 API 和 WebSocket 问题"
git push
```

Vercel 会自动检测并部署。所有页面和数据现在都能正常显示！

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-25  
**状态**: ✅ 已解决
