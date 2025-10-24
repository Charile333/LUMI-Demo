# 🚀 快速数据库设置指南（Windows）

## 方法 1: 使用 pgAdmin（推荐）

### 步骤 1：打开 pgAdmin
1. 打开 pgAdmin 4（已随 PostgreSQL 安装）
2. 连接到 PostgreSQL（输入你的密码）

### 步骤 2：创建数据库
1. 右键点击 "Databases"
2. 选择 "Create" -> "Database..."
3. Database 名称：`market_clob`
4. 点击 "Save"

### 步骤 3：初始化表结构
1. 选中 `market_clob` 数据库
2. 点击顶部的 "Query Tool" 按钮（🔧 图标）
3. 打开文件 `scripts/setup-database.sql`
4. 复制全部内容到 Query Tool
5. 点击 "Execute" (▶️ 按钮) 或按 F5

### 步骤 4：验证
在 Query Tool 中运行：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

应该看到 7 个表：
- markets
- orders
- trades
- settlements
- balances
- users
- activity_logs

---

## 方法 2: 使用命令行

### 步骤 1：打开 PowerShell（以管理员身份）

### 步骤 2：运行设置脚本
```powershell
cd E:\project\market
.\scripts\windows-setup.ps1
```

按提示输入 PostgreSQL 密码，脚本会自动：
1. ✅ 检查 PostgreSQL
2. ✅ 创建数据库
3. ✅ 初始化表结构
4. ✅ 验证安装

### 步骤 3：手动方式（如果脚本失败）

```powershell
# 设置密码（替换 yourpassword）
$env:PGPASSWORD="yourpassword"

# 创建数据库
createdb -U postgres market_clob

# 初始化表
psql -U postgres -d market_clob -f scripts/setup-database.sql

# 验证
psql -U postgres -d market_clob -c "\dt"
```

---

## 配置环境变量

### 创建或编辑 `.env.local`

```env
# PostgreSQL 数据库
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/market_clob

# 平台钱包
PLATFORM_WALLET_PRIVATE_KEY=0x...
PLATFORM_WALLET_ADDRESS=0x...

# 合约地址
TEST_ADAPTER_ADDRESS=0x5D440c98B55000087a8b0C164f1690551d18CfcC
MOCK_USDC_ADDRESS=0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a
FULL_CTF_ADDRESS=0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
EXCHANGE_ADDRESS=0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d

# RPC
NEXT_PUBLIC_AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

⚠️ **重要**：将 `yourpassword` 替换为你的 PostgreSQL 密码！

---

## 测试连接

```bash
npm run dev
```

然后在另一个终端：

```bash
npx ts-node scripts/test-db-connection.ts
```

预期输出：
```
🧪 测试数据库连接...
✅ 数据库连接成功
✅ 所有必需的表都已创建！
```

---

## 常见问题

### Q: 忘记 PostgreSQL 密码怎么办？

**方法 1：通过 pgAdmin 重置**
1. 打开 pgAdmin
2. 右键 postgres 用户
3. 选择 Properties -> Definition
4. 设置新密码

**方法 2：修改 pg_hba.conf**
1. 找到 PostgreSQL 安装目录（通常在 `C:\Program Files\PostgreSQL\17\data`）
2. 编辑 `pg_hba.conf`
3. 将 `md5` 改为 `trust`（临时）
4. 重启 PostgreSQL 服务
5. 连接并修改密码：
   ```sql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```
6. 改回 `md5` 并重启服务

### Q: 端口 5432 已被占用？

```powershell
# 查看占用端口的进程
netstat -ano | findstr :5432

# 停止 PostgreSQL 服务
net stop postgresql-x64-17

# 启动 PostgreSQL 服务
net start postgresql-x64-17
```

### Q: 数据库连接超时？

检查防火墙设置，确保 5432 端口允许本地连接。

---

## 完成后

✅ 数据库已设置  
✅ 表结构已创建  
✅ 环境变量已配置  

**下一步：测试和集成**

```bash
# 测试数据库
npx ts-node scripts/test-db-connection.ts

# 启动开发服务器
npm run dev

# 访问交易页面
# http://localhost:3000/trade/1
```

---

**需要帮助？** 告诉我遇到了什么问题！







