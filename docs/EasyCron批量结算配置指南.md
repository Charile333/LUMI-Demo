# 🚀 EasyCron 批量结算配置指南（最简单方案）

## 📋 为什么选择 EasyCron？

- ✅ **完全免费**（免费版每天 20 次）
- ✅ **配置简单**（5 分钟完成）
- ✅ **不需要 GitLab Pipeline Schedules**
- ✅ **界面友好**
- ✅ **可靠性高**

---

## 🚀 配置步骤（5 分钟完成）

### 步骤 1：注册 EasyCron

1. 访问：https://www.easycron.com/
2. 点击右上角 `Sign Up`（注册）
3. 填写注册信息：
   - **Email**: 你的邮箱
   - **Password**: 设置密码
   - **Confirm Password**: 确认密码
4. 点击 `Sign Up` 完成注册
5. 检查邮箱并验证账户

---

### 步骤 2：登录 EasyCron

1. 访问：https://www.easycron.com/user/login
2. 输入邮箱和密码
3. 点击 `Login` 登录

---

### 步骤 3：创建 Cron Job

1. 登录后，点击左侧菜单 `Cron Jobs`（定时任务）
2. 点击右上角 `Add Cron Job`（添加定时任务）按钮

---

### 步骤 4：配置 Cron Job

填写以下信息：

#### 基本信息

**Cron Job Title（任务标题）:**
```
批量结算交易
```

**Cron Job URL（API 地址）:**
```
https://lumi-demo.vercel.app/api/cron/settle-trades
```
（替换为你的实际 Vercel URL）

**HTTP Method（HTTP 方法）:**
- 选择：`POST`

---

#### HTTP Headers（请求头）

点击 `Add Header`（添加请求头），添加以下请求头：

**Header 1:**
- **Name**: `Authorization`
- **Value**: `Bearer O8fh6eCY3v54f3jp+uw5TCecErTPhuLCmA+V5Vdrjsw=`
  - ⚠️ **重要**：替换为你的实际 `CRON_SECRET` 值（从 Vercel 环境变量中复制）

**Header 2:**
- **Name**: `Content-Type`
- **Value**: `application/json`

---

#### 执行时间设置

**Cron Expression（Cron 表达式）:**
```
*/5 * * * *
```

**说明：**
- `*/5 * * * *` = 每 5 分钟执行一次
- `*/10 * * * *` = 每 10 分钟执行一次
- `0 * * * *` = 每小时整点执行

**Timezone（时区）:**
- 选择：`Asia/Shanghai`（中国标准时间）
- 或其他时区（根据你的需求）

---

#### 其他设置

**Status（状态）:**
- ✅ 选择：`Active`（激活）

**Timeout（超时时间）:**
- 默认：30 秒（足够使用）

**Email Notification（邮件通知）:**
- ❌ 可以不勾选（可选）

---

### 步骤 5：保存配置

1. 滚动到页面底部
2. 检查所有配置是否正确
3. 点击 `Save`（保存）按钮

---

### 步骤 6：测试执行

#### 方法 1：在 EasyCron 中测试

1. 保存后，在 Cron Job 列表中，找到刚才创建的任务
2. 点击右侧的 `Run Now`（立即运行）按钮
3. 等待执行完成（几秒钟）
4. 点击任务，查看执行日志
5. 应该看到 `200 OK` 状态码

#### 方法 2：检查 Vercel Logs

1. 打开 Vercel Dashboard：https://vercel.com/dashboard
2. 选择你的项目
3. 进入 `Logs`（日志）标签页
4. 筛选 `/api/cron/settle-trades`
5. 应该能看到来自 EasyCron 的 API 调用记录

---

## ✅ 配置完成

配置完成后，EasyCron 会每 5 分钟自动调用 Vercel API 执行批量结算。

**效果：**
- ✅ 每 5 分钟自动批量结算
- ✅ 用户无需支付 Gas（平台代付）
- ✅ 完全自动化
- ✅ 免费实现

---

## 🔍 监控和管理

### 查看执行历史

1. 在 EasyCron 中，进入 `Cron Jobs` 页面
2. 点击你的任务（批量结算交易）
3. 查看 `Execution History`（执行历史）
4. 可以看到每次执行的：
   - 执行时间
   - HTTP 状态码
   - 响应内容
   - 执行耗时

### 修改执行频率

1. 在 `Cron Jobs` 页面，点击你的任务
2. 点击 `Edit`（编辑）按钮
3. 修改 `Cron Expression`（例如改为 `*/10 * * * *` 每 10 分钟）
4. 点击 `Save` 保存

### 暂停/恢复任务

1. 在 `Cron Jobs` 页面，找到你的任务
2. 点击 `Status`（状态）列的开关
3. `Active` = 运行中
4. `Inactive` = 已暂停

---

## ⚠️ 免费版限制

### EasyCron 免费版限制

- ⚠️ **每天最多 20 次执行**
- ⚠️ **每小时最多 2 次执行**

**计算：**
- 每 5 分钟执行一次 = 每小时 12 次
- **超过免费版限制**

### 解决方案

#### 方案 1：降低执行频率（推荐）

修改 Cron 表达式：
- `*/10 * * * *` = 每 10 分钟执行一次（每小时 6 次，免费版可用）
- `0 */2 * * *` = 每 2 小时执行一次
- `0 * * * *` = 每小时执行一次

#### 方案 2：升级到付费版

- EasyCron 付费版：无执行次数限制
- 价格：约 $5-10/月

#### 方案 3：使用其他免费 Cron 服务

- **Cron-job.org**：完全免费，无限制
- **Uptime Robot**：完全免费，最小间隔 5 分钟

---

## 📊 替代方案

如果 EasyCron 免费版限制不能满足需求，可以使用：

### 方案 1：Cron-job.org（推荐）⭐

**优势：**
- ✅ 完全免费
- ✅ 无执行次数限制
- ✅ 支持 Cron 表达式
- ✅ 配置简单

**配置步骤：**

1. 注册：https://cron-job.org/
2. 登录后，点击 `Create cronjob`
3. 配置：
   - **Title**: `批量结算交易`
   - **Address**: `https://lumi-demo.vercel.app/api/cron/settle-trades`
   - **Schedule**: `*/5 * * * *`（每 5 分钟）
   - **Request Method**: `POST`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Status**: `Enabled`
4. 点击 `Create cronjob` 保存

---

### 方案 2：Uptime Robot

**优势：**
- ✅ 完全免费
- ✅ 配置简单
- ⚠️ 最小间隔 5 分钟
- ⚠️ 需要修改 API 支持 GET 请求

---

## ✅ 总结

### EasyCron 配置完成

- ✅ 已创建 Cron Job
- ✅ 已配置执行频率（每 5 分钟）
- ✅ 已配置 HTTP Headers（Authorization）
- ✅ 已激活任务

### 注意

- ⚠️ EasyCron 免费版每天 20 次执行
- ⚠️ 每 5 分钟执行一次会超过限制
- 💡 建议改为每 10 分钟或使用 Cron-job.org

### 推荐

**如果每天执行 20 次足够：**
- ✅ 使用 EasyCron（每 10 分钟执行一次）

**如果需要更频繁：**
- ✅ 使用 Cron-job.org（完全免费，无限制）

---

详细配置步骤请查看：`docs/EasyCron批量结算配置指南.md`


