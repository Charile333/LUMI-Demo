# 🔑 添加 CRON_SECRET 步骤（详细版）

## 📋 生成的 CRON_SECRET

已经为你生成了一个新的 CRON_SECRET：

```
TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=
```

**⚠️ 重要：**
- 这个值需要在 **Vercel** 和 **GitLab** 两处都添加
- 两处的值必须**完全一致**

---

## 🚀 步骤 1：添加到 Vercel

### 1.1 打开 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 登录你的 Vercel 账户
3. 选择你的项目（LUMI-Demo 或类似名称）

### 1.2 进入环境变量设置

1. 在项目页面，点击顶部菜单 `Settings`（设置）
2. 点击左侧菜单 `Environment Variables`（环境变量）

### 1.3 添加 CRON_SECRET 变量

1. 找到 `Variables` 部分（环境变量列表）
2. 点击 `Add New`（添加新变量）按钮
3. 填写以下信息：

**Key（变量名）：**
```
CRON_SECRET
```

**Value（变量值）：**
```
TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=
```

**Environment（环境）：**
- 选择 `Production`（生产环境）
- 或选择 `All Environments`（所有环境）
- 推荐选择 `All Environments`

**其他选项：**
- ✅ 勾选 `Sensitive`（敏感信息）- 隐藏显示
- ❌ 不勾选其他选项

4. 点击 `Save`（保存）按钮

### 1.4 验证已添加

1. 在环境变量列表中，应该能看到 `CRON_SECRET` 变量
2. 值应该显示为 `****`（已隐藏）
3. 环境应该显示为你选择的环境（`Production` 或 `All Environments`）

### 1.5 重新部署（重要）

**⚠️ 重要：** 添加环境变量后，需要重新部署项目才能生效。

#### 方法 1：自动触发部署

1. 如果启用了自动部署（从 Git 推送），可以：
   - 提交并推送代码
   - 或者等待 Vercel 检测到更改并自动部署

#### 方法 2：手动触发部署

1. 在 Vercel Dashboard，进入 `Deployments`（部署）页面
2. 找到最新的部署
3. 点击右侧的 `...`（三个点）
4. 选择 `Redeploy`（重新部署）
5. 或点击 `Create Deployment`（创建部署）

---

## 🚀 步骤 2：添加到 GitLab

### 2.1 打开 GitLab 项目

1. 访问：https://gitlab.com/novatamoffat-group/LUMI-Demo
2. 登录你的 GitLab 账户

### 2.2 进入 CI/CD 变量设置

1. 在项目页面，点击左侧菜单 `Settings`（设置）
2. 展开 `CI/CD` 部分
3. 找到 `Variables` 部分
4. 点击 `Expand`（展开）

### 2.3 添加 CRON_SECRET 变量

1. 点击 `Add variable`（添加变量）按钮
2. 填写以下信息：

**Key（变量名）：**
```
CRON_SECRET
```

**Value（变量值）：**
```
TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=
```

**Type（类型）：**
- 选择 `Variable`（变量）

**Environment scope（环境范围）：**
- 选择 `All environments`（所有环境）

**Flags（标志）：**
- ✅ **Protect variable**（保护变量）- 勾选
  - 只在保护分支中可用
- ✅ **Mask variable**（隐藏变量）- 勾选（重要）
  - 在日志中隐藏实际值
- ❌ **Expand variable reference**（展开变量引用）- 不勾选

3. 点击 `Add variable`（添加变量）按钮保存

### 2.4 验证已添加

1. 在变量列表中，应该能看到 `CRON_SECRET` 变量
2. 值应该显示为 `****`（已隐藏，因为勾选了 Masked）
3. 应该有 `🔒 Protected` 和 `🎭 Masked` 标记

---

## ✅ 验证配置

### 验证 1：检查 Vercel 配置

1. 打开 Vercel Dashboard
2. 进入 `Settings` > `Environment Variables`
3. 确认：
   - ✅ `CRON_SECRET` 变量存在
   - ✅ 值为隐藏状态（`****`）
   - ✅ 环境正确（`Production` 或 `All Environments`）

### 验证 2：检查 GitLab 配置

1. 打开 GitLab 项目
2. 进入 `Settings` > `CI/CD` > `Variables`
3. 确认：
   - ✅ `CRON_SECRET` 变量存在
   - ✅ 值为隐藏状态（`****`）
   - ✅ 有 `🔒 Protected` 标记
   - ✅ 有 `🎭 Masked` 标记

### 验证 3：测试 Pipeline 执行

1. 进入 GitLab 项目 > `CI/CD` > `Pipelines`
2. 点击 `Run pipeline`（运行管道）
3. 选择分支：`master`（或你的主分支）
4. 点击 `Run pipeline`
5. 等待执行完成
6. 查看日志，应该看到：
   - ✅ `HTTP 状态码: 200`
   - ✅ `✅ 批量结算触发成功`

**如果看到 `401 Unauthorized` 错误：**
- ❌ `CRON_SECRET` 值不一致
- ❌ Vercel 环境变量未重新部署
- ❌ GitLab 变量配置错误

---

## 📝 配置检查清单

配置完成后，检查：

### Vercel 配置
- [ ] `CRON_SECRET` 变量已添加
- [ ] 值设置为：`TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=`
- [ ] 环境设置为：`Production` 或 `All Environments`
- [ ] 已重新部署项目（让环境变量生效）

### GitLab 配置
- [ ] `CRON_SECRET` 变量已添加
- [ ] 值设置为：`TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=`
- [ ] `Protect variable` 已勾选
- [ ] `Mask variable` 已勾选
- [ ] 环境范围设置为：`All environments`

### 验证测试
- [ ] 手动触发 GitLab Pipeline 执行成功
- [ ] 日志显示 `HTTP 状态码: 200`
- [ ] 日志显示 `✅ 批量结算触发成功`

---

## ⚠️ 重要注意事项

### 1. 值必须完全一致

**Vercel 和 GitLab 中的 `CRON_SECRET` 值必须完全一致：**
- ✅ 包括大小写
- ✅ 包括所有特殊字符（+、/、=）
- ✅ 不要有多余的空格或换行

**如果两处值不一致，API 调用会返回 `401 Unauthorized` 错误。**

### 2. Vercel 需要重新部署

**添加环境变量后，必须重新部署 Vercel 项目：**
- 否则 API 无法读取新的环境变量
- 会导致 `CRON_SECRET` 验证失败

### 3. GitLab 变量安全

**建议勾选：**
- ✅ `Protect variable` - 保护变量
- ✅ `Mask variable` - 隐藏变量（重要：日志中不会显示实际值）

---

## 🐛 故障排查

### 问题 1：API 返回 401 Unauthorized

**原因：** `CRON_SECRET` 值不一致或未配置

**解决方法：**
1. 检查 Vercel 中的 `CRON_SECRET` 值
2. 检查 GitLab 中的 `CRON_SECRET` 值
3. 确保两处值完全一致
4. 确保 Vercel 已重新部署

### 问题 2：Vercel 环境变量未生效

**原因：** 添加环境变量后未重新部署

**解决方法：**
1. 在 Vercel Dashboard 重新部署项目
2. 或者推送代码触发自动部署
3. 等待部署完成后再测试

### 问题 3：GitLab Pipeline 无法读取变量

**原因：** 变量配置错误或未激活

**解决方法：**
1. 检查 GitLab CI/CD Variables 配置
2. 确保变量未删除或禁用
3. 确保 Pipeline Schedule 已激活

---

## 🎯 下一步

配置完成后：

1. ✅ 添加 `VERCEL_APP_URL` 变量到 GitLab
2. ✅ 创建 Pipeline Schedule（定时任务）
3. ✅ 测试执行

详细步骤请查看：`docs/GitLab批量结算配置步骤.md`

---

## 📝 总结

**CRON_SECRET 值：**
```
TjBFJJPXMYUuA41hPCo1mL51Nt+g9rIV+raY95iRE2g=
```

**需要添加到两处：**
1. ✅ Vercel Dashboard > Settings > Environment Variables
2. ✅ GitLab Settings > CI/CD > Variables

**重要：**
- ⚠️ 两处的值必须完全一致
- ⚠️ Vercel 需要重新部署才能生效
- ⚠️ GitLab 建议勾选 `Masked` 隐藏变量


