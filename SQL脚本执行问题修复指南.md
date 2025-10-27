# 🔧 SQL脚本执行问题修复指南

## ❌ 你遇到的错误

```
ERROR: 42703: column "user_address" does not exist
```

## 🎯 解决方案

### 方案1：使用简化版SQL脚本（推荐）

我已经创建了一个更简单、更可靠的版本。

#### 步骤：

1. **打开Supabase SQL Editor**
   - 登录 https://supabase.com
   - 进入你的项目
   - 点击左侧 "SQL Editor"
   - 点击 "New query"

2. **使用简化版脚本**
   - 打开 `scripts/supabase-orderbook-schema-simple.sql`
   - 复制全部内容
   - 粘贴到SQL Editor
   - 点击 "Run"

3. **验证成功**
   - 应该看到：
     ```
     ✅ 订单簿数据库表创建成功！
     ✅ 实时功能已启用！
     ✅ 测试数据已插入！
     ```

---

### 方案2：清理后重新执行

如果方案1还有问题，可能是因为之前执行失败留下了部分表。

#### 步骤：

1. **先清理现有表**

在Supabase SQL Editor中执行：

```sql
-- 删除可能存在的表（注意：会删除数据！）
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS orderbooks CASCADE;
DROP TABLE IF EXISTS market_states CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_orders() CASCADE;
```

2. **然后执行简化版脚本**

复制粘贴 `scripts/supabase-orderbook-schema-simple.sql` 的内容并运行。

---

### 方案3：分步执行（最安全）

如果还有问题，可以一步步执行：

#### 第1步：创建表

```sql
-- 订单簿表
CREATE TABLE orderbooks (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  bids JSONB NOT NULL DEFAULT '[]',
  asks JSONB NOT NULL DEFAULT '[]',
  last_price DECIMAL(18, 6),
  volume_24h DECIMAL(18, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**检查：** 在Table Editor中应该看到 `orderbooks` 表

#### 第2步：创建订单表

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price DECIMAL(18, 6) NOT NULL,
  quantity DECIMAL(18, 6) NOT NULL,
  filled_quantity DECIMAL(18, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**检查：** 应该看到 `orders` 表

#### 第3步：创建市场状态表

```sql
CREATE TABLE market_states (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activating', 'active', 'failed')),
  interested_count INTEGER DEFAULT 0,
  activation_threshold INTEGER DEFAULT 10,
  message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**检查：** 应该看到 `market_states` 表

#### 第4步：启用实时功能（最重要！）

```sql
ALTER TABLE orderbooks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE market_states REPLICA IDENTITY FULL;
```

**检查：** 应该没有错误

#### 第5步：创建索引

```sql
CREATE INDEX idx_orderbooks_market_id ON orderbooks(market_id);
CREATE INDEX idx_orders_market_id ON orders(market_id);
CREATE INDEX idx_orders_user_address ON orders(user_address);
CREATE INDEX idx_orders_status ON orders(status);
```

#### 第6步：插入测试数据

```sql
INSERT INTO orderbooks (market_id, bids, asks, last_price)
VALUES (1, '[]'::jsonb, '[]'::jsonb, 0.5);

INSERT INTO market_states (market_id, status, interested_count)
VALUES (1, 'pending', 0);
```

---

## ✅ 验证成功

执行以下SQL验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orderbooks', 'orders', 'market_states');

-- 查看数据
SELECT * FROM orderbooks;
SELECT * FROM market_states;
SELECT COUNT(*) as total_orders FROM orders;
```

**预期结果：**
- 应该看到3个表名
- orderbooks 和 market_states 各有1条数据
- orders 有0条数据

---

## 🐛 常见问题

### Q1: 还是报错 "column does not exist"

**A:** 
1. 确认表名是否正确（不要有拼写错误）
2. 清理所有表后重新创建
3. 使用方案3分步执行

### Q2: "relation already exists"

**A:** 表已经存在，可以：
- 跳过创建，直接使用
- 或者先删除再创建（会丢失数据）

```sql
DROP TABLE IF EXISTS orders CASCADE;
-- 然后重新创建
```

### Q3: 权限错误

**A:** 确认：
1. 使用的是正确的Supabase项目
2. 在SQL Editor中执行（不是在其他客户端）
3. 账号有管理员权限

---

## 📞 下一步

### 表创建成功后：

1. **配置环境变量**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=你的URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Key
   SUPABASE_SERVICE_ROLE_KEY=你的Service Key
   ```

2. **测试连接**
   ```bash
   npm run dev
   ```

3. **访问测试页面**
   ```
   http://localhost:3000/test-orderbook-realtime
   ```

---

## 🎯 快速检查清单

执行成功后，应该满足：

- [ ] 在Supabase Table Editor看到3个表
- [ ] orderbooks 有1条测试数据
- [ ] market_states 有1条测试数据
- [ ] 所有表都有索引
- [ ] 实时功能已启用（REPLICA IDENTITY FULL）
- [ ] 触发器已创建（updated_at自动更新）

---

## 💡 推荐操作顺序

1. ✅ 先尝试方案1（简化版脚本）
2. ✅ 如果失败，执行方案2（清理后重试）
3. ✅ 如果还失败，使用方案3（分步执行）

**大多数情况下，方案1就能成功！**

---

## 📝 成功案例

执行成功后，你应该看到类似输出：

```sql
NOTICE:  ✅ 订单簿数据库表创建成功！
NOTICE:  ✅ 实时功能已启用！
NOTICE:  ✅ 测试数据已插入！
NOTICE:  📊 表清单：orderbooks, orders, market_states

table_name      | row_count
----------------|----------
orderbooks      | 1
orders          | 0
market_states   | 1
```

需要帮助吗？告诉我你执行到哪一步了！




