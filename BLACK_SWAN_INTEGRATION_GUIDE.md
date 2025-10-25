# 🦢 黑天鹅预警系统 - 集成指南

## ✅ 完成！预警系统已集成到 LUMI

预警系统现已**完全集成**到 LUMI 的 Next.js 服务器中，**无需单独启动预警服务器**！

---

## 🚀 快速开始

### 一键启动

```bash
cd LUMI
npm run dev
```

**就这么简单！** 现在只需一条命令：
- ✅ LUMI 应用服务器
- ✅ 订单簿 WebSocket
- ✅ 黑天鹅预警系统
- ✅ 预警数据库监控

全部自动启动！

---

## 🎯 访问黑天鹅页面

启动服务器后，访问：

```
http://localhost:3000/black-swan
```

---

## 📡 技术架构

### 集成方案

```
┌─────────────────────────────────────────┐
│      LUMI Next.js 服务器 (:3000)        │
├─────────────────────────────────────────┤
│  HTTP 路由                               │
│  ├── Next.js 页面                        │
│  ├── /api/alerts     (预警API)           │
│  └── /api/alerts/stats (统计API)         │
│                                          │
│  WebSocket 服务                          │
│  ├── /ws/orderbook   (订单簿推送)        │
│  └── /ws/alerts      (预警推送)          │
│                                          │
│  后台任务                                │
│  └── 数据库监控 (每2秒检查新预警)         │
└─────────────────────────────────────────┘
           │
           ├─→ duolume-master/utils/database/app.db
           │   (预警数据库)
           │
           └─→ LUMI 数据库 (Supabase)
```

### 端点详情

#### HTTP API
- `GET /api/alerts` - 获取最近20条预警记录
- `GET /api/alerts/stats` - 获取预警统计信息

#### WebSocket
- `ws://localhost:3000/ws/alerts` - 实时预警推送
- `ws://localhost:3000/ws/orderbook` - 订单簿实时推送

---

## 🔧 核心功能

### 1. 自动数据库监控
服务器启动时自动监控预警数据库：
- ✅ 每2秒检查新预警
- ✅ 自动推送到所有连接的客户端
- ✅ 支持 BTC/USDT 和 ETH/USDT

### 2. 实时 WebSocket 推送
黑天鹅页面自动连接并接收：
- ✅ 新预警实时出现
- ✅ 自动分级（CRITICAL/HIGH/MEDIUM）
- ✅ 连接断开自动重连

### 3. 历史数据加载
页面加载时自动获取：
- ✅ 最近20条历史预警
- ✅ 完整的预警详情
- ✅ 价格变化百分比

---

## 🛠️ 配置说明

### 数据库路径

预警数据库位置：
```
duolume-master/utils/database/app.db
```

如需修改路径，编辑 `LUMI/server.js`：

```javascript
const dbFile = path.join(__dirname, '..', 'duolume-master', 'utils', 'database', 'app.db');
```

### 可选：禁用预警功能

如果不需要预警功能，无需任何修改：
- ✅ 自动检测 sqlite3
- ✅ 未安装时自动降级
- ✅ 返回空数据，不影响其他功能

---

## 🧪 测试预警系统

### 方法1：使用现有预警数据

如果数据库中已有预警数据：
1. 启动服务器：`npm run dev`
2. 访问黑天鹅页面
3. 查看右侧实时终端

### 方法2：生成测试预警

如果需要生成新的预警数据，在 duolume-master 目录运行：

```bash
cd ../duolume-master
python main.py  # 启动预警生成程序
```

或手动触发测试预警：
```bash
python test_alert_trigger.py
```

### 方法3：查看现有预警

```bash
cd ../duolume-master
python check_btc_eth_alerts.py
```

---

## 📊 启动日志

成功启动后，您会看到：

```
════════════════════════════════════════
✅ LUMI 服务器启动成功！
════════════════════════════════════════
📍 应用地址: http://localhost:3000
📊 订单簿 WebSocket: ws://localhost:3000/ws/orderbook
🦢 预警系统 WebSocket: ws://localhost:3000/ws/alerts
════════════════════════════════════════

🦢 预警监控已启动，最后预警 ID: 123
```

---

## 🎉 优势

相比之前的双服务器方案：

| 特性 | 之前 (双服务器) | 现在 (集成) |
|------|----------------|------------|
| 启动命令 | 2个 | **1个** ✅ |
| 端口占用 | 3000 + 3001 | **3000** ✅ |
| 进程管理 | 复杂 | **简单** ✅ |
| 部署难度 | 高 | **低** ✅ |
| 资源占用 | 高 | **低** ✅ |

---

## 🐛 故障排查

### 预警功能不可用

**现象**：启动时看到 `⚠️ 预警系统未配置（sqlite3 未安装）`

**解决**：
```bash
npm install sqlite3
```

### 数据库文件不存在

**现象**：`❌ 数据库连接失败`

**解决**：
1. 检查数据库文件是否存在：
   ```bash
   ls ../duolume-master/utils/database/app.db
   ```

2. 如不存在，运行预警生成程序创建：
   ```bash
   cd ../duolume-master
   python main.py
   ```

### WebSocket 连接失败

**现象**：黑天鹅页面显示"❌ 预警系统连接断开"

**检查**：
1. 服务器是否正常运行
2. 浏览器控制台是否有错误
3. 尝试刷新页面

---

## 📝 代码文件

### 修改的文件

1. **`LUMI/server.js`** - 集成了预警 WebSocket 和 API
2. **`LUMI/app/black-swan/page.tsx`** - 更新连接地址
3. **`LUMI/package.json`** - 添加 sqlite3 依赖

### 无需修改

- ❌ 不需要修改 duolume-master 代码
- ❌ 不需要运行额外的服务器
- ❌ 不需要配置端口转发

---

## 🚢 部署到生产环境

### 1. 确保数据库可访问

```javascript
// 在 server.js 中配置生产环境数据库路径
const dbFile = process.env.ALERT_DB_PATH || 
  path.join(__dirname, '..', 'duolume-master', 'utils', 'database', 'app.db');
```

### 2. 设置环境变量

```bash
ALERT_DB_PATH=/path/to/production/database/app.db
```

### 3. 构建并启动

```bash
npm run build
npm start
```

---

## 🎓 下一步

- ✅ **完成** - 预警系统已集成
- 🎯 **可选** - 添加更多加密货币监控
- 🎯 **可选** - 集成 TradingView 图表
- 🎯 **可选** - 添加预警通知功能

---

## 📞 支持

如有问题：
1. 检查控制台日志
2. 查看浏览器开发者工具
3. 参考本文档的故障排查部分

---

**🎉 恭喜！您现在拥有一个完全集成的黑天鹅预警系统！**





