# 🚀 市场卡片价格显示 - 快速开始

## ✅ 已完成的功能

### 1. **`useMarketPrice` Hook** 📊
位置：`hooks/useMarketPrice.ts`

自动获取市场实时价格，每30秒刷新一次。

```typescript
import { useMarketPrice } from '@/hooks/useMarketPrice';

const price = useMarketPrice(marketId, enabled);

// 返回数据：
// - yes: 0.55 (YES 价格)
// - no: 0.45 (NO 价格)  
// - probability: 55 (概率 %)
// - bestBid: 0.52 (最高买价)
// - bestAsk: 0.58 (最低卖价)
// - spread: 0.06 (价差)
// - loading: false
// - error: null
```

### 2. **MarketCard 组件更新** 🎴
位置：`components/MarketCard.tsx`

现在自动显示实时价格和流动性指标。

```typescript
import { MarketCard } from '@/components/MarketCard';

// 使用方法
<MarketCard 
  market={market}
  showPrice={true}  // 显示价格（默认）
/>
```

---

## 🎯 核心价格公式

```
显示价格 = (最高买价 + 最低卖价) ÷ 2

YES% + NO% = 100%
```

### 示例

```
最高买价 = $0.52
最低卖价 = $0.58

计算：
显示价格 = ($0.52 + $0.58) ÷ 2 = $0.55
YES 概率 = 55%
NO 概率 = 45%
价差 = $0.06 (6%)
```

---

## 📊 卡片显示效果

### 已激活的市场（有价格）

```
┌────────────────────────────────┐
│ 特斯拉 Q4 交付量超过 50 万？    │
│ ✓ 已激活  🔥 热门              │
│                                │
│ 预测特斯拉 2024 年...          │
│                                │
│ 👁️ 1234  ⭐ 56  📊 85         │
│                                │
│ ╔════════════════════════╗    │
│ ║ 🟢 YES 55.0%  🔴 NO 45.0% ║    │
│ ║ ─────────────────────── ║    │
│ ║ 买价: $0.52  卖价: $0.58║    │
│ ║ 🟡 6.0%                 ║    │
│ ╚════════════════════════╝    │
│                                │
│  [交易]  [感兴趣]              │
└────────────────────────────────┘
```

### 未激活的市场（无价格）

```
┌────────────────────────────────┐
│ 新市场预测...                  │
│                                │
│ 等待激活的市场                 │
│                                │
│ 👁️ 234  ⭐ 12  📊 45          │
│                                │
│  [激活中]  [表示感兴趣]        │
└────────────────────────────────┘
```

---

## 🚦 流动性指示器

| 价差 | 指示器 | 说明 |
|------|--------|------|
| < 2% | 🟢 | 高流动性，交易成本低 |
| 2-10% | 🟡 | 中等流动性 |
| ≥ 10% | 🔴 + ⚠️ | 低流动性，有警告 |

---

## 📝 使用示例

### 在首页显示市场列表

```typescript
// app/page.tsx
import { MarketCard } from '@/components/MarketCard';

export default function HomePage() {
  const [markets, setMarkets] = useState([]);

  return (
    <div className="grid grid-cols-3 gap-6">
      {markets.map(market => (
        <MarketCard 
          key={market.id} 
          market={market}
          showPrice={true}  // ✅ 显示实时价格
        />
      ))}
    </div>
  );
}
```

### 在分类页显示

```typescript
// app/markets/[category]/page.tsx
<div className="grid grid-cols-3 gap-6">
  {categoryMarkets.map(market => (
    <MarketCard 
      market={market}
      showPrice={market.blockchain_status === 'created'}
    />
  ))}
</div>
```

---

## ⚙️ 配置

### 刷新间隔

在 `hooks/useMarketPrice.ts` 中修改：

```typescript
// 当前：30秒刷新一次
const interval = setInterval(fetchPrice, 30000);

// 改为 10秒
const interval = setInterval(fetchPrice, 10000);

// 改为 1分钟
const interval = setInterval(fetchPrice, 60000);
```

### 禁用某个卡片的价格显示

```typescript
<MarketCard market={market} showPrice={false} />
```

---

## 🔧 调试

### 检查价格是否正常获取

打开浏览器控制台，你会看到：

```
✅ Supabase 客户端已初始化
🔥 实时价格更新: { bestBid: 0.52, bestAsk: 0.58, midPrice: 0.55 }
```

### 如果价格不显示

1. ✅ 检查市场是否已激活（`blockchain_status === 'created'`）
2. ✅ 检查 API `/api/orders/book` 是否正常
3. ✅ 检查数据库中是否有订单数据
4. ✅ 检查 `DATABASE_URL` 环境变量是否配置

---

## 📚 相关文档

- **详细文档**：`MARKET_CARD_PRICE_DISPLAY.md`
- **价格机制说明**：`LUMI_PRICING_MECHANISM.md`
- **部署指南**：`VERCEL_错误快速修复.md`

---

## ✅ 测试清单

在部署前检查：

- [ ] MarketCard 在已激活市场显示价格
- [ ] MarketCard 在未激活市场不显示价格
- [ ] 价格每30秒自动刷新
- [ ] 流动性指示器正确显示（🟢🟡🔴）
- [ ] 价差 >= 10% 时显示警告
- [ ] YES% + NO% = 100%
- [ ] 买价 < 中间价 < 卖价

---

## 🚀 部署到 Vercel

```bash
# 1. 提交代码
git add .
git commit -m "feat: 添加市场卡片实时价格显示"
git push

# 2. Vercel 自动部署

# 3. 确保环境变量已配置：
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL ⚠️ 必需！
```

---

## 🎉 完成！

你的市场卡片现在可以：

1. ✅ 显示实时价格和概率
2. ✅ 显示买价、卖价、价差
3. ✅ 显示流动性指标
4. ✅ 价差过大时自动警告
5. ✅ 每30秒自动刷新
6. ✅ 优雅地处理错误
7. ✅ 性能优化（条件加载）

**准备好部署了！** 🚀

---

**版本**：1.0  
**日期**：2025-10-29  
**作者**：LUMI Team

