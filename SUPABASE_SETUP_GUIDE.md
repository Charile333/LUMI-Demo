# 🚀 Supabase 快速设置指南

## ✅ 第一步：创建 Supabase 项目（2 分钟）

### 1. 访问 Supabase
打开浏览器访问：**https://supabase.com**

### 2. 注册/登录
- 点击右上角 **"Start your project"**
- 选择 **"Sign in with GitHub"**（推荐）
- 或使用邮箱注册

### 3. 创建新项目
点击 **"New Project"** 后填写：

```
Organization: 选择你的组织（或创建新的）
Project name: market-clob
Database Password: 设置一个强密码（务必记住！）
Region: Southeast Asia (Singapore) - 亚洲最近的节点
Pricing Plan: Free ($0/月)
```

点击 **"Create new project"**

### 4. 等待初始化
⏳ 等待约 2-3 分钟，数据库会自动创建

---

## ✅ 第二步：导入数据库表结构（2 分钟）

### 1. 打开 SQL Editor
在 Supabase 控制台左侧菜单：
- 点击 **"SQL Editor"** 图标（📝）

### 2. 创建新查询
- 点击 **"New query"** 按钮

### 3. 复制表结构代码
打开项目文件：
```
E:\project\market\scripts\setup-database.sql
```

**全选复制** 这个文件的全部内容

### 4. 粘贴并执行
- 粘贴到 Supabase SQL Editor
- 点击右下角的 **"Run"** 按钮（或按 Ctrl+Enter）

### 5. 验证表创建
在左侧点击 **"Table Editor"**，应该看到：
- ✅ markets
- ✅ orders
- ✅ trades
- ✅ settlements
- ✅ balances
- ✅ users
- ✅ activity_logs

---

## ✅ 第三步：获取连接信息（1 分钟）

### 1. 打开数据库设置
左侧菜单点击：**Settings** ⚙️ → **Database**

### 2. 找到连接字符串
滚动到 **"Connection string"** 部分

### 3. 选择 "Connection pooling"
⚠️ **重要**：必须选择 **"Connection pooling"**（适合 Serverless）

你会看到类似这样的 URL：
```
postgresql://postgres.abcdefghijklmn:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 4. 复制完整 URL
点击右侧的 📋 复制按钮

---

## ✅ 第四步：更新项目配置（1 分钟）

### 1. 打开配置文件
```
E:\project\market\.env.local
```

### 2. 找到 DATABASE_URL 这一行

**替换前：**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/market_clob
```

**替换后：**
```env
DATABASE_URL=postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **关键步骤**：将 URL 中的 `[YOUR-PASSWORD]` 替换为你在第一步设置的**实际数据库密码**

### 3. 保存文件

---

## ✅ 第五步：测试连接（30 秒）

### 在项目目录打开终端

运行测试命令：
```bash
npx ts-node scripts/test-db-connection.ts
```

**预期输出：**
```
🧪 测试数据库连接...

1️⃣ 测试基本连接...
✅ 数据库连接成功: 2024-10-23T...

2️⃣ 检查数据库表...
📋 已创建的表: [
  'activity_logs',
  'balances',
  'markets',
  'orders',
  'settlements',
  'trades',
  'users'
]
✅ 所有必需的表都已创建！

...

✅ 数据库测试全部通过！
🚀 可以开始使用 CLOB 系统了！
```

---

## 🎉 完成！现在你拥有：

✅ **云端 PostgreSQL 数据库**
- 永久存储
- 自动备份
- 全球可访问

✅ **免费额度**
- 500MB 数据库存储
- 每天 50,000 API 请求
- 5GB 带宽/月
- 2 个并发连接

✅ **企业级功能**
- 自动扩展
- SSL 加密连接
- 实时数据订阅
- 99.9% 正常运行时间

---

## 🚀 启动应用

```bash
npm run dev
```

访问：
- 主页：http://localhost:3000
- CLOB 交易：http://localhost:3000/clob-trade/1

**数据现在存储在云端了！** 🌐

---

## 📊 Supabase 控制台功能

### Table Editor
- 📝 可视化编辑数据
- 添加/删除/修改记录
- 类似 Excel 的界面

### SQL Editor
- 运行任意 SQL 查询
- 保存常用查询
- 查看执行历史

### Database
- 查看连接信息
- 管理扩展
- 配置备份

### API
- 自动生成 RESTful API
- 实时订阅功能
- GraphQL 支持

---

## 🔍 验证数据

### 在 Supabase Table Editor 中：

1. **查看市场表**
   - 左侧点击 **"markets"**
   - 应该是空的（等待创建市场）

2. **插入测试市场**
   - 点击 **"Insert row"**
   - 填写字段：
     ```
     question_id: test_001
     title: 特朗普会赢得2024年美国总统选举吗？
     description: 测试市场
     main_category: geopolitics
     status: active
     blockchain_status: created
     ```
   - 点击 **"Save"**

3. **验证订单表**
   - 点击 **"orders"** 表
   - 现在是空的
   - 用户下单后会自动填充

---

## 💡 常用操作

### 查看所有市场
在 SQL Editor 中运行：
```sql
SELECT * FROM markets ORDER BY created_at DESC;
```

### 查看所有订单
```sql
SELECT 
  o.*,
  m.title as market_title
FROM orders o
LEFT JOIN markets m ON o.market_id = m.id
ORDER BY o.created_at DESC
LIMIT 20;
```

### 查看成交记录
```sql
SELECT * FROM trades ORDER BY created_at DESC LIMIT 20;
```

### 查看订单簿
```sql
SELECT * FROM order_book_aggregated WHERE market_id = 1;
```

---

## 🔒 安全建议

### 1. 保护你的密码
- ❌ 不要将 `.env.local` 提交到 Git
- ✅ 已在 `.gitignore` 中排除
- ✅ 使用环境变量

### 2. 配置 Row Level Security (RLS)
Supabase 默认启用 RLS，你可以在控制台配置访问策略。

### 3. API 密钥管理
- Supabase 提供 anon key 和 service_role key
- anon key 用于前端（公开的）
- service_role key 用于后端（保密）

---

## 📈 升级选项

### 当前：Free 层
```
✅ 500MB 数据库
✅ 50K 请求/天
✅ 5GB 带宽/月
✅ 2 并发连接
```

### 需要升级时：Pro 层 ($25/月)
```
✅ 8GB 数据库
✅ 500K 请求/天
✅ 250GB 带宽/月
✅ 60 并发连接
✅ 每日备份
✅ 技术支持
```

---

## ⚠️ 常见问题

### Q1: 连接失败怎么办？
**检查清单：**
1. ✅ 数据库密码是否正确
2. ✅ URL 中的 `[YOUR-PASSWORD]` 已替换
3. ✅ 使用的是 "Connection pooling" URL
4. ✅ 网络连接正常

### Q2: 表未创建？
**解决方法：**
1. 回到 Supabase SQL Editor
2. 重新粘贴 `setup-database.sql` 内容
3. 点击 "Run"
4. 检查是否有错误信息

### Q3: 如何查看错误日志？
在 Supabase 控制台：
- 点击 **"Logs"**
- 查看最近的查询和错误

### Q4: 如何备份数据？
**自动备份：** Free 层不包含，Pro 层每日自动备份

**手动备份：**
1. Settings → Database
2. 点击 "Database Webhooks"
3. 或使用 SQL Editor 导出数据

---

## 🎯 下一步

### 1. 创建测试市场
使用 SQL Editor 或管理后台创建市场

### 2. 测试交易
访问 CLOB 交易页面，连接钱包下单

### 3. 部署到 Vercel
```bash
npx vercel
```

然后在 Vercel 环境变量中添加：
```
DATABASE_URL=你的Supabase连接字符串
```

---

## 📚 相关资源

- **Supabase 文档**: https://supabase.com/docs
- **PostgreSQL 教程**: https://supabase.com/docs/guides/database
- **JavaScript 客户端**: https://supabase.com/docs/reference/javascript
- **社区论坛**: https://github.com/supabase/supabase/discussions

---

## ✅ 完成检查清单

- [ ] 已创建 Supabase 项目
- [ ] 已导入数据库表结构（7个表）
- [ ] 已复制连接字符串
- [ ] 已更新 `.env.local`
- [ ] 数据库连接测试通过
- [ ] 可以访问 CLOB 交易页面
- [ ] 已创建测试市场
- [ ] 已测试下单功能

---

**🎉 恭喜！你现在拥有一个完全云端的预测市场平台！**

所有数据永久存储在 Supabase 云端，全球可访问！🌐







