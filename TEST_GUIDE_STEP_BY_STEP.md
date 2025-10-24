# 🧪 后台批量创建 - 分步测试指南

## 🎯 测试目标

验证功能一：团队后台批量创建市场

---

## 📋 前提条件

### 1. 检查数据库配置

打开 `.env.local`，确保有以下配置：

```env
# 如果使用 Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 或使用 PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### 2. 确保数据库表已创建

```bash
# 如果使用 Supabase，在 Supabase Dashboard 的 SQL Editor 中执行：
# 1. scripts/supabase-step2-tables.sql
# 2. scripts/add-activity-fields.sql

# 或使用 npm 命令：
npm run db:setup
npm run db:migrate
```

---

## ✅ 测试步骤

### 步骤 1: 启动服务器 ⚡

```bash
# 在终端运行
npm run dev
```

**预期输出**：
```
🚀 服务器已启动
📍 地址: http://localhost:3000
```

**验证**：在浏览器访问 `http://localhost:3000`，应该能看到页面

---

### 步骤 2: 访问管理后台 📝

```
打开浏览器，访问：
http://localhost:3000/admin/create-market
```

**预期看到**：
- 美观的表单界面
- 渐变色背景
- 绿色提示卡片："市场将保存到数据库，完全免费"

---

### 步骤 3: 填写表单创建第一个市场 🚗

**填写以下内容**：

```
市场标题: 特斯拉 2025 Q1 交付量会超过 50 万吗？

市场描述: 预测特斯拉 2025 年第一季度全球交付量是否会超过 50 万辆。根据特斯拉官方财报结算。

主分类: automotive（汽车与新能源）

子分类: 新能源

图片 URL: (留空或随意填写)

标签: 特斯拉, 电动车, 交付量

优先级: ⭐ 推荐

预言机奖励: 10 USDC
```

**点击**: "✨ 创建市场（免费、即时）"

**预期结果** ✅：
- 弹出成功提示框
- 显示：
  ```
  ✅ 市场创建成功（数据库）
  状态：草稿
  成本：$0
  将在活跃后自动上链
  ```
- 表单自动重置为空

---

### 步骤 4: 创建第二个市场 🤖

**快速填写**：

```
标题: GPT-5 会在 2025 年发布吗？
描述: 预测 OpenAI 是否会在 2025 年内发布 GPT-5
分类: tech-ai > 人工智能
优先级: 🔥 热门
奖励: 15 USDC
```

**提交** → 看到成功提示 ✅

---

### 步骤 5: 创建第三个市场 ⚽

```
标题: 2025 世界杯中国队会进前 16 吗？
描述: 预测中国男足在 2025 世界杯的表现
分类: sports-gaming > 足球
优先级: 📊 普通
奖励: 10 USDC
```

**提交** → 看到成功提示 ✅

---

### 步骤 6: 验证数据库 🗄️

**方法 A：使用 Supabase Dashboard**

1. 访问 Supabase Dashboard
2. 点击 Table Editor
3. 选择 `markets` 表
4. 应该看到 3 条新记录

**预期数据**：
```
| id | title | status | blockchain_status | views | interested_users |
|----|-------|--------|-------------------|-------|------------------|
| 1  | 特斯拉... | draft | not_created | 0 | 0 |
| 2  | GPT-5... | draft | not_created | 0 | 0 |
| 3  | 2025世界杯... | draft | not_created | 0 | 0 |
```

**方法 B：使用 SQL 查询**

```bash
# 如果使用 PostgreSQL
psql $DATABASE_URL -c "SELECT id, title, status, blockchain_status FROM markets ORDER BY id DESC LIMIT 5;"
```

---

### 步骤 7: 测试批量创建 API 📦

**打开新的终端**，运行：

```bash
curl -X POST http://localhost:3000/api/admin/markets/batch-create \
  -H "Content-Type: application/json" \
  -d "{\"markets\":[{\"title\":\"批量测试1\",\"description\":\"测试1\",\"mainCategory\":\"emerging\"},{\"title\":\"批量测试2\",\"description\":\"测试2\",\"mainCategory\":\"emerging\"}]}"
```

**预期输出**：
```json
{
  "success": true,
  "count": 2,
  "message": "✅ 成功创建 2 个市场\n成本：$0\n所有市场将在活跃后自动上链"
}
```

---

### 步骤 8: 再次验证数据库 ✅

刷新 Supabase Dashboard 或重新运行查询：

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as total FROM markets;"
```

**预期结果**: 总数应该是 5 个（3 个手动 + 2 个批量）

---

## 📊 测试结果检查清单

完成以下检查：

- [ ] ✅ 管理后台页面能正常访问
- [ ] ✅ 表单能正常提交
- [ ] ✅ 提交后显示成功提示
- [ ] ✅ 表单自动重置
- [ ] ✅ 数据库中有新记录
- [ ] ✅ 记录的 status = 'draft'
- [ ] ✅ 记录的 blockchain_status = 'not_created'
- [ ] ✅ 批量创建 API 正常工作
- [ ] ✅ 创建的市场 views = 0
- [ ] ✅ 创建的市场 interested_users = 0

---

## 🎉 测试通过标准

如果上述所有检查项都通过，说明：

✅ **功能一：团队后台批量创建 - 完全正常！**

**成本**: $0  
**速度**: < 100ms  
**功能**: 完整  

---

## ⚠️ 常见问题

### 问题 1: "数据库连接失败"

**解决**:
```bash
# 检查 DATABASE_URL 或 SUPABASE_URL 是否正确
# 测试连接
node -e "require('./lib/db').testConnection()"
```

### 问题 2: "表不存在"

**解决**:
```bash
# 运行数据库迁移
npm run db:setup
npm run db:migrate
```

### 问题 3: "API 404 错误"

**解决**:
```bash
# 确保服务器已启动
npm run dev
```

---

## 🎯 下一步测试

功能一测试通过后，继续测试：

1. **功能二**: 活跃度评分
   - 测试浏览追踪
   - 测试感兴趣标记

2. **功能三**: 按需激活
   - 测试手动激活
   - 测试自动激活

3. **功能四**: 链下订单
   - 测试订单签名
   - 测试订单匹配

---

**测试指南创建**: 2025-10-24  
**难度**: ⭐ 简单  
**预计时间**: 5 分钟



