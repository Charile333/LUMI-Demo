# 🚀 Polymarket 风格系统实施完成指南

## ✅ 已实施的四大功能

### 功能一：团队后台批量创建 ✅

**实现内容**：
- ✅ 数据库表结构（markets, orders, trades, settlements）
- ✅ 后台管理 API（`/api/admin/markets/create`）
- ✅ 批量创建 API（`/api/admin/markets/batch-create`）
- ✅ 管理后台页面（`/app/admin/create-market`）

**使用方法**：
```bash
# 1. 访问管理后台
http://localhost:3000/admin/create-market

# 2. 填写表单创建市场
# - 完全免费
# - 不消耗 Gas
# - 即时创建
```

---

### 功能二：只为活跃市场付费 ✅

**实现内容**：
- ✅ 活跃度评分算法（`lib/market-activation/scoring.ts`）
- ✅ 用户浏览追踪 API（`/api/markets/[id]/view`）
- ✅ 用户感兴趣 API（`/api/markets/[id]/interested`）

**评分规则**：
- 浏览量权重：40%
- 感兴趣用户：30%
- 时间因素：15%
- 优先级加成：10-15%

**激活条件**（满足任一）：
- 活跃度评分 >= 60 分
- 浏览量 >= 100 次
- 感兴趣用户 >= 10 人
- 优先级 = "hot"

---

### 功能三：按需激活 ✅

**实现内容**：
- ✅ 平台账户链上创建（`lib/market-activation/blockchain-activator.ts`）
- ✅ 定时任务脚本（`scripts/activate-markets-cron.ts`）
- ✅ Cron 调度器（`scripts/cron-scheduler.ts`）
- ✅ 手动激活 API（`/api/admin/markets/[id]/activate`）

**定时任务**：
- 每小时扫描一次
- 自动激活高活跃度市场
- 使用平台账户支付 Gas 和 USDC

**手动激活**：
```bash
POST /api/admin/markets/{id}/activate
```

---

### 功能四：链下订单匹配 ✅

**实现内容**：
- ✅ EIP-712 签名验证（`lib/clob/signing.ts`）
- ✅ 订单匹配引擎（`lib/clob/matching-engine.ts`）
- ✅ 订单 API（创建、取消、订单簿）
- ✅ 批量结算任务（`scripts/settle-trades-cron.ts`）

**工作流程**：
1. 用户在前端签名订单（EIP-712）
2. 订单提交到数据库（链下）
3. 自动匹配相反方向的订单
4. 生成成交记录（链下）
5. 定时任务批量上链结算

**API 端点**：
```bash
# 创建订单
POST /api/orders/create

# 获取订单簿
GET /api/orders/book?marketId=1&outcome=0

# 取消订单
POST /api/orders/cancel
```

---

## 📂 文件结构

```
E:\project\market\
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── markets/
│   │   │       ├── create/route.ts              ✅ 创建市场
│   │   │       ├── batch-create/route.ts        ✅ 批量创建
│   │   │       └── [id]/activate/route.ts       ✅ 激活市场
│   │   ├── markets/
│   │   │   └── [id]/
│   │   │       ├── view/route.ts                ✅ 浏览追踪
│   │   │       └── interested/route.ts          ✅ 感兴趣
│   │   └── orders/
│   │       ├── create/route.ts                  ✅ 创建订单
│   │       ├── book/route.ts                    ✅ 订单簿
│   │       └── cancel/route.ts                  ✅ 取消订单
│   └── admin/
│       └── create-market/page.tsx               ✅ 管理后台
├── lib/
│   ├── db/
│   │   ├── index.ts                            ✅ 数据库连接
│   │   └── supabase-client.ts                  ✅ Supabase
│   ├── market-activation/
│   │   ├── scoring.ts                          ✅ 评分算法
│   │   └── blockchain-activator.ts             ✅ 链上激活
│   └── clob/
│       ├── signing.ts                          ✅ EIP-712 签名
│       └── matching-engine.ts                  ✅ 匹配引擎
├── scripts/
│   ├── add-activity-fields.sql                 ✅ 数据库迁移
│   ├── activate-markets-cron.ts                ✅ 市场激活任务
│   ├── settle-trades-cron.ts                   ✅ 批量结算任务
│   ├── clean-expired-orders.ts                 ✅ 清理订单任务
│   └── cron-scheduler.ts                       ✅ Cron 调度器
└── .env.example                                ✅ 环境配置示例
```

---

## 🛠️ 部署步骤

### 1. 配置数据库

```bash
# 使用 PostgreSQL
psql -U postgres -d market_clob -f scripts/supabase-step2-tables.sql

# 添加活跃度字段
psql -U postgres -d market_clob -f scripts/add-activity-fields.sql
```

### 2. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑配置
nano .env.local
```

**必需配置**：
```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/market_clob

# 平台钱包（⚠️ 保密！）
PLATFORM_WALLET_PRIVATE_KEY=0x...

# RPC 节点
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

需要的额外包：
```bash
npm install pg node-cron
npm install --save-dev @types/pg @types/node-cron
```

### 4. 启动服务

```bash
# 启动 Next.js 应用
npm run dev

# 启动定时任务（另一个终端）
npx ts-node scripts/cron-scheduler.ts
```

---

## 📊 测试流程

### 测试功能一：创建市场

```bash
# 1. 访问管理后台
http://localhost:3000/admin/create-market

# 2. 填写表单
标题: "特斯拉 Q4 交付量会超过 50 万吗？"
描述: "预测特斯拉 2024 年 Q4 全球交付量"
分类: 汽车与新能源

# 3. 提交
# ✅ 应该立即创建成功，成本 $0
```

### 测试功能二：活跃度追踪

```bash
# 1. 浏览市场（模拟用户行为）
curl -X POST http://localhost:3000/api/markets/1/view \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x..."}'

# 2. 标记感兴趣
curl -X POST http://localhost:3000/api/markets/1/interested \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x..."}'

# 3. 检查数据库
psql -U postgres -d market_clob -c "SELECT id, title, views, interested_users, activity_score FROM markets WHERE id = 1;"
```

### 测试功能三：激活市场

```bash
# 方法 1：手动激活
curl -X POST http://localhost:3000/api/admin/markets/1/activate

# 方法 2：定时任务
npx ts-node scripts/activate-markets-cron.ts

# 检查结果
psql -U postgres -d market_clob -c "SELECT id, title, blockchain_status, condition_id FROM markets WHERE id = 1;"
```

### 测试功能四：链下订单

参考前端代码示例：
```typescript
// 签名订单
import { signOrder, generateOrderId, generateSalt } from '@/lib/clob/signing';

const order = {
  orderId: generateOrderId(),
  maker: userAddress,
  marketId: 1,
  outcome: 1, // YES
  side: 'buy',
  price: '0.65',
  amount: '10',
  expiration: Math.floor(Date.now() / 1000) + 86400, // 24小时后过期
  nonce: Date.now(),
  salt: generateSalt()
};

const signature = await signOrder(order, signer);
const signedOrder = { ...order, signature };

// 提交订单
const response = await fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signedOrder)
});
```

---

## 🎯 成本对比

### 传统方式（直接上链）
```
创建 100 个市场:
  Gas 费: 100 × 0.01 POL = 1 POL
  USDC: 100 × 10 = 1,000 USDC
  总成本: ~$1,000
  问题: 很多市场没人交易，浪费
```

### Polymarket 方式（按需激活）
```
创建 100 个市场（数据库）: $0
系统分析: 只有 20 个市场活跃
激活 20 个市场:
  Gas 费: 20 × 0.01 POL = 0.2 POL
  USDC: 20 × 10 = 200 USDC
  总成本: ~$200
  节省: 80% 🎉
```

---

## 📈 监控和维护

### 查看系统状态

```bash
# 检查待激活市场
psql -U postgres -d market_clob -c "
SELECT id, title, activity_score, views, interested_users, blockchain_status
FROM markets
WHERE blockchain_status = 'not_created' AND activity_score >= 60
ORDER BY activity_score DESC;
"

# 检查待结算交易
psql -U postgres -d market_clob -c "
SELECT COUNT(*) as pending_trades
FROM trades
WHERE settled = false;
"

# 检查订单簿
psql -U postgres -d market_clob -c "
SELECT market_id, side, COUNT(*) as order_count, SUM(remaining_amount) as total_amount
FROM orders
WHERE status IN ('open', 'partial')
GROUP BY market_id, side;
"
```

### 定时任务日志

```bash
# 查看 Cron 日志
tail -f logs/cron.log

# 手动运行任务
npx ts-node scripts/activate-markets-cron.ts
npx ts-node scripts/settle-trades-cron.ts
npx ts-node scripts/clean-expired-orders.ts
```

---

## 🔧 故障排查

### 问题 1：数据库连接失败

```bash
# 检查 DATABASE_URL
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT NOW();"
```

### 问题 2：市场激活失败

```bash
# 检查平台钱包余额
npx hardhat run scripts/check-balance.js --network amoy

# 检查 USDC 余额
# 需要至少有足够的 USDC 用于奖励
```

### 问题 3：订单签名验证失败

- 确保前端和后端的 EIP-712 Domain 完全一致
- 检查 chainId 是否正确（Amoy: 80002）
- 验证 verifyingContract 地址

---

## 🎉 完成！

您现在拥有一个完整的 Polymarket 风格预测市场系统：

✅ **功能一**：免费批量创建市场（数据库）
✅ **功能二**：智能活跃度评分
✅ **功能三**：按需自动激活（节省 80% 成本）
✅ **功能四**：链下订单匹配（快速、低成本）

---

## 📞 下一步

1. **部署到生产环境**
   - 配置生产数据库
   - 设置 SSL 证书
   - 配置域名和 CDN

2. **完善功能**
   - 添加 WebSocket 实时订单簿
   - 实现前端交易界面
   - 添加用户仪表盘

3. **安全加固**
   - 实施 API 限流
   - 添加用户认证
   - 监控异常行为

---

**创建时间**: 2025-10-24
**版本**: v1.0
**状态**: ✅ 全部实施完成

