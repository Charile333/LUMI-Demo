# 紧凑交易弹窗 - 快速开始

## 🚀 立即使用

### 1️⃣ 查看效果

启动开发服务器：
```bash
npm run dev
```

访问任意市场列表页面，点击市场卡片上的"交易"按钮，即可看到新的紧凑交易弹窗。

### 2️⃣ 基本使用

#### 在市场卡片中
```typescript
import CompactTradeModal from '@/components/trading/CompactTradeModal';

// 市场卡片已自动集成，无需额外配置
// 点击"交易"按钮即可打开
```

#### 在自定义组件中
```typescript
'use client';

import { useState } from 'react';
import CompactTradeModal from '@/components/trading/CompactTradeModal';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        开始交易
      </button>

      <CompactTradeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        market={{
          id: 1,
          title: "您的市场标题",
          questionId: "market-1"
        }}
      />
    </>
  );
}
```

### 3️⃣ 交易流程

1. **打开弹窗**
   - 点击市场卡片的"交易"按钮

2. **选择方向**
   - 点击 `Buy` 或 `Sell` 按钮

3. **选择结果**
   - 点击 `YES` 或 `NO` 卡片
   - 查看实时价格

4. **输入数量**
   - 手动输入金额
   - 或点击快速按钮（$10, $25, $50, $100）

5. **查看预估**
   - 单价
   - 预估份额
   - 潜在收益

6. **确认交易**
   - 点击底部交易按钮
   - 连接钱包（首次）
   - 签名确认
   - 等待完成

### 4️⃣ 与旧版对比

| 特性 | 旧版 QuickTradeModal | 新版 CompactTradeModal |
|------|---------------------|----------------------|
| 买卖切换 | ❌ 只能买入 | ✅ 支持买卖 |
| YES/NO选择 | ⚠️ 需提前选择 | ✅ 弹窗内选择 |
| 设计风格 | 常规 | ✅ 现代紧凑 |
| 操作步骤 | 3步 | ✅ 集中在一个弹窗 |
| 信息展示 | 分散 | ✅ 层次清晰 |

### 5️⃣ 常见问题

#### Q: 如何修改默认金额？
```typescript
// 在 CompactTradeModal.tsx 中
const [amount, setAmount] = useState('10'); // 修改这里
```

#### Q: 如何修改快速金额按钮？
```typescript
// 在 CompactTradeModal.tsx 中
{[10, 25, 50, 100].map((preset) => ( // 修改数组
  <button onClick={() => setAmount(preset.toString())}>
    ${preset}
  </button>
))}
```

#### Q: 如何自定义样式？
```typescript
// 所有 Tailwind 类都可以在组件中直接修改
// 例如修改弹窗宽度：
<div className="w-full max-w-md"> // 改为 max-w-md 或其他
```

#### Q: 如何禁用某个功能？
```typescript
// 例如禁用 Sell 功能
<button
  onClick={() => setSide('sell')}
  disabled={true} // 添加 disabled
  className="..."
>
  Sell
</button>
```

### 6️⃣ 测试检查清单

- [ ] 打开弹窗动画是否流畅
- [ ] Buy/Sell 切换是否正常
- [ ] YES/NO 选择是否正常
- [ ] 价格是否正确显示
- [ ] 数量输入是否正常
- [ ] 快速按钮是否生效
- [ ] 预估信息是否准确
- [ ] 交易按钮是否可点击
- [ ] 钱包连接是否正常
- [ ] 订单提交是否成功
- [ ] 关闭按钮是否有效
- [ ] 点击背景是否关闭

### 7️⃣ 故障排查

#### 弹窗不显示
```typescript
// 检查 isOpen 状态
console.log('Modal open:', isOpen);

// 检查是否在客户端
console.log('Mounted:', mounted);
```

#### 价格显示为 "..."
```typescript
// 检查 API 是否正常
// 查看浏览器控制台的网络请求
// 检查 /api/orders/book 端点
```

#### 无法提交订单
```typescript
// 检查钱包是否连接
console.log('Wallet:', window.ethereum);

// 检查网络连接
// 查看控制台错误信息
```

### 8️⃣ 进阶定制

#### 添加新的快速金额
```typescript
// 在 CompactTradeModal.tsx 中
{[5, 10, 20, 50, 100, 200].map((preset) => (
  <button
    key={preset}
    onClick={() => setAmount(preset.toString())}
    className="flex-1 px-2 py-1.5 text-xs..."
  >
    ${preset}
  </button>
))}
```

#### 修改默认价格（加载失败时）
```typescript
// 在 CompactTradeModal.tsx 中
setYesPrice(0.50); // 修改为你想要的默认价格
setNoPrice(0.50);
```

#### 添加自定义字段
```typescript
// 在预估信息区添加新字段
<div className="flex justify-between">
  <span className="text-gray-400">手续费</span>
  <span className="font-semibold text-white">
    ${(parseFloat(amount) * 0.02).toFixed(2)}
  </span>
</div>
```

### 9️⃣ 性能建议

1. **价格缓存**: 考虑缓存价格数据，减少API请求
2. **防抖处理**: 输入金额时添加防抖，避免频繁计算
3. **懒加载**: 只在需要时渲染弹窗内容
4. **预加载**: 可以在页面加载时预先获取价格

### 🔟 部署注意事项

1. 确保所有 API 端点正常工作
2. 检查钱包连接功能
3. 测试不同网络环境
4. 验证移动端显示效果
5. 检查翻译是否完整

## 📚 相关文档

- [详细设计文档](./COMPACT_TRADE_MODAL.md)
- [视觉设计参考](./COMPACT_TRADE_MODAL_VISUAL.md)
- [更新日志](../COMPACT_TRADE_MODAL_CHANGELOG.md)

## 💡 提示

- 保持代码简洁，避免过度定制
- 遵循现有的设计规范
- 测试各种边界情况
- 收集用户反馈并持续改进

---

**开始构建您的交易体验吧！** 🚀

