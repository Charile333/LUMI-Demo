# 事件列表数据修复

## ✅ 已修复的问题

### 1. **crashPercentage 百分比计算错误**

#### 问题
```json
{
  "asset": "BTC/USDT",
  "crashPercentage": "-2522.0"  // ❌ 错误：显示-2522%
}
{
  "asset": "ETH/USDT", 
  "crashPercentage": "-4500.0"  // ❌ 错误：显示-4500%
}
```

#### 原因
- 数据库中有两种格式：
  - **小数格式**: `price_change: -0.2522` (表示-25.22%)
  - **百分比格式**: `price_change: -25.22` (已经是百分比)
- 旧代码统一乘以100，导致百分比格式的数据被重复计算

#### 解决方案
```javascript
// 智能判断数据格式
let percentageValue = priceChange;
if (Math.abs(priceChange) < 1) {
  // 小数形式（如-0.2522），转换为百分比
  percentageValue = priceChange * 100;
}
// 否则已经是百分比（如-25.22），直接使用
```

#### 修复后
```json
{
  "asset": "BTC/USDT",
  "crashPercentage": "-25.2"  // ✅ 正确
}
{
  "asset": "ETH/USDT",
  "crashPercentage": "-45.0"  // ✅ 正确
}
```

### 2. **duration 持续时间格式优化**

#### 问题
```json
{
  "duration": "1小时"  // 在某些环境显示为乱码
}
```

#### 解决方案
```javascript
// 使用英文缩写避免编码问题
const duration = `${durationHours}h`;  // "1h", "3h", "8h"
```

#### 修复后
```json
{
  "duration": "1h"   // ✅ 简洁且无编码问题
}
```

### 3. **持续时间上限调整**

#### 之前
```javascript
const duration = Math.max(1, Math.min(sameDayEvents.length * 0.5, 6));
// 最大6小时
```

#### 现在
```javascript
const duration = Math.max(1, Math.min(sameDayEvents.length * 0.5, 8));
// 最大8小时，更符合实际闪崩持续时间
```

## 📊 修复前后对比

### 2025-10-10 BTC闪崩

| 字段 | 修复前 | 修复后 |
|------|--------|--------|
| crashPercentage | "-2522.0" | "-25.2" |
| duration | "1?��????" | "1h" |
| 显示效果 | BTC/USDT -2522% | BTC/USDT -25.2% |

### 2025-10-10 ETH闪崩

| 字段 | 修复前 | 修复后 |
|------|--------|--------|
| crashPercentage | "-4500.0" | "-45.0" |
| duration | "1?��????" | "1h" |
| 显示效果 | ETH/USDT -4500% | ETH/USDT -45.0% |

### 历史事件（已正确）

| 日期 | 资产 | 百分比 | 状态 |
|------|------|--------|------|
| 2024-08-05 | BTC/USDT | -15.8% | ✅ 正常 |
| 2024-07-04 | ETH/USDT | -12.3% | ✅ 正常 |
| 2023-11-10 | BTC/USDT | -8.5% | ✅ 正常 |
| 2022-11-09 | BTC/USDT | -23.5% | ✅ 正常 |

## 🔍 数据格式说明

### details.price_change 的两种格式

#### 格式1：小数形式（旧历史数据）
```json
{
  "details": {
    "price_change": -0.158,  // 表示-15.8%
    "current_price": 52200,
    "previous_price": 62000
  }
}
```
**处理**：乘以100转换为百分比

#### 格式2：百分比形式（新事件数据）
```json
{
  "details": {
    "price_change": -25.22,  // 直接表示-25.22%
    "peak_price": 115000,
    "bottom_price": 86000
  }
}
```
**处理**：直接使用，不需要转换

## 💡 为什么会有两种格式？

1. **历史数据**（2018-2024）：从 `import-historical-crashes.js` 导入，使用小数格式
2. **最新事件**（2025-10-10/11）：从 `add-oct-real-crash.js` 添加，使用百分比格式

## 🚀 测试验证

### API测试
```bash
curl http://localhost:3000/api/alerts/crash-events
```

### 预期结果
```json
{
  "success": true,
  "data": [
    {
      "id": "BTCUSDT_2025-10-11_1",
      "date": "2025-10-11",
      "asset": "BTC/USDT",
      "crashPercentage": "0.0",     // ✅ 清算事件，无价格变化
      "duration": "1h",
      "description": "闪崩期间触发大规模杠杆清算..."
    },
    {
      "id": "BTCUSDT_2025-10-10_1",
      "date": "2025-10-10",
      "asset": "BTC/USDT",
      "crashPercentage": "-25.2",   // ✅ 正确显示-25.2%
      "duration": "1h",
      "description": "BTC价格在数小时内暴跌25%..."
    },
    {
      "id": "ETHUSDT_2025-10-10_1",
      "date": "2025-10-10",
      "asset": "ETH/USDT",
      "crashPercentage": "-45.0",   // ✅ 正确显示-45%
      "duration": "1h",
      "description": "ETH跟随BTC暴跌..."
    }
  ]
}
```

## 📝 后续优化建议

### 1. 统一数据格式
在数据导入时统一使用一种格式（建议百分比格式）

### 2. 数据验证
添加数据范围验证：
```javascript
if (Math.abs(percentageValue) > 100) {
  console.warn('Invalid percentage value:', percentageValue);
}
```

### 3. 国际化支持
使用配置文件管理不同语言的时间单位：
```javascript
const durationText = {
  'zh-CN': '小时',
  'en-US': 'h',
  'ja-JP': '時間'
};
```

---

**✅ 修复完成！** 服务器已重启，刷新页面即可看到正确的数据！

**测试地址**：http://localhost:3000/black-swan









