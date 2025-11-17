# 🆓 Vercel 免费版批量结算配置说明

## ⚠️ 重要说明

**Vercel 免费版（Hobby）的 Cron Jobs 有限制：**
- ❌ 执行频率极低（每天只执行几次）
- ❌ 最长执行时间只有 10 秒

**解决方案：使用 GitHub Actions 作为外部 Cron 服务**

---

## 🚀 快速配置

### 步骤 1：更新 GitHub Actions 工作流

编辑 `.github/workflows/batch-settle.yml`，将 `YOUR_VERCEL_APP_URL` 替换为你的实际 Vercel 域名：

```yaml
# 将这行：
https://YOUR_VERCEL_APP_URL.vercel.app/api/cron/settle-trades

# 替换为（例如）：
https://your-app-name.vercel.app/api/cron/settle-trades
```

### 步骤 2：配置 GitHub Secrets

1. 打开 GitHub 仓库
2. 进入 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret`
4. 添加：
   - **Name**: `CRON_SECRET`
   - **Value**: 从 Vercel 环境变量中复制 `CRON_SECRET` 的值

### 步骤 3：提交并推送

```bash
git add .github/workflows/batch-settle.yml
git commit -m "feat: 添加 GitHub Actions 批量结算工作流"
git push
```

### 步骤 4：验证执行

1. 打开 GitHub 仓库
2. 进入 `Actions` 标签页
3. 应该看到 "Batch Settle Trades" 工作流
4. 可以手动触发测试：点击 "Run workflow"

---

## 📊 工作原理

```
GitHub Actions（每 5 分钟）
   ↓
调用 Vercel API
   ↓
POST /api/cron/settle-trades
   ↓
验证 Authorization header
   ↓
执行批量结算逻辑
   ↓
返回结果
```

---

## 🔍 监控和调试

### 查看执行日志

1. **GitHub Actions**: 
   - 仓库 > Actions > Batch Settle Trades
   - 点击最新执行 > 查看日志

2. **Vercel Logs**:
   - Vercel Dashboard > 项目 > Logs
   - 筛选 `/api/cron/settle-trades`

3. **数据库**:
   ```sql
   SELECT * FROM settlements 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

## ✅ 效果

- ✅ 每 5 分钟自动批量结算
- ✅ 完全免费（GitHub Actions 免费）
- ✅ 用户无需支付 Gas
- ✅ 完全自动化

---

## 📝 注意事项

1. **时区**：GitHub Actions 使用 UTC 时间，注意时区转换
2. **Secret 安全**：确保 `CRON_SECRET` 配置正确
3. **API URL**：确保 Vercel 域名正确
4. **环境变量**：确保 Vercel 环境变量已配置

---

详细文档请查看：`docs/Vercel免费版批量结算替代方案.md`

