# 🔷 GitLab 批量结算配置步骤（详细版）

## 📋 前置准备

### 1. 确认 Vercel 环境变量

确保在 Vercel Dashboard 中已配置以下环境变量：

1. 打开 Vercel Dashboard：https://vercel.com/dashboard
2. 选择你的项目
3. 进入 `Settings` > `Environment Variables`
4. 确认以下变量已配置：

**必需变量：**
- ✅ `CRON_SECRET` - Cron 安全密钥
- ✅ `PLATFORM_WALLET_PRIVATE_KEY` - 平台钱包私钥（用于批量结算）
- ✅ `DATABASE_URL` - 数据库连接字符串
- ✅ `NEXT_PUBLIC_RPC_URL` - RPC 节点 URL（可选）

**如果未配置，请添加：**

```env
CRON_SECRET=your_random_secret_string
PLATFORM_WALLET_PRIVATE_KEY=your_platform_wallet_private_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

---

## 🚀 配置步骤

### 步骤 1：配置 GitLab CI/CD 变量

#### 1.1 打开 GitLab 项目

1. 访问：https://gitlab.com/novatamoffat-group/LUMI-Demo
2. 登录你的 GitLab 账户

#### 1.2 进入 CI/CD 变量设置

1. 在项目页面，点击左侧菜单 `Settings`（设置）
2. 展开 `CI/CD` 部分
3. 找到 `Variables` 部分
4. 点击 `Expand`（展开）

#### 1.3 添加 CRON_SECRET 变量

1. 点击 `Add variable`（添加变量）
2. 填写：
   - **Key**: `CRON_SECRET`
   - **Value**: 
     - 从 Vercel Dashboard 的 `CRON_SECRET` 环境变量中复制
     - 或者生成新的：运行 `openssl rand -base64 32`
   - **Type**: `Variable`
   - **Environment scope**: `All environments`（所有环境）
   - **Flags**:
     - ✅ **Protect variable**（保护变量）- 勾选
     - ✅ **Mask variable**（隐藏变量）- 勾选（重要：隐藏日志中的值）
3. 点击 `Add variable` 保存

#### 1.4 添加 VERCEL_APP_URL 变量

1. 再次点击 `Add variable`
2. 填写：
   - **Key**: `VERCEL_APP_URL`
   - **Value**: 你的 Vercel 应用 URL
     - 格式：`https://your-app-name.vercel.app`
     - 例如：`https://lumi-demo.vercel.app`
     - ⚠️ **不要包含尾部斜杠**：❌ `https://app.vercel.app/` ✅ `https://app.vercel.app`
   - **Type**: `Variable`
   - **Environment scope**: `All environments`
   - **Flags**:
     - ✅ **Protect variable** - 勾选
     - ❌ **Mask variable** - 不勾选（URL 可以显示）
3. 点击 `Add variable` 保存

#### 1.5 验证变量配置

完成后，你应该看到两个变量：
- ✅ `CRON_SECRET` - 已隐藏（显示为 `****`）
- ✅ `VERCEL_APP_URL` - 显示完整 URL

---

### 步骤 2：创建 Pipeline Schedule（定时任务）

#### 2.1 进入 Pipeline Schedules

1. 在项目页面，点击左侧菜单 `CI/CD`
2. 展开 `Schedules`（定时任务）
3. 点击 `New schedule`（新建定时任务）

#### 2.2 配置定时任务

填写以下信息：

**Description（描述）:**
```
批量结算交易（每 5 分钟）
```

**Interval Pattern（Cron 表达式）:**
```
*/5 * * * *
```

**Cron 表达式说明：**
- `*/5 * * * *` = 每 5 分钟执行一次
- `*/10 * * * *` = 每 10 分钟执行一次
- `0 * * * *` = 每小时整点执行
- `0 */2 * * *` = 每 2 小时执行一次

**时区设置：**
- 点击时区下拉菜单
- 选择：`Asia/Shanghai`（中国标准时间）
- 或其他时区（根据你的需求）

**Target Branch（目标分支）:**
- 选择：`master`（或你的主分支名称）
- 确保选择正确的分支

**Activated（激活状态）:**
- ✅ 勾选 `Activated`（激活）

#### 2.3 保存配置

1. 滚动到页面底部
2. 点击 `Save pipeline schedule`（保存定时任务）

---

### 步骤 3：测试执行

#### 3.1 手动触发 Pipeline（测试）

1. 在项目页面，点击左侧菜单 `CI/CD` > `Pipelines`
2. 点击右上角 `Run pipeline`（运行管道）
3. 配置：
   - **Branch**: 选择 `master`（或你的主分支）
   - **Variables**: 无需添加（使用已配置的变量）
4. 点击 `Run pipeline`（运行管道）

#### 3.2 查看执行日志

1. 等待 Pipeline 执行（通常需要几秒到几分钟）
2. 点击最新的 Pipeline（显示为运行中或已完成）
3. 查看 Pipeline 详情：
   - 应该看到 `batch-settle-trades` job
   - 点击 `batch-settle-trades` job
   - 查看执行日志

#### 3.3 验证执行结果

**成功的日志应该显示：**
```
🔄 触发批量结算 API...
时间: ...
分支: master
触发源: schedule (或 web)
调用 API: https://your-app.vercel.app/api/cron/settle-trades
HTTP 状态码: 200
响应内容: {...}
✅ 批量结算触发成功
```

**如果失败，检查：**
- ❌ `CRON_SECRET` 是否配置正确
- ❌ `VERCEL_APP_URL` 是否正确
- ❌ Vercel API 是否正常
- ❌ 网络连接是否正常

---

### 步骤 4：验证定时任务

#### 4.1 等待自动执行

1. Pipeline Schedule 配置后，会在设定时间自动执行
2. 等待最多 5 分钟（如果是 `*/5 * * * *`）
3. 进入 `CI/CD` > `Pipelines`
4. 应该看到新的 Pipeline 自动执行

#### 4.2 查看执行历史

1. 进入 `CI/CD` > `Pipelines`
2. 应该看到每 5 分钟自动执行的 Pipeline
3. 点击任意 Pipeline 查看执行日志

---

## 🔍 验证和监控

### 1. 查看 Pipeline 执行记录

**路径：** `CI/CD` > `Pipelines`

应该看到：
- ✅ 每 5 分钟自动执行一次
- ✅ 状态为 `passed`（绿色）或 `running`（黄色）
- ✅ 如果失败，状态为 `failed`（红色）

### 2. 查看执行日志

**路径：** `CI/CD` > `Pipelines` > 点击 Pipeline > 点击 `batch-settle-trades` job

**成功日志示例：**
```
🔄 触发批量结算 API...
时间: 2025-11-16 18:00:00
分支: master
触发源: schedule
调用 API: https://your-app.vercel.app/api/cron/settle-trades
HTTP 状态码: 200
响应内容:
{
  "success": true,
  "message": "批量结算完成（模拟模式）",
  "batchId": "batch-1234567890",
  "tradesProcessed": 0,
  "mode": "simulated",
  "executionTime": 1234,
  "timestamp": "2025-11-16T18:00:00.000Z"
}
✅ 批量结算触发成功
```

### 3. 检查数据库

**在 Supabase Dashboard 中执行：**

```sql
-- 查看最近的结算批次
SELECT 
  batch_id,
  trade_count,
  status,
  created_at,
  completed_at
FROM settlements 
ORDER BY created_at DESC 
LIMIT 10;

-- 查看待结算交易数量
SELECT COUNT(*) as pending_trades
FROM trades 
WHERE settled = false 
  AND settlement_batch_id IS NULL;
```

### 4. 查看 Vercel Logs

1. 打开 Vercel Dashboard
2. 选择项目
3. 进入 `Logs` 标签页
4. 筛选 `/api/cron/settle-trades`
5. 应该看到来自 GitLab 的 API 调用日志

---

## 🐛 故障排查

### 问题 1：Pipeline 未执行

**检查：**
- ✅ Pipeline Schedule 是否激活（`Activated` 是否勾选）
- ✅ Cron 表达式是否正确（`*/5 * * * *`）
- ✅ 目标分支是否正确（`master`）
- ✅ 时区设置是否正确

**解决方法：**
1. 进入 `CI/CD` > `Schedules`
2. 点击定时任务
3. 检查配置
4. 如果未激活，勾选 `Activated` 并保存

---

### 问题 2：API 调用失败（401 Unauthorized）

**原因：** `CRON_SECRET` 配置错误或不匹配

**检查：**
- ✅ GitLab 中的 `CRON_SECRET` 是否与 Vercel 中的一致
- ✅ `CRON_SECRET` 是否已配置（未隐藏显示）

**解决方法：**
1. 检查 Vercel Dashboard 中的 `CRON_SECRET` 值
2. 检查 GitLab CI/CD Variables 中的 `CRON_SECRET` 值
3. 确保两者完全一致（包括前后空格）
4. 如果不一致，更新 GitLab 中的值

---

### 问题 3：API 调用失败（404 Not Found）

**原因：** `VERCEL_APP_URL` 配置错误

**检查：**
- ✅ `VERCEL_APP_URL` 是否正确
- ✅ URL 是否包含尾部斜杠（不应该有）
- ✅ 是否正确格式：`https://your-app.vercel.app`

**解决方法：**
1. 检查 GitLab CI/CD Variables 中的 `VERCEL_APP_URL`
2. 确保格式正确：`https://your-app.vercel.app`（无尾部斜杠）
3. 确保 Vercel 应用已部署并可访问

---

### 问题 4：API 调用失败（500 Internal Server Error）

**原因：** Vercel API 内部错误

**检查：**
- ✅ Vercel 环境变量是否配置完整
- ✅ 数据库连接是否正常
- ✅ API 代码是否有错误

**解决方法：**
1. 查看 Vercel Logs 中的错误信息
2. 检查 Vercel 环境变量配置
3. 检查数据库连接
4. 查看 API 代码是否有问题

---

## 📊 配置检查清单

### ✅ GitLab 配置

- [ ] `CRON_SECRET` 变量已配置（Protected + Masked）
- [ ] `VERCEL_APP_URL` 变量已配置（Protected，未 Masked）
- [ ] Pipeline Schedule 已创建
- [ ] Cron 表达式：`*/5 * * * *`
- [ ] 时区设置正确
- [ ] 目标分支正确（`master`）
- [ ] 定时任务已激活（`Activated` 勾选）

### ✅ Vercel 配置

- [ ] `CRON_SECRET` 环境变量已配置
- [ ] `PLATFORM_WALLET_PRIVATE_KEY` 环境变量已配置
- [ ] `DATABASE_URL` 环境变量已配置
- [ ] `NEXT_PUBLIC_RPC_URL` 环境变量已配置（可选）
- [ ] Vercel 应用已部署并可访问

### ✅ 测试验证

- [ ] 手动触发 Pipeline 执行成功
- [ ] 执行日志显示 `HTTP 状态码: 200`
- [ ] 执行日志显示 `✅ 批量结算触发成功`
- [ ] 定时任务自动执行（等待 5 分钟）

---

## ✅ 完成！

配置完成后，GitLab 会每 5 分钟自动调用 Vercel API 执行批量结算。

**效果：**
- ✅ 每 5 分钟自动批量结算
- ✅ 用户无需支付 Gas 费（平台代付）
- ✅ 完全自动化
- ✅ 完全免费（GitLab 免费版可用）

---

## 📝 后续管理

### 修改执行频率

1. 进入 `CI/CD` > `Schedules`
2. 点击定时任务
3. 修改 `Interval Pattern`（例如改为 `*/10 * * * *` 每 10 分钟）
4. 保存

### 暂停/恢复定时任务

1. 进入 `CI/CD` > `Schedules`
2. 点击定时任务
3. 取消勾选/勾选 `Activated`
4. 保存

### 手动触发

1. 进入 `CI/CD` > `Pipelines`
2. 点击 `Run pipeline`
3. 选择分支：`master`
4. 点击 `Run pipeline`

---

## 🎯 总结

配置只需 3 步：
1. ✅ 配置 GitLab CI/CD 变量（2 个变量）
2. ✅ 创建 Pipeline Schedule（定时任务）
3. ✅ 测试执行（手动触发验证）

配置完成后，批量结算将自动运行！


