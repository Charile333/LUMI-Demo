# 📏 Market 页面间距调整

## ✅ 已调整的内容

### Event 详细页（卡片详细页）

**文件**: `market/app/event/[eventId]/page.tsx`

**调整**:
- 原来: `py-6` (上下各 24px)
- 现在: `pt-32 pb-6` (上 128px，下 24px)

**原因**:
- 导航栏是固定定位 (`fixed top-0`)
- 导航栏高度约 80-100px
- 需要更多顶部间距避免内容被导航栏遮挡

---

## 📐 间距说明

### 导航栏高度
- 顶部 Logo 区域: `80px` (height: 80px)
- 分类导航区域: 约 `48px`
- **总高度**: 约 `128px` (pt-32)

### 页面间距设置

| 页面 | 顶部间距 | 说明 |
|------|---------|------|
| Market 首页 | `9rem` (144px) | 全局 body padding |
| Event 详细页 | `pt-32` (128px) | main 元素 padding |
| Landing 主页 | `0` | 无需间距（全屏背景） |

---

## 🚀 刷新浏览器查看

**按 Ctrl + Shift + R** 刷新浏览器

访问任意 event 详细页，比如：
- http://localhost:3000/event/1
- http://localhost:3000/event/2

现在详细页的内容应该：
- ✅ 不被导航栏遮挡
- ✅ 有合适的顶部间距
- ✅ 面包屑导航可见
- ✅ 整体布局舒适

---

## 🎨 视觉效果

```
╔════════════════════════════════════════════╗
║  [Logo]  [Search]  [Wallet] [Profile]    ║ ← 导航栏（固定）
║  [Categories: Automotive | Tech AI ...]   ║
╠════════════════════════════════════════════╣
║                                            ║ ← 128px 间距
║  ← Back | Automotive > Markets            ║ ← 面包屑
║                                            ║
║  Event Title                               ║ ← 内容区域
║  [Chart] [Trading Panel] [Comments]       ║
║  ...                                       ║
╚════════════════════════════════════════════╝
```

---

## 🔧 如需进一步调整

如果间距还不够或太多：

### 增加间距
```typescript
// 在 page.tsx 中修改
<main className="container mx-auto px-4 pt-36 pb-6">  // 144px
```

### 减少间距
```typescript
<main className="container mx-auto px-4 pt-28 pb-6">  // 112px
```

### 当前设置（推荐）
```typescript
<main className="container mx-auto px-4 pt-32 pb-6">  // 128px ✅
```

---

## 📱 响应式调整

如果需要在移动端使用不同的间距：

```typescript
<main className="container mx-auto px-4 pt-24 md:pt-32 pb-6">
```

- 移动端: `pt-24` (96px)
- 桌面端: `pt-32` (128px)

---

**调整完成时间**: 2025-10-19  
**状态**: ✅ 完成

