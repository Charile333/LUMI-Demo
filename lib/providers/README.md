# 📦 数据源 Providers

这个目录包含所有外部数据源的适配器。

---

## 📁 当前已有的 Providers

| Provider | 文件 | 状态 | 说明 |
|----------|------|------|------|
| 自定义 | `custom.ts` | ✅ 使用中 | Supabase 数据库 |
| Polymarket | `polymarket.ts` | ✅ 使用中 | Polymarket API |

---

## 🚀 添加新的 API 数据源

### 三步法

#### 1️⃣ 创建 Provider 文件

```bash
# 复制模板
cp TEMPLATE.ts your-api.ts
```

修改以下内容：
- 类名改为 `YourApiProvider`
- `name` 改为 `'your-api'`
- `API_BASE_URL` 改为你的 API 地址
- 实现 `fetchMarkets()` 和 `transformMarkets()`

#### 2️⃣ 注册 Provider

在 `index.ts` 中添加：

```typescript
import { YourApiProvider } from './your-api';

export const providers = {
  custom: new CustomProvider(),
  polymarket: new PolymarketProvider(),
  'your-api': new YourApiProvider(),  // 👈 添加这行
};
```

#### 3️⃣ 配置使用

在 `lib/aggregator/config.ts` 中配置：

```typescript
'tech-ai': {
  providers: ['custom', 'polymarket', 'your-api'],  // 👈 添加
  quotas: {
    custom: 12,
    polymarket: 10,
    'your-api': 5  // 👈 设置配额
  },
  minCustom: 6
}
```

---

## 📝 Provider 必须实现的接口

```typescript
interface IDataProvider {
  name: string;                           // Provider 名称
  supportedCategories: CategoryType[];    // 支持的分类
  defaultPriority: number;                // 默认优先级
  
  // 获取市场数据
  fetchMarkets(category: CategoryType, limit: number): Promise<Market[]>;
  
  // 检查 API 是否可用
  isAvailable(): Promise<boolean>;
}
```

详细定义见 `base.ts`。

---

## 🎯 最佳实践

### ✅ 错误处理

```typescript
async fetchMarkets(category: CategoryType, limit: number): Promise<Market[]> {
  try {
    // API 调用
  } catch (error) {
    console.error('[YourProvider] 错误:', error);
    return []; // 返回空数组，不影响其他数据源
  }
}
```

### ✅ 日志记录

```typescript
console.log(`[YourProvider] 开始获取 ${category} 数据`);
console.log(`[YourProvider] 成功获取 ${markets.length} 条`);
console.error(`[YourProvider] API 错误: ${response.status}`);
```

### ✅ 数据转换

确保返回的数据符合 `Market` 接口：

```typescript
return {
  id: `your-api-${raw.id}`,           // 加前缀避免冲突
  title: raw.question,
  source: 'your-api',                  // 标识数据来源
  categoryType: category,              // 使用传入的分类
  // ... 其他必填字段
};
```

### ✅ 缓存控制

```typescript
const response = await fetch(url, {
  cache: 'no-store'  // 不使用浏览器缓存
});
```

系统有独立的缓存层（5分钟），不需要在 Provider 层缓存。

---

## 🔧 API Key 配置

如果 API 需要认证：

### 1. 添加环境变量

`.env.local`:
```env
YOUR_API_KEY=your_key_here
```

### 2. 在 Provider 中使用

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${process.env.YOUR_API_KEY}`
  }
});
```

---

## 🧪 测试

### 方法 1: 使用测试页面

1. 访问 `http://localhost:3000/unified-test`
2. 选择配置了新 API 的分类
3. 点击"获取数据"
4. 查看是否有新 API 的数据

### 方法 2: 直接测试 API

```typescript
// 创建测试文件 test-your-api.ts
import { YourApiProvider } from './lib/providers/your-api';

const provider = new YourApiProvider();

async function test() {
  const available = await provider.isAvailable();
  console.log('API 可用:', available);
  
  const markets = await provider.fetchMarkets('tech-ai', 10);
  console.log('获取到市场数据:', markets.length);
  console.log('第一条数据:', markets[0]);
}

test();
```

---

## 📚 参考资料

- **接口定义**: `base.ts`
- **参考实现**: `polymarket.ts`
- **模板文件**: `TEMPLATE.ts`
- **配置说明**: `../aggregator/config.ts`
- **完整教程**: `/ADD_API_EXAMPLE.md`

---

## 🎯 常见数据源

可以考虑集成的预测市场平台：

- [Kalshi](https://kalshi.com) - 美国合规预测市场
- [Metaculus](https://www.metaculus.com) - 社区预测平台
- [Manifold Markets](https://manifold.markets) - 免费预测市场
- [PredictIt](https://www.predictit.org) - 政治预测市场
- [Augur](https://augur.net) - 去中心化预测市场

---

**提示：** 所有 Provider 都是独立的，出错不会影响其他数据源的正常工作。

