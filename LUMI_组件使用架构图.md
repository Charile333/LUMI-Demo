# 🏗️ LUMI 如何使用三大官方组件

> 详细说明何时、何地、如何使用 UMA、CTF Exchange、Conditional Tokens

---

## 📊 组件职责划分

### 1️⃣ Conditional Tokens (条件代币系统)
**用途**: 创建市场、管理代币、记录结果

**使用场景**:
- ✅ 创建市场时（一次性）
- ✅ 查询市场元数据时（读取）
- ✅ 市场结算后（一次性）
- ❌ **不需要在列表页频繁调用**

### 2️⃣ CTF Exchange (交易所)
**用途**: 执行订单、链上结算

**使用场景**:
- ✅ 用户实际交易时（链上结算）
- ✅ 批量结算订单时（后台任务）
- ❌ **不需要在列表页调用**
- ❌ **不需要每次浏览都调用**

### 3️⃣ UMA Oracle (预言机)
**用途**: 市场到期后获取真实世界结果

**使用场景**:
- ✅ 市场到期时（请求一次）
- ✅ 检查结算状态时（读取）
- ❌ **不需要在列表页调用**
- ❌ **不在交易时调用**

---

## 🎯 正确的使用方式

### ❌ 错误方式（不要这样做）

```typescript
// ❌ 不要在市场列表页面直接调用区块链
export default function MarketListPage() {
  const [markets, setMarkets] = useState([]);
  
  useEffect(() => {
    // ❌ 每次渲染都调用区块链 - 太慢！
    const loadMarkets = async () => {
      const ctf = new ethers.Contract(CTF_ADDRESS, ABI, provider);
      const exchange = new ethers.Contract(EXCHANGE_ADDRESS, ABI, provider);
      
      // ❌ 这会导致页面加载非常慢
      for (let i = 0; i < 100; i++) {
        const market = await ctf.getMarket(i);
        const price = await exchange.getPrice(i);
        // ... 每个市场都调用区块链
      }
    };
    loadMarkets();
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

### ✅ 正确方式（应该这样做）

```typescript
// ✅ 使用数据库 + 适配器 + 缓存
export default function MarketListPage() {
  const [markets, setMarkets] = useState([]);
  
  useEffect(() => {
    const loadMarkets = async () => {
      // ✅ 从数据库/API 获取市场列表（快速）
      const response = await fetch('/api/markets');
      const data = await response.json();
      setMarkets(data);
    };
    loadMarkets();
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

---

## 🔄 完整的数据流程

### 场景 1: 用户浏览市场列表

```
用户访问 /grid-market
  ↓
前端调用 /api/markets
  ↓
后端从 Supabase 读取
  ↓
返回缓存的市场数据（快速！）
  ↓
显示市场列表

❌ 不调用 Conditional Tokens
❌ 不调用 CTF Exchange
❌ 不调用 UMA Oracle
```

**为什么？**
- 数据库查询 < 10ms
- 区块链查询 > 1000ms
- 100个市场 = 100秒 vs 0.1秒

---

### 场景 2: 创建新市场

```
管理员创建市场
  ↓
1. 在 Supabase 创建记录（数据库）
  ↓
2. 调用 RealUmaCTFAdapter.initialize()
  ↓
3. 适配器调用 Conditional Tokens.prepareCondition()
  ✅ 使用组件 1: Conditional Tokens
  ↓
4. 配置 UMA Oracle 为裁决者
  ✅ 使用组件 3: UMA Oracle（配置）
  ↓
5. 更新 Supabase 状态为 "blockchain_created"
  ↓
完成！市场已在区块链上

总调用次数：1次（创建时）
```

**代码示例**:
```typescript
// _dev_only_admin/create-market/page.tsx
const createMarket = async () => {
  // 1. 创建数据库记录
  const { data: market } = await supabase
    .from('markets')
    .insert({ title, description })
    .select()
    .single();
  
  // 2. 链上激活（调用 Conditional Tokens）
  const adapter = new ethers.Contract(ADAPTER_ADDRESS, ABI, signer);
  const tx = await adapter.initialize(
    questionId,
    title,
    description,
    2, // outcomes
    USDC_ADDRESS,
    reward
  );
  
  await tx.wait();
  
  // 3. 更新数据库状态
  await supabase
    .from('markets')
    .update({ blockchain_status: 'created', condition_id: conditionId })
    .eq('id', market.id);
};
```

---

### 场景 3: 用户查看市场详情

```
用户访问 /markets/123
  ↓
前端调用 /api/markets/123
  ↓
后端从 Supabase 读取基础信息（快速）
  ↓
[可选] 如需实时价格：
  ↓
  调用 BlockchainService.getMarketPrice()
    ↓
    读取 Conditional Tokens 状态（1次调用）
  ↓
显示市场详情

✅ 最多调用 1次 Conditional Tokens（可选）
❌ 不调用 CTF Exchange
❌ 不调用 UMA Oracle
```

**代码示例**:
```typescript
// app/markets/[id]/page.tsx
const MarketDetailPage = ({ params }) => {
  const [market, setMarket] = useState(null);
  const [price, setPrice] = useState(null);
  
  useEffect(() => {
    // 1. 从数据库获取基础信息（快速）
    const loadMarket = async () => {
      const response = await fetch(`/api/markets/${params.id}`);
      const data = await response.json();
      setMarket(data);
      
      // 2. [可选] 获取实时价格（如果需要）
      if (data.condition_id) {
        const blockchainService = new BlockchainService();
        const currentPrice = await blockchainService.getMarketPrice(
          data.condition_id
        );
        setPrice(currentPrice);
      }
    };
    
    loadMarket();
  }, [params.id]);
  
  return <div>{/* 显示市场详情 */}</div>;
};
```

---

### 场景 4: 用户下单交易

```
用户点击"买入 YES"
  ↓
1. 创建订单（链下签名，EIP-712）
  ↓
2. 提交到 Supabase（链下订单簿）
  ↓
3. WebSocket 通知匹配引擎
  ↓
4. 订单匹配成功
  ↓
5. [后台任务] 批量结算到 CTF Exchange
  ✅ 使用组件 2: CTF Exchange
  ↓
6. CTF Exchange 调用 Conditional Tokens 转移代币
  ✅ 使用组件 1: Conditional Tokens
  ↓
完成！用户获得代币

下单时：❌ 不直接调用区块链
结算时：✅ 后台批量调用 CTF Exchange
```

**代码示例**:
```typescript
// components/OrderBook/TradingForm.tsx
const handleBuy = async () => {
  // 1. 创建订单（链下签名）
  const order = {
    maker: userAddress,
    tokenId: market.tokenIds.YES,
    price: parseFloat(price),
    amount: parseFloat(amount),
    side: 'BUY',
    timestamp: Date.now()
  };
  
  // 2. EIP-712 签名（本地，不调用区块链）
  const signature = await signer._signTypedData(
    domain,
    orderTypes,
    order
  );
  
  // 3. 提交到数据库（快速）
  const { data } = await supabase
    .from('orders')
    .insert({
      market_id: marketId,
      user_address: userAddress,
      side: 'buy',
      price: price,
      amount: amount,
      signature: signature,
      status: 'pending'
    });
  
  // ✅ 订单创建完成！没有调用区块链
  // ✅ 后台任务会定期批量结算到 CTF Exchange
};
```

**后台结算脚本**:
```typescript
// scripts/settle-trades-cron.ts
async function settleBatch() {
  // 1. 查询待结算的交易
  const trades = await db.query(`
    SELECT * FROM trades 
    WHERE settled = false 
    LIMIT 20
  `);
  
  // 2. 批量调用 CTF Exchange（1次交易结算多笔订单）
  const exchange = new ethers.Contract(
    CTF_EXCHANGE_ADDRESS, // ✅ Polymarket 官方
    EXCHANGE_ABI,
    platformWallet
  );
  
  const tx = await exchange.fillOrders(
    orders,
    signatures,
    amounts
  );
  
  await tx.wait();
  
  // 3. 更新数据库
  await db.query(`
    UPDATE trades 
    SET settled = true 
    WHERE id = ANY($1)
  `, [tradeIds]);
}

// 每5分钟执行一次
setInterval(settleBatch, 5 * 60 * 1000);
```

---

### 场景 5: 市场结算

```
市场到期
  ↓
1. 管理员/提案者请求结算
  ↓
2. 调用 RealUmaCTFAdapter.requestOraclePrice()
  ↓
3. 适配器调用 UMA Oracle.requestPrice()
  ✅ 使用组件 3: UMA Oracle
  ↓
4. 等待挑战期（2小时）
  ↓
5. 提案者提交答案到 UMA Oracle
  ✅ 使用组件 3: UMA Oracle
  ↓
6. [可能] 有人争议 → UMA 投票
  ✅ 使用组件 3: UMA Oracle
  ↓
7. 获取最终结果
  ↓
8. 调用 RealUmaCTFAdapter.resolve()
  ↓
9. 适配器调用 Conditional Tokens.reportPayouts()
  ✅ 使用组件 1: Conditional Tokens
  ↓
10. 更新 Supabase 状态
  ↓
完成！市场已结算

总调用次数：2-3次（整个市场生命周期）
```

**代码示例**:
```typescript
// 管理后台结算功能
const settleMarket = async (marketId: string) => {
  const adapter = new ethers.Contract(ADAPTER_ADDRESS, ABI, signer);
  
  // 1. 请求 UMA 预言机
  const tx1 = await adapter.requestOraclePrice(questionId);
  await tx1.wait();
  
  console.log('✅ 已请求 UMA Oracle，等待挑战期...');
  
  // 2. 等待 2 小时...（用户可以在这期间提案和争议）
  
  // 3. 挑战期结束后，获取结果并结算
  const tx2 = await adapter.resolve(questionId);
  await tx2.wait();
  
  console.log('✅ 市场已结算！');
  
  // 4. 更新数据库
  await supabase
    .from('markets')
    .update({ 
      status: 'resolved',
      resolved_at: new Date()
    })
    .eq('question_id', questionId);
};
```

---

## 📋 总结：何时调用区块链

### 市场列表页面
```typescript
// ❌ 不需要调用任何区块链组件
// ✅ 只从数据库读取

const MarketListPage = () => {
  const { data: markets } = useSWR('/api/markets', fetcher);
  return <div>{markets.map(m => <MarketCard {...m} />)}</div>;
};
```

### 市场详情页面
```typescript
// ✅ 可选：调用 1次 Conditional Tokens 获取实时状态
// ❌ 不调用 CTF Exchange
// ❌ 不调用 UMA Oracle

const MarketDetailPage = () => {
  const { data: market } = useSWR(`/api/markets/${id}`, fetcher);
  
  // 可选：获取链上实时数据
  const { data: onChainData } = useMarketOnChain(market.condition_id);
  
  return <div>{/* ... */}</div>;
};
```

### 交易页面
```typescript
// ✅ 下单时：不调用区块链（链下签名）
// ✅ 结算时：后台批量调用 CTF Exchange

const TradePage = () => {
  const handleTrade = async () => {
    // 链下签名 + 数据库存储
    const signature = await signOrder(order);
    await supabase.from('orders').insert({ ...order, signature });
  };
  
  return <div>{/* ... */}</div>;
};
```

### 管理后台
```typescript
// ✅ 创建市场：调用 1次 Conditional Tokens
// ✅ 结算市场：调用 2-3次 UMA Oracle + Conditional Tokens

const AdminPage = () => {
  const createMarket = async () => {
    await adapter.initialize(...); // ✅ 调用区块链
  };
  
  const settleMarket = async () => {
    await adapter.requestOraclePrice(...); // ✅ 调用 UMA
    // 等待 2 小时...
    await adapter.resolve(...); // ✅ 调用 Conditional Tokens
  };
  
  return <div>{/* ... */}</div>;
};
```

---

## 🎯 最佳实践

### 1. 数据层级策略

```
Level 1: Supabase (最快)
└─ 市场列表、基础信息、用户数据
   用于：90% 的页面浏览

Level 2: Conditional Tokens (中等)
└─ 市场元数据、代币状态
   用于：市场详情页、管理后台

Level 3: CTF Exchange (慢)
└─ 订单结算
   用于：后台批量任务

Level 4: UMA Oracle (很慢)
└─ 市场结算
   用于：市场到期后
```

### 2. 缓存策略

```typescript
// lib/cache/market-cache.ts
class MarketCache {
  // 数据库数据：永久缓存，实时更新
  async getMarketFromDB(id: string) {
    return await supabase.from('markets').select('*').eq('id', id).single();
  }
  
  // 区块链数据：缓存 5 分钟
  async getMarketFromChain(conditionId: string) {
    const cacheKey = `market:${conditionId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const ctf = new ethers.Contract(CTF_ADDRESS, ABI, provider);
    const data = await ctf.getCondition(conditionId);
    
    await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5分钟
    return data;
  }
}
```

### 3. API 路由设计

```typescript
// app/api/markets/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  
  // ✅ 只从数据库读取
  const { data: markets } = await supabase
    .from('markets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return Response.json(markets);
}

// app/api/markets/[id]/onchain/route.ts
export async function GET(request: Request, { params }) {
  // ✅ 这个端点才调用区块链（可选）
  const market = await getMarketFromDB(params.id);
  
  if (!market.condition_id) {
    return Response.json({ error: 'Not on chain yet' }, { status: 404 });
  }
  
  const blockchainService = new BlockchainService();
  const onChainData = await blockchainService.getMarket(market.condition_id);
  
  return Response.json(onChainData);
}
```

---

## 🔧 实际使用示例

### 您的 LUMI 系统架构

```
用户浏览
  ↓
┌─────────────────────────────────────┐
│  前端 (Next.js)                      │
│  - 市场列表：读 Supabase ✅          │
│  - 市场详情：读 Supabase ✅          │
│  - 下单：签名 + Supabase ✅          │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  Supabase (数据库 + 实时)            │
│  - markets 表                        │
│  - orders 表                         │
│  - trades 表                         │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  后台任务 (Cron Jobs)                │
│  - 市场激活 → Conditional Tokens ✅  │
│  - 订单结算 → CTF Exchange ✅        │
│  - 市场结算 → UMA Oracle ✅          │
└─────────────────────────────────────┘
```

---

## ✅ 关键要点

1. **市场列表页面**
   - ❌ 不调用区块链
   - ✅ 只读数据库
   - 速度：< 100ms

2. **市场详情页面**
   - ✅ 可选调用 Conditional Tokens（1次）
   - ✅ 缓存 5 分钟
   - 速度：100-500ms

3. **交易功能**
   - ❌ 下单不调用区块链（链下签名）
   - ✅ 后台批量调用 CTF Exchange
   - 速度：下单 < 100ms，结算由后台处理

4. **市场结算**
   - ✅ 只在到期时调用 UMA Oracle
   - ✅ 整个生命周期调用 2-3 次
   - 由管理员/提案者触发

---

**总结**：不需要在每个市场列表页面都调用区块链！只在必要时通过后台任务调用，用户体验更快！



