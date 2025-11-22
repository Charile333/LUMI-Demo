# 🎉 LUMI Toast通知系统文档

## 功能概述

LUMI预测市场的Toast通知系统提供了优雅的顶部滑出通知，替代了传统的`alert()`弹窗，支持双语、动画效果和自定义操作。

## ✨ 核心特性

### 1. **通知类型**
- ✅ **Success** - 成功通知（绿色）
- ❌ **Error** - 错误通知（红色）
- ⚠️ **Warning** - 警告通知（黄色）
- ℹ️ **Info** - 信息通知（蓝色）

### 2. **视觉效果**
- 🎭 从顶部平滑滑入动画
- 💫 退出时淡出动画
- 🌈 根据类型自动配色
- ⏱️ 自动倒计时进度条
- 🎨 毛玻璃背景效果

### 3. **交互功能**
- ✖️ 手动关闭按钮
- ⏰ 自动消失（可配置时长）
- 🔗 支持外部链接按钮
- 🎯 支持自定义操作按钮
- 📱 多条通知堆叠显示

### 4. **国际化支持**
- 🌍 完整的中英文双语支持
- 🔄 自动根据系统语言切换
- 📝 所有文本支持翻译

## 📦 组件架构

### Toast Provider
```tsx
<ToastProvider>
  {/* 应用内容 */}
</ToastProvider>
```

### Toast Hook
```tsx
const toast = useToast();

// 使用方法
toast.success('操作成功！');
toast.error('操作失败！');
toast.warning('请注意！');
toast.info('提示信息');
```

## 🎯 使用示例

### 基础使用

```tsx
'use client';

import { useToast } from '@/components/Toast';

export default function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('订单创建成功！');
  };

  const handleError = () => {
    toast.error('订单创建失败，请重试');
  };

  return (
    <div>
      <button onClick={handleSuccess}>成功示例</button>
      <button onClick={handleError}>失败示例</button>
    </div>
  );
}
```

### 自定义时长

```tsx
// 显示8秒
toast.success('交易成功！', {
  duration: 8000
});

// 不自动关闭（duration: 0）
toast.info('请查看重要信息', {
  duration: 0
});
```

### 带外部链接

```tsx
toast.success('交易已提交！', {
  duration: 10000,
  link: {
    label: '在区块浏览器查看',
    url: 'https://etherscan.io/tx/0x123...'
  }
});
```

### 带自定义操作

```tsx
toast.info('有新消息', {
  duration: 5000,
  action: {
    label: '查看',
    onClick: () => {
      router.push('/messages');
    }
  }
});
```

### 多行文本

```tsx
toast.success(
  `🎉 交易成功！\n\n使用 Polymarket 官方 CTF Exchange\n\n交易哈希: 0x123...`,
  { duration: 8000 }
);
```

## 🎨 视觉设计

### 通知样式配置

| 类型 | 图标颜色 | 背景色 | 边框色 |
|-----|---------|--------|--------|
| Success | `text-green-400` | `bg-green-500/20` | `border-green-500/50` |
| Error | `text-red-400` | `bg-red-500/20` | `border-red-500/50` |
| Warning | `text-yellow-400` | `bg-yellow-500/20` | `border-yellow-500/50` |
| Info | `text-blue-400` | `bg-blue-500/20` | `border-blue-500/50` |

### 动画效果

**进入动画**
```css
animate-in slide-in-from-top-4 fade-in duration-300
```

**退出动画**
```css
translate-y-[-20px] opacity-0 scale-95
transition: all 300ms ease-out
```

**进度条动画**
```css
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
```

## 🔧 API 参考

### useToast()

返回一个包含以下方法的对象：

```typescript
interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}
```

### ToastOptions

```typescript
interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;  // 毫秒，0表示不自动关闭
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    url: string;
  };
}
```

## 📝 交易表单集成示例

### OrderForm.tsx 中的使用

```tsx
// 1. 导入Toast
import { useToast } from '@/components/Toast';

// 2. 使用Hook
const toast = useToast();

// 3. 成功通知
toast.success(
  `${t('orderForm.tradeSuccess')}\n\n${t('orderForm.usingPolymarket')}\n\n${t('orderForm.txHash')}: ${txHash.slice(0, 10)}...`,
  {
    duration: 8000,
    link: explorerUrl ? {
      label: t('orderForm.viewOnExplorer'),
      url: explorerUrl
    } : undefined
  }
);

// 4. 错误通知
toast.error(`${t('orderForm.orderFailed')}:\n\n${error.message}`);

// 5. 警告通知
toast.warning(t('orderForm.connectWalletFirst'));
```

## 🌍 国际化

### 翻译键

**中文 (zh.json)**
```json
{
  "orderForm": {
    "tradeSuccess": "🎉 交易成功！",
    "usingPolymarket": "使用 Polymarket 官方 CTF Exchange",
    "txHash": "交易哈希",
    "viewOnExplorer": "在区块浏览器查看",
    "orderSuccess": "✅ 下单成功！",
    "orderFailed": "❌ 下单失败",
    "userCancelled": "❌ 用户取消了签名"
  }
}
```

**英文 (en.json)**
```json
{
  "orderForm": {
    "tradeSuccess": "🎉 Trade Successful!",
    "usingPolymarket": "Using Polymarket Official CTF Exchange",
    "txHash": "Transaction Hash",
    "viewOnExplorer": "View on Block Explorer",
    "orderSuccess": "✅ Order placed successfully!",
    "orderFailed": "❌ Order failed",
    "userCancelled": "❌ User cancelled signature"
  }
}
```

## 🎯 最佳实践

### 1. 选择合适的类型
- ✅ **Success**: 操作成功（订单提交、交易完成）
- ❌ **Error**: 操作失败（网络错误、验证失败）
- ⚠️ **Warning**: 需要用户注意（钱包未连接、权限不足）
- ℹ️ **Info**: 一般信息（提示、引导）

### 2. 合适的时长
- **快速操作**: 3-5秒
- **重要信息**: 6-8秒
- **需要行动**: 8-10秒或不自动关闭
- **错误信息**: 不自动关闭（duration: 0）

### 3. 文本格式
- 使用表情符号增加可读性 🎉
- 重要信息换行显示 `\n\n`
- 简洁明了，避免过长
- 关键数据截短显示（哈希值等）

### 4. 用户体验
- 避免同时显示过多通知
- 提供操作按钮而不是纯文本
- 关键操作提供链接查看详情
- 错误信息提供重试机会

## 🔄 迁移指南

### 从 alert() 迁移

**之前**
```tsx
alert('订单创建成功！');
```

**之后**
```tsx
toast.success('订单创建成功！');
```

**之前**
```tsx
alert(`交易成功！\n\n交易哈希: ${txHash}`);
```

**之后**
```tsx
toast.success(
  `交易成功！\n\n交易哈希: ${txHash.slice(0, 10)}...`,
  {
    link: {
      label: '查看详情',
      url: explorerUrl
    }
  }
);
```

## 🐛 故障排除

### 问题：Toast不显示
**解决方案**: 确保在`ToastProvider`内使用
```tsx
<ToastProvider>
  <YourComponent />
</ToastProvider>
```

### 问题：多语言不工作
**解决方案**: 确保翻译键已添加到 `locales/*.json`

### 问题：动画卡顿
**解决方案**: 检查是否有大量Toast同时显示，建议限制为3-5个

## 📈 性能优化

1. **防止重复通知**: 同一操作不要连续触发多个Toast
2. **限制显示数量**: 最多同时显示5个Toast
3. **及时清理**: 使用合适的duration，避免堆积
4. **懒加载图标**: FontAwesome按需加载

## 🎨 自定义样式

Toast组件使用Tailwind CSS，可以通过修改源码自定义：

```tsx
// components/Toast.tsx

// 修改位置
<div className="fixed top-4 left-1/2 ...">  // 顶部居中
<div className="fixed bottom-4 right-4 ...">  // 右下角
<div className="fixed top-20 right-4 ...">  // 右上角

// 修改宽度
<div className="... max-w-md ...">  // 中等
<div className="... max-w-lg ...">  // 大
<div className="... max-w-sm ...">  // 小
```

## 📞 技术支持

如有问题或建议，请：
1. 查看此文档
2. 检查控制台错误信息
3. 联系开发团队

---

**💡 提示**: Toast通知系统大大提升了用户体验，请充分利用其功能为用户提供清晰的操作反馈！











































