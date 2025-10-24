# 🔌 WebSocket 实时通知集成指南

## 🎯 功能概述

实时通知系统，让用户立即知道市场状态变化：
- ⭐ 感兴趣用户更新（实时计数）
- 🚀 市场开始激活（倒计时）
- ✅ 市场激活成功（自动刷新）
- ❌ 激活失败（错误提示）

---

## 📦 新增文件

### 1. WebSocket 服务端
- `lib/websocket/market-events.ts` - WebSocket 事件广播
- `lib/websocket/server.ts` - 服务器实例管理
- `server-with-websocket.js` - 支持 WebSocket 的自定义服务器

### 2. React 组件
- `components/MarketActivationStatus.tsx` - 激活状态显示（带倒计时）
- `components/TradeButton.tsx` - 交易按钮（支持自动激活）
- `components/InterestedButton.tsx` - 感兴趣按钮
- `components/MarketCard.tsx` - 完整市场卡片

### 3. React Hook
- `hooks/useMarketWebSocket.ts` - WebSocket Hook

---

## ⚡ 快速开始

### 1. 安装依赖

```bash
npm install socket.io socket.io-client
```

### 2. 启动 WebSocket 服务器

```bash
# 方式 1：使用 WebSocket 服务器
npm run dev:ws

# 方式 2：分别启动（推荐用于开发）
# 终端 1: Next.js
npm run dev

# 终端 2: WebSocket（如果需要独立运行）
# 注意：现在 dev:ws 已经集成了 Next.js 和 WebSocket
```

### 3. 使用组件

```tsx
// app/markets/page.tsx

import { MarketCard } from '@/components/MarketCard';

export default function MarketsPage() {
  const markets = [...]; // 从 API 获取市场列表

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map(market => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
```

---

## 🎨 组件使用示例

### MarketCard（完整市场卡片）

```tsx
import { MarketCard } from '@/components/MarketCard';

<MarketCard
  market={{
    id: 1,
    title: "特斯拉 Q4 交付量会超过 50 万吗？",
    description: "预测特斯拉 2024 年 Q4 全球交付量",
    blockchain_status: "not_created", // 或 "created", "creating"
    interested_users: 3,
    views: 120,
    activity_score: 65,
    main_category: "automotive",
    priority_level: "recommended"
  }}
/>
```

### MarketActivationStatus（激活状态）

```tsx
import { MarketActivationStatus } from '@/components/MarketActivationStatus';

<MarketActivationStatus
  market={{
    id: 1,
    title: "市场标题",
    blockchain_status: "not_created",
    interested_users: 3
  }}
  onActivated={(conditionId) => {
    console.log('市场已激活:', conditionId);
    // 刷新页面或更新状态
  }}
/>
```

### TradeButton（交易按钮）

```tsx
import { TradeButton } from '@/components/TradeButton';

<TradeButton
  market={{
    id: 1,
    title: "市场标题",
    blockchain_status: "not_created",
    condition_id: "0xabc..."
  }}
/>
```

### InterestedButton（感兴趣按钮）

```tsx
import { InterestedButton } from '@/components/InterestedButton';

<InterestedButton
  market={{
    id: 1,
    title: "市场标题",
    interested_users: 3
  }}
  onUpdate={(newCount) => {
    console.log('新的感兴趣人数:', newCount);
  }}
/>
```

---

## 🔔 WebSocket 事件

### 服务端事件

```typescript
// 感兴趣更新
broadcastInterestedUpdate(marketId, {
  interestedUsers: 4,
  threshold: 5,
  progress: 80
});

// 市场激活中
broadcastMarketActivating(marketId, {
  title: "市场标题",
  interestedUsers: 5,
  threshold: 5
});

// 市场已激活
broadcastMarketActivated(marketId, {
  title: "市场标题",
  conditionId: "0xabc...",
  txHash: "0x123..."
});

// 激活失败
broadcastActivationFailed(marketId, "错误信息");
```

### 客户端监听

```typescript
import { useMarketWebSocket } from '@/hooks/useMarketWebSocket';

function MyComponent({ marketId }: { marketId: number }) {
  const { socket, isConnected, events } = useMarketWebSocket(marketId);

  useEffect(() => {
    if (events.activated) {
      console.log('市场已激活!', events.activated);
      // 刷新页面或显示通知
    }
  }, [events.activated]);

  return (
    <div>
      {isConnected ? '✅ 已连接' : '❌ 未连接'}
    </div>
  );
}
```

---

## 📊 完整用户流程

### 场景 1：用户 A 标记感兴趣

```
用户 A 点击"感兴趣" (第 3 个)
  ↓
API: POST /api/markets/1/interested
  ↓
数据库: interested_users = 3
  ↓
WebSocket 广播: market:interested:update
  ↓
所有订阅用户实时看到: "3/5 人感兴趣"
  ↓
进度条更新: 60%
```

### 场景 2：达到激活阈值

```
用户 E 点击"感兴趣" (第 5 个)
  ↓
数据库: interested_users = 5
  ↓
WebSocket 广播: "达到激活条件！"
  ↓
1 分钟后，定时任务运行
  ↓
开始激活市场
  ↓
WebSocket 广播: market:activating
  ↓
所有用户看到倒计时: 30, 29, 28...
  ↓
激活完成
  ↓
WebSocket 广播: market:activated
  ↓
所有用户看到: "✅ 市场已激活！"
  ↓
"交易"按钮变为可用
```

### 场景 3：用户主动激活

```
用户点击"激活并交易"
  ↓
显示确认对话框
  ↓
用户确认
  ↓
调用 API: POST /api/admin/markets/1/activate
  ↓
WebSocket 广播: market:activating
  ↓
显示倒计时: 30秒
  ↓
链上交易确认
  ↓
WebSocket 广播: market:activated
  ↓
跳转到交易页面
```

---

## 🎨 UI 效果展示

### 未激活状态

```
┌────────────────────────────────────┐
│ 🌟 特斯拉 Q4 交付量预测             │
│ 预测特斯拉 2024 年 Q4 全球交付量   │
│                                    │
│ 👁️ 120 浏览  ⭐ 3 感兴趣  📊 65   │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 市场尚未激活                    │ │
│ │ 需要 5 人感兴趣                 │ │
│ │                                │ │
│ │ 3 人已感兴趣    还需 2 人       │ │
│ │ [████████████░░░░░░░] 60%     │ │
│ │                                │ │
│ │ 💡 点击"我感兴趣"加速激活       │ │
│ └────────────────────────────────┘ │
│                                    │
│ [  ⭐ 我对这个市场感兴趣  ]        │
│ [  🚀 激活并交易  ]                │
└────────────────────────────────────┘
```

### 激活中状态

```
┌────────────────────────────────────┐
│ 🌟 特斯拉 Q4 交付量预测             │
│ 预测特斯拉 2024 年 Q4 全球交付量   │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🔄 正在激活市场...              │ │
│ │                                │ │
│ │ 预计剩余时间: 23 秒             │ │
│ │ [████████████████░░░░] 60%     │ │
│ └────────────────────────────────┘ │
│                                    │
│ [ ⏳ 激活中... (23秒) ]            │
└────────────────────────────────────┘
```

### 已激活状态

```
┌────────────────────────────────────┐
│ 🌟 特斯拉 Q4 交付量预测             │
│ 预测特斯拉 2024 年 Q4 全球交付量   │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ✓ 市场已激活                   │ │
│ │ 可以开始交易了！                │ │
│ └────────────────────────────────┘ │
│                                    │
│ [  🔥 立即交易  ]                  │
└────────────────────────────────────┘
```

---

## 🔧 配置

### 环境变量

```env
# .env.local

# WebSocket URL
NEXT_PUBLIC_WS_URL=http://localhost:3000

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# 激活阈值
ACTIVATION_THRESHOLD=5
```

### 自定义阈值

```typescript
// lib/market-activation/scoring.ts

export const ACTIVATION_THRESHOLD = 5; // 修改为你想要的值
```

---

## 📱 移动端优化

组件已经做了响应式设计：
- 适配手机、平板、桌面
- 触摸友好的按钮
- 自适应字体大小
- 流畅的动画效果

---

## 🐛 故障排查

### WebSocket 连接失败

```bash
# 检查端口是否被占用
netstat -ano | findstr :3000

# 检查防火墙设置
# 确保允许 WebSocket 连接

# 查看浏览器控制台
# 应该看到 "✅ WebSocket 已连接"
```

### 实时更新不工作

```typescript
// 确保组件正确订阅了市场
const { events } = useMarketWebSocket(marketId);

// 检查服务器日志
// 应该看到 "📢 广播到市场 X: market:interested:update"
```

---

## 🚀 性能优化

### 1. 只订阅需要的市场

```typescript
// ✅ 好
useMarketWebSocket(currentMarketId);

// ❌ 差
markets.forEach(m => useMarketWebSocket(m.id)); // 太多连接
```

### 2. 组件卸载时清理

```typescript
useEffect(() => {
  // ...
  return () => {
    socket.emit('unsubscribe:market', marketId);
    socket.close(); // 自动清理
  };
}, [marketId]);
```

### 3. 防抖和节流

```typescript
// 防止频繁更新
import { debounce } from 'lodash';

const handleUpdate = debounce((data) => {
  setMarket(data);
}, 100);
```

---

## 📊 监控和日志

### 服务端日志

```bash
# 查看 WebSocket 连接
✅ WebSocket 客户端连接: socket-abc123
📊 socket-abc123 订阅市场 1
📢 广播到市场 1: market:interested:update
❌ WebSocket 客户端断开: socket-abc123
```

### 客户端日志

```typescript
// 浏览器控制台
console.log('✅ WebSocket 已连接');
console.log('📊 感兴趣更新:', data);
console.log('🚀 市场激活中:', data);
console.log('✅ 市场已激活:', data);
```

---

## 🎉 完成！

现在你的系统支持：
- ✅ 实时感兴趣人数更新
- ✅ 激活进度实时显示
- ✅ 激活倒计时（30 秒）
- ✅ 激活成功通知
- ✅ 自动刷新状态
- ✅ 美观的 UI 效果

**启动命令**：
```bash
# 启动 WebSocket 服务器
npm run dev:ws

# 启动定时任务
npm run cron
```

---

**创建时间**: 2025-10-24  
**版本**: v1.0  
**状态**: ✅ 完成



