# 🚀 Cron-job.org 批量结算配置指南（推荐方案）

## 📋 为什么选择 Cron-job.org？

- ✅ **完全免费**（无执行次数限制）
- ✅ **配置简单**（5 分钟完成）
- ✅ **支持 Cron 表达式**
- ✅ **可靠性高**
- ✅ **不需要 GitLab Pipeline Schedules**

---

## 🚀 配置步骤（5 分钟完成）

### 步骤 1：注册 Cron-job.org

1. 访问：https://cron-job.org/
2. 点击右上角 `Sign up`（注册）
3. 填写注册信息：
   - **Email**: 你的邮箱
   - **Password**: 设置密码（至少 8 个字符）
   - **Confirm Password**: 确认密码
4. 勾选同意条款
5. 点击 `Sign up` 完成注册
6. 检查邮箱并点击验证链接

---

### 步骤 2：登录 Cron-job.org

1. 访问：https://cron-job.org/
2. 点击右上角 `Sign in`（登录）
3. 输入邮箱和密码
4. 点击 `Sign in` 登录

---

### 步骤 3：创建 Cron Job

1. 登录后，点击顶部菜单 `Cronjobs`（定时任务）
2. 点击右上角 `Create cronjob`（创建定时任务）按钮

---

### 步骤 4：配置 Cron Job

填写以下信息：

#### 基本信息

**Title（标题）:**
```
批量结算交易
```

**Address（API 地址）:**
```
https://lumi-demo.vercel.app/api/cron/settle-trades
```
（替换为你的实际 Vercel URL）

**Request Method（请求方法）:**
- 选择：`POST`

---

#### 执行时间设置

**Schedule（Cron 表达式）:**
- 选择：`Custom`（自定义）
- 输入：`*/5 * * * *`

**Cron 表达式说明：**
- `*/5 * * * *` = 每 5 分钟执行一次
- `*/10 * * * *` = 每 10 分钟执行一次
- `0 * * * *` = 每小时整点执行

**Timezone（时区）:**
- 选择：`Asia/Shanghai`（中国标准时间）
- 或其他时区（根据你的需求）

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

#### 其他设置

**Status（状态）:**
- ✅ 选择：`Enabled`（启用）

**Timeout（超时时间）:**
- 默认：30 秒（足够使用）

**Notification（通知）:**
- ❌ 可以不勾选（可选）

---

### 步骤 5：保存配置

1. 滚动到页面底部
2. 检查所有配置是否正确
3. 点击 `Create cronjob`（创建定时任务）按钮

---

### 步骤 6：测试执行

#### 方法 1：在 Cron-job.org 中测试

1. 保存后，在 Cronjobs 列表中，找到刚才创建的任务
2. 点击右侧的 `Run now`（立即运行）按钮
3. 等待执行完成（几秒钟）
4. 点击任务，查看执行历史
5. 应该看到 `200 OK` 状态码

#### 方法 2：检查 Vercel Logs

1. 打开 Vercel Dashboard：https://vercel.com/dashboard
2. 选择你的项目
3. 进入 `Logs`（日志）标签页
4. 筛选 `/api/cron/settle-trades`
5. 应该能看到来自 Cron-job.org 的 API 调用记录

---

## ✅ 配置完成

配置完成后，Cron-job.org 会每 5 分钟自动调用 Vercel API 执行批量结算。

**效果：**
- ✅ 每 5 分钟自动批量结算
- ✅ 用户无需支付 Gas（平台代付）
- ✅ 完全自动化
- ✅ 完全免费（无限制）

---

## 🔍 监控和管理

### 查看执行历史

1. 在 Cron-job.org 中，进入 `Cronjobs` 页面
2. 点击你的任务（批量结算交易）
3. 查看 `Execution History`（执行历史）
4. 可以看到每次执行的：
   - 执行时间
   - HTTP 状态码
   - 响应内容
   - 执行耗时

### 修改执行频率

1. 在 `Cronjobs` 页面，点击你的任务
2. 点击 `Edit`（编辑）按钮
3. 修改 `Schedule`（例如改为 `*/10 * * * *` 每 10 分钟）
4. 点击 `Save` 保存

### 暂停/恢复任务

1. 在 `Cronjobs` 页面，找到你的任务
2. 点击 `Status`（状态）列的开关
3. `Enabled` = 运行中
4. `Disabled` = 已暂停

---

## ⚠️ 注意事项

### 1. CRON_SECRET 配置

**重要：** 确保 `Authorization` Header 中的值正确：
```
Bearer YOUR_CRON_SECRET
```

**格式：**
- ✅ 正确：`Bearer O8fh6eCY3v54f3jp+uw5TCecErTPhuLCmA+V5Vdrjsw=`
- ❌ 错误：`O8fh6eCY3v54f3jp+uw5TCecErTPhuLCmA+V5Vdrjsw=`（缺少 `Bearer `）

### 2. Vercel URL 配置

**格式：**
- ✅ 正确：`https://lumi-demo.vercel.app/api/cron/settle-trades`
- ❌ 错误：`https://lumi-demo.vercel.app/api/cron/settle-trades/`（尾部不要斜杠）

### 3. 时区设置

确保时区设置正确（例如：`Asia/Shanghai`），否则执行时间可能不对。

---

## 📊 方案对比

| 方案 | 免费 | 执行次数限制 | 配置难度 | 推荐度 |
|------|------|------------|---------|--------|
| **Cron-job.org** | ✅ 完全免费 | ✅ 无限制 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **EasyCron** | ✅ 免费版 | ⚠️ 每天 20 次 | ⭐ 简单 | ⭐⭐⭐⭐ |
| **Uptime Robot** | ✅ 完全免费 | ✅ 无限制 | ⭐ 简单 | ⭐⭐⭐ |

---

## ✅ 总结

### Cron-job.org 配置完成

- ✅ 已创建 Cron Job
- ✅ 已配置执行频率（每 5 分钟）
- ✅ 已配置 HTTP Headers（Authorization）
- ✅ 已激活任务

### 优势

- ✅ 完全免费（无执行次数限制）
- ✅ 支持每 5 分钟执行一次
- ✅ 配置简单（5 分钟完成）
- ✅ 可靠性高

### 推荐

**Cron-job.org 是最推荐的方案：**
- ✅ 完全免费
- ✅ 无执行次数限制
- ✅ 配置简单
- ✅ 适合 GitLab 用户（不需要 Pipeline Schedules）

---

详细配置步骤请查看：`docs/Cron-job.org批量结算配置指南.md`


