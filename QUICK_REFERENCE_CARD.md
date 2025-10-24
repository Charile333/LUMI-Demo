# 🚀 快速参考卡片

## ⚡ 一分钟快速开始

```bash
# 安装依赖
npm install socket.io socket.io-client

# 配置环境（必需）
cp .env.example .env.local
# 编辑 DATABASE_URL 和 PLATFORM_WALLET_PRIVATE_KEY

# 初始化数据库
npm run db:setup && npm run db:migrate

# 启动服务（2 个终端）
npm run dev:ws    # 终端 1: Next.js + WebSocket
npm run cron      # 终端 2: 定时任务

# 访问
http://localhost:3000/admin/create-market
```

---

## 📊 三种激活方式对比

| 方式 | 触发条件 | 激活时机 | 用户等待 | 适用场景 |
|------|---------|---------|---------|---------|
| **感兴趣** | 5 人感兴趣 | 定时任务 | 0 秒 | 高人气市场 |
| **交易时** | 用户点击交易 | 立即 | 30 秒 | 首个交易者 |
| **手动** | 管理员操作 | 立即 | 0 秒 | 重要市场 |

---

## 🎯 关键 API

```bash
# 创建市场（免费）
POST /api/admin/markets/create

# 批量创建
POST /api/admin/markets/batch-create

# 标记感兴趣
POST /api/markets/{id}/interested

# 激活市场
POST /api/admin/markets/{id}/activate

# 创建订单（链下）
POST /api/orders/create

# 获取订单簿
GET /api/orders/book?marketId=1&outcome=1
```

---

## 📱 React 组件

```tsx
// 完整市场卡片（推荐）
<MarketCard market={market} />

// 单独组件
<MarketActivationStatus market={market} />
<TradeButton market={market} />
<InterestedButton market={market} />
```

---

## 🔔 WebSocket 事件

```typescript
// 监听实时事件
const { events } = useMarketWebSocket(marketId);

events.interested   // 感兴趣更新
events.activating   // 激活中
events.activated    // 已激活
events.failed       // 失败
```

---

## 🔧 常用命令

```bash
# 手动运行任务
npm run activate-markets  # 激活市场
npm run settle-trades     # 批量结算
npm run clean-orders      # 清理订单

# 数据库
npm run db:setup     # 初始化
npm run db:migrate   # 迁移

# 服务
npm run dev:ws   # Next.js + WebSocket
npm run cron     # 定时任务
```

---

## 🐛 快速诊断

```bash
# WebSocket 连接失败？
# 检查: npm run dev:ws 是否启动

# 激活失败？
# 检查: PLATFORM_WALLET_PRIVATE_KEY 是否配置
# 检查: 平台钱包 USDC 余额是否充足

# 数据库错误？
# 检查: DATABASE_URL 是否正确
# 运行: psql $DATABASE_URL -c "SELECT NOW();"
```

---

## 💡 最佳实践

### 创建市场
✅ 先在数据库创建（免费）  
✅ 设置合理的优先级  
✅ 填写完整的描述  

### 激活策略
✅ 热门市场：5 人感兴趣即激活  
✅ 普通市场：100 浏览或活跃度 60  
✅ 紧急市场：手动激活  

### 成本控制
✅ 奖励设为 10 USDC（不是 100）  
✅ 批量创建降低运营成本  
✅ 监控激活率，调整阈值  

---

## 📊 监控命令

```bash
# 市场统计
psql $DATABASE_URL -c "
SELECT blockchain_status, COUNT(*) 
FROM markets GROUP BY blockchain_status;"

# 订单统计
psql $DATABASE_URL -c "
SELECT status, COUNT(*) 
FROM orders GROUP BY status;"

# 今日成交
psql $DATABASE_URL -c "
SELECT COUNT(*), SUM(amount::numeric) 
FROM trades 
WHERE DATE(created_at) = CURRENT_DATE;"
```

---

## 🎉 完成！

**系统已 100% 就绪，开始使用吧！** 🚀

---

**快速开始**: `QUICK_START_POLYMARKET_STYLE.md`  
**完整指南**: `POLYMARKET_IMPLEMENTATION_GUIDE.md`  
**问题排查**: `VERIFICATION_CHECKLIST.md`

