# 🚀 外部 Cron 服务配置指南（GitLab 无 Schedules 的解决方案）

## 🎯 问题

**在 GitLab CI/CD 页面找不到 Schedules？**

这可能是因为：
- GitLab 免费版可能不提供 Pipeline Schedules
- 或者需要特定权限才能看到

**解决方案：使用外部 Cron 服务**

---

## ⭐ 推荐方案：Cron-job.org（最推荐）

### ✅ 优势

- ✅ **完全免费**（无执行次数限制）
- ✅ **配置简单**（5 分钟完成）
- ✅ **不需要 GitLab Pipeline Schedules**
- ✅ **支持每 5 分钟执行一次**
- ✅ **可靠性高**

### 🚀 快速配置（3 步）

#### 步骤 1：注册并登录

1. 访问：https://cron-job.org/
2. 点击 `Sign up` 注册（免费）
3. 登录账户

#### 步骤 2：创建 Cron Job

1. 点击 `Create cronjob`（创建定时任务）
2. 配置：
   - **Title**: `批量结算交易`
   - **Address**: `https://lumi-demo.vercel.app/api/cron/settle-trades`
   - **Method**: `POST`
   - **Schedule**: `*/5 * * * *`（每 5 分钟）
   - **Timezone**: `Asia/Shanghai`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Status**: `Enabled`
3. 点击 `Create cronjob` 保存

#### 步骤 3：测试执行

1. 点击任务右侧的 `Run now`（立即运行）
2. 查看执行历史，应该看到 `200 OK`

---

## 📋 需要的信息

### 1. CRON_SECRET

从 Vercel Dashboard 获取：
1. Vercel Dashboard > Settings > Environment Variables
2. 找到 `CRON_SECRET` 变量
3. 点击显示值
4. 复制完整值

**当前值（如果已配置）：**
```
O8fh6eCY3v54f3jp+uw5TCecErTPhuLCmA+V5Vdrjsw=
```

### 2. VERCEL_APP_URL

你的 Vercel 应用 URL：
```
https://lumi-demo.vercel.app
```
（替换为你的实际 URL）

### 3. API 端点

完整 API 地址：
```
https://lumi-demo.vercel.app/api/cron/settle-trades
```

---

## ⚠️ 配置注意事项

### 1. Authorization Header

**格式：**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**示例：**
```
Authorization: Bearer O8fh6eCY3v54f3jp+uw5TCecErTPhuLCmA+V5Vdrjsw=
```

**注意：**
- ✅ 必须包含 `Bearer `（注意后面有空格）
- ✅ 替换 `YOUR_CRON_SECRET` 为实际值

### 2. Content-Type Header

**格式：**
```
Content-Type: application/json
```

### 3. URL 格式

**正确：**
```
https://lumi-demo.vercel.app/api/cron/settle-trades
```

**错误：**
```
https://lumi-demo.vercel.app/api/cron/settle-trades/  (不要尾部斜杠)
```

---

## 🔍 其他可选方案

### 方案 2：EasyCron

**优势：**
- ✅ 免费版可用
- ✅ 界面友好
- ⚠️ 免费版每天 20 次（不够每 5 分钟执行）

**配置：**
1. 注册：https://www.easycron.com/
2. 创建 Cron Job
3. 配置同上

---

### 方案 3：Uptime Robot

**优势：**
- ✅ 完全免费
- ✅ 配置简单
- ⚠️ 需要修改 API 支持 GET 请求

---

## ✅ 配置检查清单

配置完成后，检查：

- [ ] Cron-job.org 账户已注册并登录
- [ ] Cron Job 已创建
- [ ] Address 正确：`https://lumi-demo.vercel.app/api/cron/settle-trades`
- [ ] Method 设置为：`POST`
- [ ] Schedule 设置为：`*/5 * * * *`
- [ ] Authorization Header 正确（包含 `Bearer `）
- [ ] Content-Type Header 设置为：`application/json`
- [ ] Status 设置为：`Enabled`
- [ ] 测试执行成功（`200 OK`）

---

## 🎯 总结

**由于 GitLab 找不到 Schedules，使用 Cron-job.org 是最简单的方案：**

1. ✅ 完全免费
2. ✅ 无执行次数限制
3. ✅ 配置简单（5 分钟完成）
4. ✅ 不需要 GitLab Pipeline Schedules

**配置完成后，批量结算将自动运行！**

---

详细步骤请查看：
- `docs/Cron-job.org批量结算配置指南.md`（推荐）
- `docs/EasyCron批量结算配置指南.md`


