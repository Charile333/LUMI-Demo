# 🚀 LUMI 系统优化建议 - 如何正确使用三大组件

> 基于您当前代码的实际优化方案

---

## 📊 当前状态分析

### ✅ 做得好的地方

1. **`app/market/[marketId]/page.tsx`** - 市场详情页
   ```typescript
   // ✅ 正确：从 Supabase 读取
   const { data, error } = await supabase
     .from('markets')
     .select('*')
     .eq('id', marketId)
     .single();
   ```

2. **`app/markets/[category]/page.tsx`** - 分类市场页
   ```typescript
   // ✅ 正确：使用 Hook 从 Supabase 读取
   const { markets, loading, error } = useMarketsByCategory(category);
   ```

### ⚠️ 需要优化的地方

1. **`app/blockchain-markets/page.tsx`** - 区块链市场页
   ```typescript
   // ❌ 当前：每次都调用区块链
   const loadMarkets = async () => {
     const provider = new ethers.providers.JsonRpcProvider(...);
     const adapter = new ethers.Contract(CONTRACTS.testAdapter, ADAPTER_ABI, provider);
     const count = await adapter.getMarketCount(); // 慢！
     const marketIds = await adapter.getMarketList(0, count.toNumber()); // 慢！
     
     // 每个市场都调用一次区块链
     const marketsData = await Promise.all(
       marketIds.map(async (questionId) => {
         const market = await adapter.getMarket(questionId); // 非常慢！
         return { ... };
       })
     );
   };
   ```

---

## 🎯 优化方案

### 方案 1: 混合模式（推荐）

**适用场景**: 需要展示区块链状态，但也要保证速度

```typescript
// app/blockchain-markets/page.tsx (优化版)
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MarketCard } from '@/components/MarketCard';

export default function BlockchainMarketsPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // ✅ 方法1: 从 Supabase 读取已激活的市场
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('blockchain_status', 'created') // 只显示已在链上的
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('加载失败:', error);
        return;
      }
      
      setMarkets(data || []);
      
      // ✅ [可选] 后台异步更新区块链状态（不阻塞UI）
      updateBlockchainStatus(data || []);
      
    } catch (error) {
      console.error('加载市场列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 后台异步更新（不阻塞UI）
  const updateBlockchainStatus = async (markets: any[]) => {
    // 这个函数在后台运行，不影响页面显示
    for (const market of markets.slice(0, 10)) { // 只更新前10个
      try {
        const blockchainService = new BlockchainService();
        const onChainData = await blockchainService.getMarket(market.condition_id);
        
        // 更新 Supabase
        await supabase
          .from('markets')
          .update({ 
            blockchain_data: onChainData,
            last_sync: new Date()
          })
          .eq('id', market.id);
      } catch (error) {
        console.error(`更新市场 ${market.id} 失败:`, error);
      }
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 页面内容 */}
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {markets.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**性能对比**:
- 当前方式：10个市场 = 10-30秒
- 优化方式：10个市场 = 0.1秒（数据库） + 后台更新

---

### 方案 2: 纯数据库模式（最快）

**适用场景**: 用户体验优先，定期同步即可

```typescript
// app/grid-market/page.tsx (主市场页面)
'use client';

import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from '@/components/MarketCard';

export default function GridMarketPage() {
  // ✅ 使用统一的 Hook 从 Supabase 读取
  const { markets, loading, error, refresh } = useMarkets({
    limit: 100,
    category: 'all',
    status: 'active'
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">预测市场</h1>
          <button onClick={refresh}>刷新</button>
        </div>
        
        {loading ? (
          <div>加载中...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {markets.map(market => (
              <MarketCard 
                key={market.id} 
                market={market}
                showPrice={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**配合定时任务同步**:
```typescript
// scripts/sync-blockchain-data-cron.ts
import { BlockchainService } from '@/lib/blockchainService';
import { createClient } from '@supabase/supabase-js';

async function syncBlockchainData() {
  const supabase = createClient(...);
  const blockchainService = new BlockchainService();
  
  // 1. 从区块链读取最新市场
  const onChainMarkets = await blockchainService.getMarkets(50);
  
  // 2. 更新到 Supabase
  for (const market of onChainMarkets) {
    await supabase
      .from('markets')
      .upsert({
        question_id: market.questionId,
        condition_id: market.conditionId,
        title: market.title,
        description: market.description,
        blockchain_status: 'created',
        resolved: market.resolved,
        // ... 其他字段
      }, {
        onConflict: 'question_id'
      });
  }
  
  console.log(`✅ 同步完成：${onChainMarkets.length} 个市场`);
}

// 每5分钟运行一次
setInterval(syncBlockchainData, 5 * 60 * 1000);
```

---

## 🏗️ 完整的数据流程

### 流程 1: 创建市场

```
管理员创建市场
  ↓
┌─────────────────────────────────────┐
│  1. 创建数据库记录 (Supabase)        │
│     - 基础信息                       │
│     - blockchain_status: 'pending'   │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  2. 调用 RealUmaCTFAdapter          │
│     adapter.initialize(...)          │
│     ✅ 使用 Conditional Tokens       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  3. 更新数据库                       │
│     - blockchain_status: 'created'   │
│     - condition_id: xxx              │
└─────────────────────────────────────┘
```

**代码示例**:
```typescript
// app/_dev_only_admin/create-market/actions.ts
export async function createMarket(formData: FormData) {
  const supabase = createClient(...);
  
  // 1. 创建数据库记录
  const { data: market } = await supabase
    .from('markets')
    .insert({
      title: formData.get('title'),
      description: formData.get('description'),
      blockchain_status: 'pending',
      category: formData.get('category'),
    })
    .select()
    .single();
  
  // 2. 激活到区块链（异步，不阻塞）
  activateMarketOnChain(market.id).catch(console.error);
  
  return market;
}

async function activateMarketOnChain(marketId: number) {
  const supabase = createClient(...);
  
  // 读取市场信息
  const { data: market } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();
  
  // 调用区块链
  const adapter = new ethers.Contract(ADAPTER_ADDRESS, ABI, signer);
  const questionId = ethers.utils.id(market.title + Date.now());
  
  const tx = await adapter.initialize(
    questionId,
    market.title,
    market.description,
    2, // YES/NO
    USDC_ADDRESS,
    ethers.utils.parseUnits('100', 6)
  );
  
  const receipt = await tx.wait();
  
  // 提取 conditionId（从事件）
  const conditionId = receipt.events.find(
    e => e.event === 'MarketCreated'
  )?.args?.conditionId;
  
  // 更新数据库
  await supabase
    .from('markets')
    .update({
      blockchain_status: 'created',
      condition_id: conditionId,
      question_id: questionId,
      activation_tx: tx.hash
    })
    .eq('id', marketId);
  
  console.log(`✅ 市场 ${marketId} 已激活到区块链`);
}
```

---

### 流程 2: 用户浏览市场

```
用户访问 /grid-market
  ↓
┌─────────────────────────────────────┐
│  前端调用 useMarkets() Hook          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  从 Supabase 读取市场                │
│  SELECT * FROM markets               │
│  WHERE status = 'active'             │
│  LIMIT 100                           │
│  ⚡ < 100ms                          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  返回市场列表给前端                  │
│  - 基础信息                          │
│  - 缓存的价格                        │
│  - 统计数据                          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  [可选] WebSocket 实时价格更新       │
│  连接到 Supabase Realtime            │
└─────────────────────────────────────┘

❌ 不调用 Conditional Tokens
❌ 不调用 CTF Exchange
❌ 不调用 UMA Oracle
```

---

### 流程 3: 用户交易

```
用户点击"买入 YES"
  ↓
┌─────────────────────────────────────┐
│  1. 前端签名订单 (EIP-712)           │
│     本地操作，不调用区块链            │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  2. 提交订单到 Supabase              │
│     INSERT INTO orders               │
│     ⚡ < 50ms                        │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  3. WebSocket 通知匹配引擎           │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  4. 匹配成功，创建交易记录            │
│     INSERT INTO trades               │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  5. [后台定时任务] 批量结算           │
│     每5分钟运行一次                  │
│     ✅ 调用 CTF Exchange             │
│     ✅ 批量处理 20笔交易              │
└─────────────────────────────────────┘

用户体验：
- 下单：< 100ms ✅
- 显示"待结算"状态
- 5分钟内链上确认
```

**交易组件代码**:
```typescript
// components/trading/BuyButton.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { createClient } from '@supabase/supabase-js';

export function BuyButton({ market, price, amount }) {
  const { signer, address } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    
    try {
      // 1. 创建订单对象
      const order = {
        maker: address,
        tokenId: market.token_id_yes,
        makerAmount: ethers.utils.parseUnits(amount, 6),
        takerAmount: ethers.utils.parseUnits((amount * price).toString(), 6),
        side: 0, // BUY
        expiration: Math.floor(Date.now() / 1000) + 86400, // 24小时
        nonce: Date.now(),
        feeRateBps: 100, // 1%
      };
      
      // 2. EIP-712 签名（本地，不调用区块链）
      const domain = {
        name: 'CTF Exchange',
        version: '1.0',
        chainId: 80002,
        verifyingContract: CTF_EXCHANGE_ADDRESS
      };
      
      const types = {
        Order: [
          { name: 'maker', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          // ... 其他字段
        ]
      };
      
      const signature = await signer._signTypedData(domain, types, order);
      
      // 3. 提交到数据库（快速）
      const supabase = createClient(...);
      const { data, error } = await supabase
        .from('orders')
        .insert({
          market_id: market.id,
          user_address: address,
          side: 'buy',
          price: price,
          amount: amount,
          signature: signature,
          order_data: order,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // ✅ 订单提交成功！
      alert('订单已提交，等待匹配...');
      
      // 后台会自动匹配和结算到 CTF Exchange
      
    } catch (error) {
      console.error('下单失败:', error);
      alert('下单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBuy}
      disabled={loading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg"
    >
      {loading ? '提交中...' : `买入 ${amount} USDC`}
    </button>
  );
}
```

---

### 流程 4: 市场结算

```
市场到期
  ↓
┌─────────────────────────────────────┐
│  管理员触发结算                      │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  1. 调用 adapter.requestOraclePrice()│
│     ✅ 使用 UMA Oracle               │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  2. 等待挑战期（2小时）              │
│     - 提案者提交答案                 │
│     - 可能有人争议                   │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  3. 调用 adapter.resolve()           │
│     ✅ 使用 Conditional Tokens       │
│     报告最终结果                     │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  4. 更新 Supabase                    │
│     - status: 'resolved'             │
│     - result: 'YES' or 'NO'          │
└─────────────────────────────────────┘

整个生命周期：
- 创建时：1次区块链调用
- 结算时：2-3次区块链调用
- 总计：3-4次调用
```

---

## 📊 性能对比

### 当前实现 vs 优化实现

| 操作 | 当前实现 | 优化实现 | 性能提升 |
|------|---------|---------|---------|
| **加载100个市场** | 100次区块链调用<br/>~30秒 | 1次数据库查询<br/>~0.1秒 | **300倍** ⚡ |
| **查看市场详情** | 1-2次区块链调用<br/>~1秒 | 1次数据库查询<br/>~0.05秒 | **20倍** ⚡ |
| **用户下单** | 1次区块链交易<br/>~5秒 | 1次数据库插入<br/>~0.05秒 | **100倍** ⚡ |
| **订单结算** | 逐个结算<br/>~5秒/笔 | 批量结算<br/>~0.5秒/笔 | **10倍** ⚡ |

---

## ✅ 推荐的数据架构

```typescript
// Supabase markets 表结构
interface Market {
  // 基础信息
  id: number;
  title: string;
  description: string;
  category: string;
  
  // 区块链信息
  blockchain_status: 'pending' | 'created' | 'resolved';
  question_id: string | null;
  condition_id: string | null;
  activation_tx: string | null;
  
  // 缓存的区块链数据（定期同步）
  blockchain_data: {
    outcomeSlotCount: number;
    resolved: boolean;
    payouts: number[];
  } | null;
  last_sync: Date | null;
  
  // 时间戳
  created_at: Date;
  end_date: Date;
  resolved_at: Date | null;
}
```

---

## 🎯 总结

### 三大组件的使用原则

1. **Conditional Tokens**
   - ✅ 创建市场时调用（1次）
   - ✅ 结算市场时调用（1次）
   - ❌ 不在列表页调用

2. **CTF Exchange**
   - ✅ 后台批量结算时调用
   - ❌ 不在下单时调用
   - ❌ 不在列表页调用

3. **UMA Oracle**
   - ✅ 市场到期时调用（2-3次）
   - ❌ 不在其他时候调用

### 最佳实践

1. **数据库优先**: 90%的操作从 Supabase 读取
2. **异步同步**: 定时任务同步区块链数据
3. **批量处理**: 批量结算订单到 CTF Exchange
4. **缓存策略**: 缓存区块链数据 5-30 分钟
5. **后台任务**: 耗时操作放到后台执行

**不需要在每个市场列表页面都调用区块链！** ✅



