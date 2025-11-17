# 🆓 Vercel 免费版批量结算替代方案

## ⚠️ Vercel 免费版的限制

### Vercel Hobby（免费版）限制：

- ❌ Cron Jobs 执行频率极低（可能每天只执行几次）
- ❌ 最长执行时间：**10 秒**（太短，无法完成批量结算）
- ❌ 不适合高频定时任务

### Vercel Pro 版要求：

- 💰 需要付费（$20/月）
- ✅ 无执行频率限制
- ✅ 最长执行时间：60 秒

---

## 🎯 解决方案：使用外部 Cron 服务

由于 Vercel 免费版限制，我们可以使用**外部 Cron 服务**来定期调用 Vercel API，实现批量结算。

### 方案对比

| 方案 | 免费 | 可靠性 | 配置难度 | 推荐度 |
|------|------|--------|---------|--------|
| **GitHub Actions** | ✅ 免费 | ⭐⭐⭐⭐⭐ | 简单 | ⭐⭐⭐⭐⭐ |
| **EasyCron** | ✅ 免费/付费 | ⭐⭐⭐⭐ | 简单 | ⭐⭐⭐⭐ |
| **Uptime Robot** | ✅ 免费 | ⭐⭐⭐ | 简单 | ⭐⭐⭐ |
| **Render Cron** | ✅ 免费 | ⭐⭐⭐⭐ | 中等 | ⭐⭐⭐⭐ |
| **Cron-job.org** | ✅ 免费 | ⭐⭐⭐ | 简单 | ⭐⭐⭐ |

---

## 🚀 方案 1：GitHub Actions（推荐）⭐

### ✅ 优势

- ✅ **完全免费**
- ✅ **可靠性高**
- ✅ **配置简单**
- ✅ **支持 Cron 表达式**

### 📋 实现步骤

#### 步骤 1：创建 GitHub Actions 工作流

创建文件：`.github/workflows/batch-settle.yml`

```yaml
name: Batch Settle Trades

on:
  schedule:
    # 每 5 分钟执行一次
    - cron: '*/5 * * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  settle-trades:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Vercel Cron API
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://your-app.vercel.app/api/cron/settle-trades
```

#### 步骤 2：配置 GitHub Secrets

1. 打开 GitHub 仓库
2. 进入 `Settings` > `Secrets and variables` > `Actions`
3. 添加 Secret：
   - `CRON_SECRET`: 你的 Cron 安全密钥

#### 步骤 3：测试执行

```bash
# 手动触发
gh workflow run batch-settle.yml
```

### 📊 执行频率

- ✅ 最多每 5 分钟执行一次
- ✅ 完全免费
- ✅ 无执行时间限制（通过 API 调用）

---

## 🚀 方案 2：EasyCron（推荐）⭐

### ✅ 优势

- ✅ **免费版可用**（每天 20 次）
- ✅ **界面友好**
- ✅ **配置简单**
- ✅ **可靠性高**

### 📋 实现步骤

#### 步骤 1：注册 EasyCron

访问：https://www.easycron.com/

#### 步骤 2：创建 Cron Job

1. 登录后，点击 "Add Cron Job"
2. 配置：
   - **URL**: `https://your-app.vercel.app/api/cron/settle-trades`
   - **Method**: `POST`
   - **Schedule**: `*/5 * * * *`（每 5 分钟）
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Status**: `Active`

#### 步骤 3：保存并启用

点击 "Save" 保存配置

### 📊 免费版限制

- ✅ 每天 20 次执行（适合测试）
- 💰 付费版：无限制

---

## 🚀 方案 3：Uptime Robot（简单）

### ✅ 优势

- ✅ **完全免费**（50 个监控）
- ✅ **配置简单**
- ⚠️ 最小间隔 5 分钟

### 📋 实现步骤

#### 步骤 1：注册 Uptime Robot

访问：https://uptimerobot.com/

#### 步骤 2：创建 HTTP(s) Monitor

1. 点击 "Add New Monitor"
2. 选择 "HTTP(s)"
3. 配置：
   - **Friendly Name**: `Batch Settle Trades`
   - **URL**: `https://your-app.vercel.app/api/cron/settle-trades?secret=YOUR_CRON_SECRET`
   - **Monitoring Interval**: 5 minutes

#### 步骤 3：修改 API 路由支持 GET

需要修改 `app/api/cron/settle-trades/route.ts`，支持通过 Query 参数传递 Secret：

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // 验证 Secret
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... 批量结算逻辑
}
```

---

## 🚀 方案 4：Render Cron（推荐）⭐

### ✅ 优势

- ✅ **免费版可用**
- ✅ **可靠性高**
- ✅ **配置简单**

### 📋 实现步骤

#### 步骤 1：创建 Render Cron Job

1. 在 Render Dashboard 创建新的 Cron Job
2. 配置：
   - **Command**: 
     ```bash
     curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/settle-trades
     ```
   - **Schedule**: `*/5 * * * *`
   - **Environment Variables**: 
     - `CRON_SECRET`: 你的 Cron 密钥

---

## 🚀 方案 5：自建简单 Cron 服务

### 使用 Node.js 脚本 + PM2（如果有服务器）

```typescript
// scripts/remote-cron.ts
import cron from 'node-cron';

const VERCEL_API_URL = process.env.VERCEL_CRON_URL || 'https://your-app.vercel.app/api/cron/settle-trades';
const CRON_SECRET = process.env.CRON_SECRET!;

// 每 5 分钟执行一次
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('✅ 批量结算触发成功:', result);
  } catch (error) {
    console.error('❌ 批量结算触发失败:', error);
  }
});

console.log('🚀 远程 Cron 服务已启动');
```

---

## 📊 方案对比总结

### 最推荐：GitHub Actions ⭐⭐⭐⭐⭐

**理由：**
- ✅ 完全免费
- ✅ 可靠性极高
- ✅ 配置简单
- ✅ 支持手动触发
- ✅ 无执行次数限制

### 次推荐：EasyCron ⭐⭐⭐⭐

**理由：**
- ✅ 免费版可用（每天 20 次）
- ✅ 界面友好
- ✅ 配置简单

### 简单方案：Uptime Robot ⭐⭐⭐

**理由：**
- ✅ 完全免费
- ✅ 配置简单
- ⚠️ 需要修改 API 支持 GET

---

## 🎯 推荐实施方案：GitHub Actions

### 完整配置步骤

#### 1. 创建 GitHub Actions 工作流

在项目根目录创建：`.github/workflows/batch-settle.yml`

```yaml
name: Batch Settle Trades

on:
  schedule:
    # 每 5 分钟执行一次（UTC 时间）
    - cron: '*/5 * * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  settle-trades:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Batch Settle API
        run: |
          echo "🔄 触发批量结算 API..."
          
          response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://your-app.vercel.app/api/cron/settle-trades)
          
          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | sed '$d')
          
          if [ "$http_code" -eq 200 ]; then
            echo "✅ 批量结算成功"
            echo "$body"
          else
            echo "❌ 批量结算失败 (HTTP $http_code)"
            echo "$body"
            exit 1
          fi
```

#### 2. 配置 GitHub Secrets

1. 打开 GitHub 仓库
2. 进入 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret`
4. 添加：
   - **Name**: `CRON_SECRET`
   - **Value**: 你的 Cron 密钥（从 Vercel 环境变量复制）

#### 3. 更新工作流中的 URL

将 `your-app.vercel.app` 替换为你的实际 Vercel 域名

#### 4. 提交并推送

```bash
git add .github/workflows/batch-settle.yml
git commit -m "feat: 添加 GitHub Actions 批量结算工作流"
git push
```

#### 5. 测试执行

- 手动触发：GitHub 仓库 > Actions > Batch Settle Trades > Run workflow
- 或等待自动执行（最多 5 分钟后）

---

## 📝 注意事项

### 1. 更新 Vercel API 路由

确保 `app/api/cron/settle-trades/route.ts` 支持 POST 请求并验证 Authorization header（已经实现）

### 2. 环境变量配置

在 Vercel Dashboard 中确保配置了：
- `PLATFORM_WALLET_PRIVATE_KEY`
- `CRON_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_RPC_URL`

### 3. 监控和日志

- **GitHub Actions**: 查看 Actions 标签页的执行日志
- **Vercel**: 查看 Logs 中的 API 调用记录
- **数据库**: 查看 `settlements` 表的记录

---

## ✅ 总结

### 推荐方案

**GitHub Actions** 是最推荐的方案：
- ✅ 完全免费
- ✅ 可靠性高
- ✅ 配置简单
- ✅ 适合 Vercel 免费版用户

### 实施步骤

1. ✅ 创建 GitHub Actions 工作流文件
2. ✅ 配置 GitHub Secrets
3. ✅ 更新 Vercel API URL
4. ✅ 提交并推送代码
5. ✅ 测试执行

### 效果

- ✅ 每 5 分钟自动批量结算
- ✅ 用户无需支付 Gas
- ✅ 完全自动化
- ✅ 免费实现

---

## 🎉 结论

**即使没有 Vercel Pro，也可以使用 GitHub Actions 等外部 Cron 服务，完全免费实现批量自动结算功能！**

