# 🔧 RPC 连接超时解决方案

## 🎯 问题描述

- ✅ `scripts/test-my-rpc.js` 成功连接 RPC
- ❌ Next.js API 路由中 RPC 连接超时（30 秒内无响应）

这说明：**网络和 RPC 本身是正常的，问题在于 Next.js 的 fetch 实现**。

## 🔍 可能的原因

1. **Next.js 的 fetch 实现与 Node.js 不同**
   - Next.js 使用自己的 fetch polyfill
   - 可能与某些网络配置不兼容

2. **网络代理问题**
   - 在中国访问 Alchemy 可能需要代理
   - Next.js 的 fetch 可能没有使用系统代理

3. **DNS 解析问题**
   - Next.js 的 fetch 可能使用不同的 DNS 解析器

## ✅ 解决方案

### 方案 1: 使用 Node.js 原生模块（推荐）

如果 Next.js 的 fetch 有问题，可以尝试使用 Node.js 原生的 `http`/`https` 模块：

```typescript
import https from 'https';
import http from 'http';

// 使用 Node.js 原生模块发送 RPC 请求
function rpcCall(url: string, method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 秒超时
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1
    }));
    req.end();
  });
}
```

### 方案 2: 配置系统代理

如果您的网络需要代理，可以在 `.env.local` 中配置：

```env
# HTTP 代理（如果需要）
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080

# 或者使用环境变量
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

### 方案 3: 使用其他 RPC 端点

如果 Alchemy 连接有问题，可以尝试其他 RPC 端点：

```env
# 选项 1: Polygon 官方 RPC
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology

# 选项 2: PublicNode
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com

# 选项 3: Ankr
NEXT_PUBLIC_RPC_URL=https://rpc.ankr.com/polygon_amoy
```

### 方案 4: 使用 VPN/代理工具

如果在中国，可能需要：
1. 使用 VPN 连接到海外网络
2. 或者使用代理工具（如 Clash、V2Ray）

### 方案 5: 临时解决方案 - 手动设置 condition_id

如果 RPC 连接一直有问题，可以暂时手动设置 `condition_id` 来测试其他功能：

```sql
-- 在 Supabase Dashboard 中运行
UPDATE markets 
SET condition_id = '0x你的condition_id', 
    blockchain_status = 'created'
WHERE id = 你的市场ID;
```

## 🧪 测试步骤

1. **先测试脚本**（应该成功）：
   ```bash
   node scripts/test-my-rpc.js
   ```

2. **再测试 API**（可能超时）：
   ```
   http://localhost:3000/api/admin/debug-activation
   ```

3. **如果脚本成功但 API 失败**：
   - 尝试方案 1（使用 Node.js 原生模块）
   - 或者使用方案 3（更换 RPC 端点）

## 💡 建议

**优先尝试方案 3**（更换 RPC 端点），因为：
- 最简单，不需要改代码
- Polygon 官方 RPC 通常更稳定
- 不需要代理/VPN

如果方案 3 也不行，再尝试方案 1（使用 Node.js 原生模块）。


