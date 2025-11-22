# 🎨 LUMI 设计系统使用指南

## 概述

本文档介绍如何使用 LUMI 优化后的设计系统，包括颜色系统、字体系统和间距系统。

---

## 🎨 颜色系统

### CSS 变量

```css
/* 主色调 */
--color-primary: #facc15;    /* 金色 */
--color-success: #22c55e;    /* 绿色 */
--color-danger: #ef4444;     /* 红色 */
--color-info: #3b82f6;       /* 蓝色 */

/* 卡片样式 */
--card-bg: rgba(26, 26, 26, 0.8);
--card-border: rgba(250, 204, 21, 0.2);

/* 背景渐变 */
--bg-gradient: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%);
```

### Tailwind 类名

```tsx
// 主色调
<div className="text-primary">金色文字</div>
<div className="bg-primary-500">金色背景（50% 透明度）</div>

// 成功/危险/信息
<div className="text-success">绿色文字</div>
<div className="text-danger">红色文字</div>
<div className="text-info">蓝色文字</div>

// 卡片样式
<div className="bg-card border border-card">卡片</div>

// 背景渐变
<div className="bg-lumi-gradient">渐变背景</div>
```

### 使用示例

```tsx
// 价格显示（金色）
<div className="text-primary font-mono text-2xl">
  $0.65
</div>

// 成功提示（绿色）
<div className="bg-success-100 text-success border border-success-300 rounded-lg p-4">
  交易成功！
</div>

// 错误提示（红色）
<div className="bg-danger-100 text-danger border border-danger-300 rounded-lg p-4">
  交易失败
</div>

// 信息卡片（蓝色）
<div className="bg-info-100 text-info border border-info-300 rounded-lg p-4">
  提示信息
</div>
```

---

## 📝 字体系统

### 字体配置

- **标题字体**: Inter (700 字重，-0.02em 字间距)
- **数字字体**: JetBrains Mono (等宽数字)
- **默认字体**: Inter

### 使用方式

```tsx
// 标题（自动应用 Inter + 700 字重）
<h1>市场标题</h1>
<h2>子标题</h2>

// 数字显示（自动应用 JetBrains Mono）
<div className="font-mono">123.45</div>
<div className="price">$0.65</div>
<div className="number">1,234</div>
<div className="quantity">100 shares</div>

// 使用 data 属性自动应用等宽字体
<div data-price="0.65">$0.65</div>
<div data-quantity="100">100</div>
<div data-amount="1234.56">1,234.56</div>
```

### 字体变量

```css
/* CSS 变量 */
--font-inter: 'Inter', sans-serif;
--font-jetbrains-mono: 'JetBrains Mono', monospace;
```

---

## 📏 间距系统

### CSS 变量

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Tailwind 类名

```tsx
// 使用间距变量
<div className="p-xs">4px padding</div>
<div className="p-sm">8px padding</div>
<div className="p-md">16px padding</div>
<div className="p-lg">24px padding</div>
<div className="p-xl">32px padding</div>
<div className="p-2xl">48px padding</div>
<div className="p-3xl">64px padding</div>

// 组合使用
<div className="m-md p-lg">外边距 16px，内边距 24px</div>
<div className="gap-md">子元素间距 16px</div>
```

### 使用示例

```tsx
// 卡片布局
<div className="p-lg space-y-md">
  <h2 className="mb-md">标题</h2>
  <p className="mb-sm">内容</p>
</div>

// 按钮间距
<div className="flex gap-sm">
  <button>按钮1</button>
  <button>按钮2</button>
</div>
```

---

## 🎯 完整示例

### 市场卡片组件

```tsx
export function MarketCard({ title, price, change }: MarketCardProps) {
  return (
    <div className="bg-card border border-card rounded-xl p-lg">
      {/* 标题 - 使用 Inter 700 */}
      <h3 className="text-white mb-md">{title}</h3>
      
      {/* 价格 - 使用 JetBrains Mono */}
      <div className="text-primary font-mono text-2xl mb-sm">
        ${price.toFixed(2)}
      </div>
      
      {/* 变化 - 使用颜色系统 */}
      <div className={`text-sm ${
        change >= 0 ? 'text-success' : 'text-danger'
      }`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  );
}
```

### 订单簿行组件

```tsx
export function OrderBookRow({ price, quantity, total }: OrderBookRowProps) {
  return (
    <div className="p-sm hover:bg-white/5 rounded transition-colors">
      {/* 价格 - 等宽数字 */}
      <span className="text-primary font-mono font-semibold">
        {price.toFixed(4)}
      </span>
      
      {/* 数量 - 等宽数字 */}
      <span className="text-gray-300 font-mono text-right">
        {quantity.toFixed(2)}
      </span>
      
      {/* 累计 - 等宽数字 */}
      <span className="text-gray-500 font-mono text-xs text-right">
        {total.toFixed(2)}
      </span>
    </div>
  );
}
```

### 交易表单组件

```tsx
export function TradeForm() {
  return (
    <div className="bg-card border border-card rounded-xl p-xl space-y-lg">
      {/* 标题 */}
      <h2 className="text-white mb-lg">下单</h2>
      
      {/* 价格显示 */}
      <div className="bg-white/5 border-2 border-primary-200 rounded-lg p-md">
        <div className="text-primary font-mono text-3xl font-bold">
          $0.65
        </div>
      </div>
      
      {/* 按钮组 */}
      <div className="flex gap-sm">
        <button className="flex-1 bg-success text-white py-md rounded-lg font-semibold">
          买入
        </button>
        <button className="flex-1 bg-danger text-white py-md rounded-lg font-semibold">
          卖出
        </button>
      </div>
    </div>
  );
}
```

---

## 🔧 迁移指南

### 从旧颜色迁移

```tsx
// ❌ 旧代码
<div className="text-yellow-400">价格</div>
<div className="bg-gray-800">卡片</div>

// ✅ 新代码
<div className="text-primary">价格</div>
<div className="bg-card border border-card">卡片</div>
```

### 从旧间距迁移

```tsx
// ❌ 旧代码
<div className="p-4">内容</div>
<div className="p-6">内容</div>

// ✅ 新代码（更语义化）
<div className="p-md">内容</div>
<div className="p-lg">内容</div>
```

### 从旧字体迁移

```tsx
// ❌ 旧代码
<div className="font-mono">123.45</div>

// ✅ 新代码（自动应用等宽数字）
<div className="price">123.45</div>
// 或
<div data-price="123.45">123.45</div>
```

---

## 📚 最佳实践

### 1. 颜色使用

- ✅ 使用语义化颜色：`text-primary` 而不是 `text-yellow-400`
- ✅ 使用透明度变体：`bg-primary-200` 而不是硬编码 rgba
- ✅ 保持一致性：所有价格使用 `text-primary`

### 2. 字体使用

- ✅ 价格、数量、金额使用 `font-mono` 或 `.price` 类
- ✅ 标题使用默认的 `h1-h6` 标签（自动应用 Inter 700）
- ✅ 正文使用默认字体（Inter）

### 3. 间距使用

- ✅ 使用语义化间距：`p-md` 而不是 `p-4`
- ✅ 保持一致性：相同类型的元素使用相同间距
- ✅ 使用间距变量：`gap-md` 而不是 `gap-4`

---

## 🎨 设计令牌参考

### 颜色令牌

| 用途 | 颜色 | CSS 变量 | Tailwind 类 |
|------|------|----------|-------------|
| 主色调 | 金色 #facc15 | `--color-primary` | `text-primary`, `bg-primary-*` |
| 成功 | 绿色 #22c55e | `--color-success` | `text-success`, `bg-success-*` |
| 危险 | 红色 #ef4444 | `--color-danger` | `text-danger`, `bg-danger-*` |
| 信息 | 蓝色 #3b82f6 | `--color-info` | `text-info`, `bg-info-*` |

### 间距令牌

| 大小 | 值 | CSS 变量 | Tailwind 类 |
|------|-----|----------|-------------|
| XS | 4px | `--spacing-xs` | `p-xs`, `m-xs`, `gap-xs` |
| SM | 8px | `--spacing-sm` | `p-sm`, `m-sm`, `gap-sm` |
| MD | 16px | `--spacing-md` | `p-md`, `m-md`, `gap-md` |
| LG | 24px | `--spacing-lg` | `p-lg`, `m-lg`, `gap-lg` |
| XL | 32px | `--spacing-xl` | `p-xl`, `m-xl`, `gap-xl` |
| 2XL | 48px | `--spacing-2xl` | `p-2xl`, `m-2xl`, `gap-2xl` |
| 3XL | 64px | `--spacing-3xl` | `p-3xl`, `m-3xl`, `gap-3xl` |

### 字体令牌

| 用途 | 字体 | CSS 变量 | 使用方式 |
|------|------|----------|----------|
| 标题 | Inter 700 | `--font-inter` | `<h1>-<h6>` |
| 数字 | JetBrains Mono | `--font-jetbrains-mono` | `.font-mono`, `.price`, `.number` |
| 正文 | Inter | `--font-inter` | 默认 |

---

## ✅ 总结

通过使用统一的设计系统，我们可以：

1. **保持一致性** - 所有组件使用相同的颜色、字体和间距
2. **易于维护** - 修改 CSS 变量即可全局更新
3. **提高可读性** - 语义化的类名更易理解
4. **优化性能** - 使用 CSS 变量减少重复代码

开始使用新的设计系统，让 LUMI 界面更加统一和专业！

