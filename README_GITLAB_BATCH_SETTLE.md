# 🔷 GitLab 批量结算快速配置指南

## 🚀 快速配置（3 步）

### 步骤 1：配置 GitLab CI/CD 变量

1. 打开 GitLab 项目
2. 进入 `Settings` > `CI/CD` > `Variables`
3. 添加以下变量：

**CRON_SECRET**
- **Key**: `CRON_SECRET`
- **Value**: 从 Vercel 环境变量中复制 `CRON_SECRET` 的值
- ✅ Protected
- ✅ Masked

**VERCEL_APP_URL**
- **Key**: `VERCEL_APP_URL`
- **Value**: 你的 Vercel 应用 URL，例如：`https://your-app.vercel.app`
- ✅ Protected
- ❌ Masked（URL 可以显示）

---

### 步骤 2：创建 Pipeline Schedule（定时任务）

1. 进入 `CI/CD` > `Schedules`
2. 点击 `New schedule`
3. 配置：
   - **Description**: `批量结算交易（每 5 分钟）`
   - **Interval Pattern**: `*/5 * * * *`
   - **Timezone**: `Asia/Shanghai`（或你的时区）
   - **Target Branch**: `master`（或你的主分支）
   - **Activated**: ✅ 勾选
4. 点击 `Save pipeline schedule`

---

### 步骤 3：测试执行

#### 手动测试：
1. 进入 `CI/CD` > `Pipelines`
2. 点击 `Run pipeline`
3. 选择分支：`master`
4. 点击 `Run pipeline`
5. 等待执行完成，查看日志

---

## ✅ 完成！

配置完成后，GitLab 会每 5 分钟自动调用 Vercel API 执行批量结算。

---

## 🔍 监控和调试

### 查看执行日志

1. 进入 `CI/CD` > `Pipelines`
2. 点击最新的 Pipeline
3. 点击 `batch-settle-trades` job
4. 查看执行日志

### 检查数据库

```sql
SELECT * FROM settlements 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📝 注意事项

1. **时区**：确保 Pipeline Schedule 时区设置正确
2. **变量**：确保 `CRON_SECRET` 和 `VERCEL_APP_URL` 已配置
3. **分支**：确保定时任务指向正确的分支

---

详细文档请查看：`docs/GitLab批量结算配置指南.md`

