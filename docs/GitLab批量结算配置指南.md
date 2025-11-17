# 🔷 GitLab 批量结算配置指南

## 📋 概述

由于代码托管在 GitLab，我们可以使用 **GitLab CI/CD Pipeline Schedules** 来实现批量自动结算功能。

**重要说明：**
- ✅ GitLab 免费版支持 Pipeline Schedules（有限制）
- ✅ 完全免费
- ⚠️ 免费版 Pipeline 运行时间有限制

---

## 🚀 方案 1：GitLab CI/CD Pipeline Schedules（推荐）⭐

### ✅ 优势

- ✅ **免费版可用**
- ✅ **配置简单**
- ✅ **可靠性高**
- ✅ **支持手动触发**

### ⚠️ 免费版限制

- ⚠️ 每个项目的 Pipeline 运行时间有限制（通常每月 2000 分钟）
- ⚠️ 单个 Pipeline 最长运行时间：60 分钟（足够使用）

---

## 📋 配置步骤

### 步骤 1：配置 GitLab CI/CD 变量

1. 打开 GitLab 项目
2. 进入 `Settings` > `CI/CD` > `Variables`
3. 展开 `Variables` 部分
4. 添加以下变量：

#### 必需变量：

**1. CRON_SECRET**
- **Key**: `CRON_SECRET`
- **Value**: 从 Vercel 环境变量中复制 `CRON_SECRET` 的值
- **Type**: `Variable`
- **Protected**: ✅ 勾选（如果是保护分支）
- **Masked**: ✅ 勾选（隐藏日志中的值）

**2. VERCEL_APP_URL**
- **Key**: `VERCEL_APP_URL`
- **Value**: 你的 Vercel 应用 URL，例如：`https://your-app.vercel.app`
- **Type**: `Variable`
- **Protected**: ✅ 勾选（如果是保护分支）
- **Masked**: ❌ 不勾选（URL 可以显示）

#### 示例：

```
Key: CRON_SECRET
Value: your_cron_secret_from_vercel
✅ Protected
✅ Masked

Key: VERCEL_APP_URL
Value: https://your-app-name.vercel.app
✅ Protected
❌ Masked
```

---

### 步骤 2：创建 Pipeline Schedule（定时任务）

1. 打开 GitLab 项目
2. 进入 `CI/CD` > `Schedules`
3. 点击 `New schedule`

#### 配置定时任务：

**Description（描述）:**
```
批量结算交易（每 5 分钟）
```

**Interval Pattern（Cron 表达式）:**
```
*/5 * * * *
```

**说明：**
- `*/5 * * * *` = 每 5 分钟执行一次
- `*/10 * * * *` = 每 10 分钟执行一次
- `0 * * * *` = 每小时整点执行

**Timezone（时区）:**
```
Asia/Shanghai
```
（或选择你所在的时区）

**Target Branch（目标分支）:**
```
master
```
（或你的主分支名称）

**Activated（激活）:**
```
✅ 勾选
```

#### 完整配置示例：

```
Description: 批量结算交易（每 5 分钟）
Interval Pattern: */5 * * * *
Timezone: Asia/Shanghai
Target Branch: master
Activated: ✅
```

4. 点击 `Save pipeline schedule`

---

### 步骤 3：测试执行

#### 方法 1：手动触发

1. 进入 `CI/CD` > `Pipelines`
2. 点击 `Run pipeline`
3. 选择分支：`master`
4. 点击 `Run pipeline`
5. 等待执行完成
6. 点击 Pipeline 查看日志

#### 方法 2：等待自动执行

- Pipeline Schedule 会在设定时间自动执行
- 可以在 `CI/CD` > `Pipelines` 中查看执行记录

---

### 步骤 4：验证配置

#### 查看执行日志

1. 进入 `CI/CD` > `Pipelines`
2. 点击最新的 Pipeline
3. 点击 `batch-settle-trades` job
4. 查看执行日志，应该看到：
   ```
   🔄 触发批量结算 API...
   时间: ...
   HTTP 状态码: 200
   ✅ 批量结算触发成功
   ```

#### 检查数据库

```sql
-- 查看最近的结算记录
SELECT * FROM settlements 
ORDER BY created_at DESC 
LIMIT 10;

-- 查看待结算交易
SELECT COUNT(*) FROM trades 
WHERE settled = false 
  AND settlement_batch_id IS NULL;
```

---

## 🔍 工作原理

```
GitLab Pipeline Schedule（每 5 分钟）
   ↓
触发 GitLab CI/CD Pipeline
   ↓
运行 batch-settle-trades job
   ↓
调用 Vercel API
   ↓
POST /api/cron/settle-trades
   ↓
验证 Authorization header
   ↓
执行批量结算逻辑
   ↓
✅ 订单自动上链完成
```

---

## 🚀 方案 2：外部 Cron 服务（备选）

如果 GitLab CI/CD 的限制不能满足需求，可以使用外部 Cron 服务：

### 2.1 EasyCron（推荐）⭐

**优势：**
- ✅ 免费版每天 20 次
- ✅ 界面友好
- ✅ 配置简单

**配置步骤：**

1. 注册 EasyCron：https://www.easycron.com/
2. 登录后，点击 "Add Cron Job"
3. 配置：
   - **URL**: `https://your-app.vercel.app/api/cron/settle-trades`
   - **Method**: `POST`
   - **Schedule**: `*/5 * * * *`（每 5 分钟）
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Status**: `Active`

---

### 2.2 Uptime Robot（简单）

**优势：**
- ✅ 完全免费
- ✅ 配置简单
- ⚠️ 最小间隔 5 分钟

**配置步骤：**

1. 注册 Uptime Robot：https://uptimerobot.com/
2. 点击 "Add New Monitor"
3. 选择 "HTTP(s)"
4. 配置：
   - **Friendly Name**: `Batch Settle Trades`
   - **URL**: `https://your-app.vercel.app/api/cron/settle-trades?secret=YOUR_CRON_SECRET`
   - **Monitoring Interval**: 5 minutes

**注意：** 需要修改 API 路由支持 GET 请求和 Query 参数（参考其他文档）

---

### 2.3 Cron-job.org（免费）

**优势：**
- ✅ 完全免费
- ✅ 配置简单
- ✅ 支持 Cron 表达式

**配置步骤：**

1. 注册 Cron-job.org：https://cron-job.org/
2. 创建新的 Cron Job
3. 配置：
   - **URL**: `https://your-app.vercel.app/api/cron/settle-trades`
   - **Method**: `POST`
   - **Schedule**: `*/5 * * * *`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```

---

## 📊 方案对比

| 方案 | 免费 | 可靠性 | 配置难度 | 推荐度 |
|------|------|--------|---------|--------|
| **GitLab CI/CD** | ✅ 免费（有限制） | ⭐⭐⭐⭐ | 简单 | ⭐⭐⭐⭐⭐ |
| **EasyCron** | ✅ 免费/付费 | ⭐⭐⭐⭐ | 简单 | ⭐⭐⭐⭐ |
| **Uptime Robot** | ✅ 免费 | ⭐⭐⭐ | 简单 | ⭐⭐⭐ |
| **Cron-job.org** | ✅ 免费 | ⭐⭐⭐ | 简单 | ⭐⭐⭐ |

---

## ⚠️ 注意事项

### 1. GitLab CI/CD 免费版限制

- ⚠️ 每月 Pipeline 运行时间有限制（通常 2000 分钟）
- ⚠️ 单个 Pipeline 最长运行时间：60 分钟

**计算：**
- 每 5 分钟执行一次
- 每次执行约 10 秒
- 每月约：30 天 × 24 小时 × 12 次/小时 × 10 秒 = 约 144 分钟
- ✅ **完全在限制内**

### 2. 时区设置

- GitLab Pipeline Schedules 支持时区设置
- 确保选择正确的时区（例如：Asia/Shanghai）

### 3. 变量安全

- ✅ 使用 `Protected` 和 `Masked` 保护敏感信息
- ✅ `CRON_SECRET` 应该被 `Masked`（隐藏日志中的值）

### 4. 手动触发

- GitLab CI/CD 支持手动触发 Pipeline
- 可以在 `.gitlab-ci.yml` 中配置 `when: manual`

---

## 🐛 故障排查

### 问题 1：Pipeline 未执行

**检查：**
- ✅ Pipeline Schedule 是否激活
- ✅ Cron 表达式是否正确
- ✅ 目标分支是否正确
- ✅ 变量是否配置正确

### 问题 2：API 调用失败

**检查：**
- ✅ `VERCEL_APP_URL` 是否正确
- ✅ `CRON_SECRET` 是否正确
- ✅ Vercel API 是否正常
- ✅ 网络连接是否正常

### 问题 3：执行超时

**检查：**
- ✅ Pipeline 执行时间是否超过 60 分钟
- ✅ API 响应时间是否正常
- ✅ 数据库查询是否优化

---

## ✅ 总结

### 推荐方案

**GitLab CI/CD Pipeline Schedules** 是最推荐的方案：
- ✅ 免费版可用
- ✅ 配置简单
- ✅ 可靠性高
- ✅ 与代码仓库集成

### 实施步骤

1. ✅ 配置 GitLab CI/CD 变量
2. ✅ 创建 Pipeline Schedule
3. ✅ 测试执行
4. ✅ 监控日志

### 效果

- ✅ 每 5 分钟自动批量结算
- ✅ 用户无需支付 Gas
- ✅ 完全自动化
- ✅ 免费实现

---

## 🎉 结论

**即使使用 GitLab 免费版，也可以使用 GitLab CI/CD Pipeline Schedules 或外部 Cron 服务，完全免费实现批量自动结算功能！**

