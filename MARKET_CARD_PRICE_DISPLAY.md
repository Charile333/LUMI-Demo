# 📊 市场卡片实时价格显示功能

## 🎯 功能概述

市场卡片现在可以显示基于订单簿的实时价格和概率！

### 核心特性

1. ✅ **实时价格计算**：显示价格 = (最高买价 + 最低卖价) ÷ 2
2. ✅ **YES/NO 概率显示**：YES% + NO% = 100%
3. ✅ **买价/卖价显示**：用户可以清楚看到实际交易价格
4. ✅ **流动性指示器**：🟢高流动性 | 🟡中等 | 🔴低流动性
5. ✅ **价差警告**：当价差 >= 10% 时自动提示
6. ✅ **自动刷新**：每30秒自动更新价格

---

## 🔧 技术实现

### 1. `useMarketPrice` Hook

新增的自定义 Hook 用于获取市场实时价格：

```typescript
// hooks/useMarketPrice.ts
import { useMarketPrice } from '@/hooks/useMarketPrice';

const price = useMarketPrice(
  marketId,     // 市场 ID
  enabled       // 是否启用（仅在已激活市场启用）
);

// 返回值
interface MarketPrice {
  yes: number;        // YES 价格（0-1）
  no: number;         // NO 价格（0-1）
  probability: number; // 概率百分比（0-100）
  bestBid: number;    // 最高买价
  bestAsk: number;    // 最低卖价
  spread: number;     // 价差
  loading: boolean;   // 加载状态
  error: string | null; // 错误信息
}
```

### 2. MarketCard 组件更新

```typescript
// components/MarketCard.tsx
import { useMarketPrice } from '@/hooks/useMarketPrice';

export function MarketCard({ market, showPrice = true }) {
  // 获取实时价格（仅在已激活的市场）
  const price = useMarketPrice(
    market.id,
    showPrice && market.blockchain_status === 'created'
  );

  return (
    <div>
      {/* 市场信息 */}
      
      {/* 价格显示区域 */}
      {showPrice && market.blockchain_status === 'created' && (
        <div>
          {/* YES 55.0% | NO 45.0% */}
          {/* 买价: $0.52 | 卖价: $0.58 | 价差: 0.06 (6%) 🟡 */}
        </div>
      )}
    </div>
  );
}
```

---

## 💡 使用方法

### 基础使用

```typescript
import { MarketCard } from '@/components/MarketCard';

// 显示带价格的市场卡片（默认）
<MarketCard market={market} />

// 显示带价格的市场卡片（显式启用）
<MarketCard market={market} showPrice={true} />

// 隐藏价格（如果不需要显示价格）
<MarketCard market={market} showPrice={false} />
```

### 在列表页面中使用

```typescript
// app/markets/[category]/page.tsx
import { MarketCard } from '@/components/MarketCard';

export default function CategoryPage() {
  const [markets, setMarkets] = useState([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard 
          key={market.id} 
          market={market}
          showPrice={true}  // 显示实时价格
        />
      ))}
    </div>
  );
}
```

---

## 🎨 UI 显示效果

### 已激活市场（有价格数据）

```
┌─────────────────────────────────────┐
│  特斯拉 Q4 交付量超过 50 万？        │
│  ✓ 已激活  🔥 热门                  │
│                                     │
│  预测特斯拉 2024 年...              │
│                                     │
│  👁️ 1234  ⭐ 56  📊 活跃度 85      │
│                                     │
│  ╭─────────────────────────────╮   │
│  │  🟢 YES 55.0%   🔴 NO 45.0% │   │
│  │ ─────────────────────────── │   │
│  │ 买价: $0.52  卖价: $0.58    │   │
│  │ 🟡 6.0%                     │   │
│  ╰─────────────────────────────╯   │
│                                     │
│  [交易] [感兴趣]                    │
└─────────────────────────────────────┘
```

### 大价差警告示例

```
┌─────────────────────────────────────┐
│  ╭─────────────────────────────╮   │
│  │  🟢 YES 55.0%   🔴 NO 45.0% │   │
│  │ ─────────────────────────── │   │
│  │ 买价: $0.30  卖价: $0.80    │   │
│  │ 🔴 50.0%                    │   │
│  │ ⚠️ 价差较大，交易成本较高    │   │
│  ╰─────────────────────────────╯   │
└─────────────────────────────────────┘
```

### 未激活市场（无价格显示）

```
┌─────────────────────────────────────┐
│  新兴市场预测...                     │
│                                     │
│  这是一个即将激活的市场              │
│                                     │
│  👁️ 234  ⭐ 12  📊 活跃度 45       │
│                                     │
│  [激活中...] [表示感兴趣]           │
└─────────────────────────────────────┘
```

---

## 📊 价格数据流

```
用户打开页面
    ↓
MarketCard 渲染
    ↓
useMarketPrice Hook 初始化
    ↓
检查市场是否已激活？
    ├─ 是 → 调用 /api/orders/book
    │       ↓
    │     获取订单簿数据
    │       ↓
    │     计算价格：
    │     - bestBid (最高买价)
    │     - bestAsk (最低卖价)
    │     - midPrice = (bestBid + bestAsk) / 2
    │     - spread = bestAsk - bestBid
    │       ↓
    │     更新价格显示
    │       ↓
    │     30秒后自动刷新 ♻️
    │
    └─ 否 → 不显示价格区域
```

---

## 🎯 流动性指示器

价差越小 = 流动性越好 = 交易成本越低

| 价差范围 | 指示器 | 颜色 | 说明 |
|---------|-------|------|------|
| < 2% | 🟢 | 绿色 | 高流动性，交易成本低 |
| 2% - 10% | 🟡 | 黄色 | 中等流动性，交易成本适中 |
| >= 10% | 🔴 | 红色 | 低流动性，交易成本高 |

### 示例

```typescript
价差 = $0.01 (1%)  → 🟢 高流动性
价差 = $0.05 (5%)  → 🟡 中等流动性
价差 = $0.50 (50%) → 🔴 低流动性 + ⚠️ 警告
```

---

## ⚙️ 配置选项

### 自动刷新间隔

默认每 30 秒刷新一次，可在 `useMarketPrice.ts` 中修改：

```typescript
// 修改刷新间隔（毫秒）
const interval = setInterval(fetchPrice, 30000); // 30秒

// 如需更频繁刷新
const interval = setInterval(fetchPrice, 10000); // 10秒

// 如需更慢刷新以节省资源
const interval = setInterval(fetchPrice, 60000); // 60秒
```

### 是否显示价格

```typescript
// 全局启用/禁用
<MarketCard market={market} showPrice={true} />

// 根据条件控制
<MarketCard 
  market={market} 
  showPrice={market.blockchain_status === 'created'} 
/>

// 在特定页面禁用
<MarketCard market={market} showPrice={false} />
```

---

## 🔍 性能优化

### 1. 条件加载

价格数据仅在以下条件同时满足时加载：
- `showPrice = true`
- `market.blockchain_status === 'created'`（已激活）

```typescript
const price = useMarketPrice(
  market.id,
  showPrice && market.blockchain_status === 'created'
);
```

### 2. 自动清理

Hook 自动处理组件卸载时的清理：
```typescript
return () => {
  isMounted = false;      // 防止内存泄漏
  clearInterval(interval); // 清理定时器
};
```

### 3. 避免重复请求

如果市场未激活，完全跳过 API 请求。

---

## 🐛 错误处理

### API 请求失败

```typescript
if (error) {
  // 显示默认值（50/50）
  // 不影响其他功能
  // 控制台记录错误
  console.error('获取价格失败:', error);
}
```

### 网络超时

```typescript
try {
  const response = await fetch('/api/orders/book', {
    signal: AbortSignal.timeout(5000) // 5秒超时
  });
} catch (error) {
  // 使用默认值
}
```

### 订单簿为空

```typescript
if (bestBid === 0 && bestAsk === 0) {
  // 使用默认值
  bestBid = 0.49;
  bestAsk = 0.51;
}
```

---

## 📱 响应式设计

价格显示区域自适应不同屏幕尺寸：

```css
/* 移动端 */
@media (max-width: 640px) {
  - 价格信息垂直堆叠
  - 字体略小
  - 保持可读性
}

/* 桌面端 */
@media (min-width: 1024px) {
  - 价格信息水平排列
  - 标准字体大小
  - 最佳显示效果
}
```

---

## ✅ 总结

### 核心优势

1. ✅ **真实可靠**：基于订单簿的实际价格
2. ✅ **实时更新**：自动刷新，无需手动操作
3. ✅ **用户友好**：清晰的价格和流动性指示
4. ✅ **性能优化**：条件加载，避免不必要请求
5. ✅ **错误容错**：失败时使用默认值，不影响功能

### 适用场景

- ✅ 市场列表页（首页、分类页）
- ✅ 搜索结果页
- ✅ 热门市场推荐
- ✅ 用户收藏列表
- ✅ 任何需要展示市场卡片的地方

### 不适用场景

- ❌ 未激活的市场（没有订单簿数据）
- ❌ 历史已结算的市场（价格已固定）
- ❌ 纯展示页面（不需要实时数据）

---

## 🚀 部署建议

1. 确保 API `/api/orders/book` 正常工作
2. 检查数据库中有订单数据
3. 在 Vercel 配置 `DATABASE_URL` 环境变量
4. 测试不同网络条件下的表现
5. 监控 API 请求频率和性能

---

**文档版本**：1.0
**更新日期**：2025-10-29
**作者**：LUMI Team

