# 数据库架构对比：旧架构 vs 新架构

## 📋 概览

| 特征 | 旧架构 (create-table.sql) | 新架构 (setup-database-clean.sql) |
|------|--------------------------|----------------------------------|
| 文件位置 | `scripts/create-table.sql` | `scripts/setup-database-clean.sql` |
| 命名风格 | **驼峰命名** (camelCase) | **下划线命名** (snake_case) |
| 用途 | 早期原型，简单展示 | 完整区块链集成系统 |
| 复杂度 | 简单（25个字段） | 复杂（30+字段） |

---

## 🔍 详细字段对比

### 1️⃣ 命名规范差异

| 旧架构 (驼峰) | 新架构 (下划线) |
|------------|---------------|
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `categoryType` | `main_category` |
| `isActive` | `status` |
| `endDate` | `end_time` |
| `volumeNum` | `volume` |
| `priorityLevel` | `priority_level` |

### 2️⃣ 核心字段对比

#### **分类字段**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 主分类 | `categoryType TEXT` | `main_category TEXT` |
| 子分类 | `category TEXT` | `sub_category TEXT` |
| 标签 | ❌ 不支持 | `tags TEXT[]` ✅ 数组 |

**示例**：
- 旧：`categoryType = 'automotive'`
- 新：`main_category = 'automotive', sub_category = '品牌月度销量'`

---

#### **状态管理**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 活跃状态 | `isActive BOOLEAN` | `status TEXT` |
| 区块链状态 | ❌ 不存在 | `blockchain_status TEXT` ✅ |
| 解决状态 | ❌ 不存在 | `resolved BOOLEAN` ✅ |

**旧架构**：
```sql
isActive BOOLEAN DEFAULT true  -- 只有开/关
```

**新架构**：
```sql
status TEXT DEFAULT 'draft'  -- draft, pending, active, resolved, cancelled
blockchain_status TEXT DEFAULT 'not_created'  -- 链上状态
resolved BOOLEAN DEFAULT FALSE  -- 是否已结算
```

---

#### **时间字段**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 创建时间 | `createdAt` | `created_at` |
| 更新时间 | `updatedAt` | `updated_at` |
| 结束时间 | `endDate TEXT` ⚠️ 字符串 | `end_time TIMESTAMP` ✅ |
| 开始时间 | ❌ 不存在 | `start_time TIMESTAMP` ✅ |
| 结算时间 | ❌ 不存在 | `resolution_time TIMESTAMP` ✅ |

**关键差异**：
- 旧架构的 `endDate` 是 **TEXT** 类型（如 `"2025-12-31"`）
- 新架构的 `end_time` 是 **TIMESTAMP** 类型（真正的日期）

---

#### **交易数据**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 交易量 | `volume TEXT`（如 `"$1000"`）| `volume DECIMAL` ✅ |
| 交易量数字 | `volumeNum DECIMAL` | 直接用 `volume` |
| 流动性 | ❌ 不存在 | `liquidity DECIMAL` ✅ |
| 参与人数 | `participants INTEGER` | `participants INTEGER` |
| 概率 | `probability DECIMAL(5,2)` | ❌ 不存在（从链上获取） |
| 涨跌趋势 | `trend TEXT, change TEXT` | ❌ 不存在（实时计算） |

---

#### **区块链集成**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 问题ID | ❌ 不存在 | `question_id TEXT UNIQUE` ✅ |
| 条件ID | ❌ 不存在 | `condition_id TEXT` ✅ |
| 适配器地址 | ❌ 不存在 | `adapter_address TEXT` ✅ |
| CTF地址 | ❌ 不存在 | `ctf_address TEXT` ✅ |
| 预言机地址 | ❌ 不存在 | `oracle_address TEXT` ✅ |
| 抵押代币 | ❌ 不存在 | `collateral_token TEXT` ✅ |
| 奖励金额 | ❌ 不存在 | `reward_amount DECIMAL` ✅ |

---

#### **结算数据**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 结算标记 | ❌ 不存在 | `resolved BOOLEAN` ✅ |
| 结算数据 | ❌ 不存在 | `resolution_data JSONB` ✅ |
| 获胜结果 | ❌ 不存在 | `winning_outcome INTEGER` ✅ |

---

#### **展示相关**

| 功能 | 旧架构 | 新架构 |
|-----|-------|-------|
| 图片URL | ❌ 不存在 | `image_url TEXT` ✅ |
| 描述 | `description TEXT` | `description TEXT` |
| 解决标准 | `resolutionCriteria TEXT[]` | ❌ 在description中 |
| 关联市场 | `relatedMarkets TEXT[]` | ❌ 通过tags |
| 首页显示 | `isHomepage BOOLEAN` | ❌ 通过priority |
| 热门标记 | `isHot BOOLEAN` | ❌ 通过activity_score |
| 趋势标记 | `isTrending BOOLEAN` | ❌ 通过activity_score |

---

## 📊 数据示例对比

### 旧架构数据示例

```json
{
  "id": 1,
  "title": "特斯拉2025年销量",
  "category": "新能源汽车",
  "categoryType": "automotive",
  "probability": 65.5,
  "volume": "$50000",
  "volumeNum": 50000,
  "participants": 120,
  "endDate": "2025-12-31",
  "trend": "up",
  "change": "+5%",
  "description": "预测特斯拉2025年全球销量",
  "isActive": true,
  "source": "custom",
  "priorityLevel": "recommended",
  "isHomepage": true,
  "isHot": true,
  "isTrending": false,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### 新架构数据示例

```json
{
  "id": 1,
  "question_id": "0x1234...abcd",
  "condition_id": "0x5678...efgh",
  "title": "特斯拉2025年销量",
  "description": "预测特斯拉2025年全球销量",
  "image_url": "https://...",
  "main_category": "automotive",
  "sub_category": "品牌月度销量",
  "tags": ["特斯拉", "新能源", "销量预测"],
  "start_time": "2025-01-01T00:00:00Z",
  "end_time": "2025-12-31T23:59:59Z",
  "resolution_time": "2026-01-15T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "status": "active",
  "blockchain_status": "created",
  "adapter_address": "0xabcd...",
  "volume": 50000,
  "liquidity": 25000,
  "participants": 120,
  "priority_level": "recommended",
  "resolved": false
}
```

---

## 🔄 迁移映射表

如果需要从旧架构迁移到新架构：

```sql
-- 迁移脚本示例
INSERT INTO new_markets (
  title,
  description,
  main_category,
  sub_category,
  end_time,
  created_at,
  updated_at,
  status,
  volume,
  participants,
  priority_level
)
SELECT 
  title,
  description,
  categoryType,                           -- categoryType → main_category
  category,                               -- category → sub_category
  endDate::TIMESTAMP,                     -- TEXT → TIMESTAMP
  createdAt,                              -- createdAt → created_at
  updatedAt,                              -- updatedAt → updated_at
  CASE 
    WHEN isActive THEN 'active'          -- isActive → status
    ELSE 'cancelled'
  END,
  volumeNum,                              -- volumeNum → volume
  participants,
  priorityLevel                           -- priorityLevel → priority_level
FROM old_markets;
```

---

## ⚠️ 兼容性问题

### 当前代码使用情况

| 代码位置 | 使用的架构 | 问题 |
|---------|-----------|------|
| `lib/hooks/useMarketsByCategory.ts` | **新架构** | ✅ 已修复 |
| `lib/hooks/useMarketsWithRealTimePrices.ts` | **新架构** | ✅ 已修复 |
| `lib/providers/custom.ts` | **旧架构** | ⚠️ 需要更新 |
| `lib/hooks/useMarkets.ts` | **旧架构** | ⚠️ 需要更新 |
| `app/api/orders/my-orders/route.ts` | **新架构** (orders表) | ✅ 正确 |

---

## 🎯 建议方案

### 选项 1：全面迁移到新架构（推荐）✅

**优点**：
- ✅ 完整的区块链集成支持
- ✅ 符合 PostgreSQL 命名规范
- ✅ 更好的类型安全（TIMESTAMP 而非 TEXT）
- ✅ 支持复杂的结算逻辑

**缺点**：
- ⚠️ 需要迁移现有数据
- ⚠️ 需要更新所有使用旧架构的代码

**迁移工作量**：
1. 更新 `lib/providers/custom.ts`（约50行）
2. 更新 `lib/hooks/useMarkets.ts`（约30行）
3. 运行数据迁移脚本
4. 测试所有页面

---

### 选项 2：保持旧架构

**优点**：
- ✅ 不需要迁移数据
- ✅ 现有代码无需修改

**缺点**：
- ❌ 无法使用区块链功能
- ❌ 时间处理不规范（TEXT类型）
- ❌ 扩展性差

**⚠️ 不推荐**：项目已经开始使用新架构

---

## 📝 后续行动计划

### 立即行动（已完成）✅
- [x] 修复 `useMarketsByCategory.ts` 的字段名问题
- [x] 修复 `useMarketsWithRealTimePrices.ts` 的字段名问题
- [x] 创建架构对比文档

### 短期（建议本周完成）
- [ ] 决定使用哪套架构（建议：新架构）
- [ ] 如果选择新架构：
  - [ ] 更新 `lib/providers/custom.ts` 使用新字段
  - [ ] 更新 `lib/hooks/useMarkets.ts` 使用新字段
  - [ ] 在 Supabase 确认当前表结构
  - [ ] 运行数据迁移（如果需要）

### 中期（建议本月完成）
- [ ] 删除未使用的旧架构文件
- [ ] 统一所有 API 端点使用新架构
- [ ] 更新相关文档

---

## 🔗 相关文件

- **旧架构定义**：`scripts/create-table.sql`
- **新架构定义**：`scripts/setup-database-clean.sql`
- **数据库检查脚本**：`database/check-markets-schema.sql`
- **已修复的文件**：
  - `lib/hooks/useMarketsByCategory.ts`
  - `lib/hooks/useMarketsWithRealTimePrices.ts`

---

## ❓ 如何确认当前使用的架构

在 Supabase SQL Editor 中运行：

```sql
-- 检查是否使用新架构（下划线命名）
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_name = 'markets'
  AND column_name = 'main_category'
) as is_new_schema;

-- 检查是否使用旧架构（驼峰命名）
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_name = 'markets'
  AND column_name = 'categoryType'
) as is_old_schema;
```

**结果解读**：
- `is_new_schema = true` → 使用新架构 ✅
- `is_old_schema = true` → 使用旧架构 ⚠️
- 两者都是 `true` → 混合状态 ❌ 需要清理

