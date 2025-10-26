# 📦 Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用 GitHub 登录
4. 创建新项目：
   - Organization: 选择或创建
   - Project name: `lumi-alerts`
   - Database password: 生成强密码（保存好）
   - Region: 选择最近的区域（如 Singapore）
5. 等待项目创建完成（约2分钟）

## 2. 创建数据表

在 Supabase Dashboard:

1. 点击左侧 "Table Editor"
2. 点击 "Create a new table"
3. 表名: `alerts`
4. 添加以下列：

| Column Name | Type | Default | Extra |
|------------|------|---------|-------|
| id | int8 | auto | Primary Key |
| timestamp | timestamptz | now() | |
| symbol | text | | |
| message | text | | |
| severity | text | 'medium' | |
| type | text | | |
| details | jsonb | | |
| created_at | timestamptz | now() | |

5. 点击 "Save"

## 3. 获取 API 凭据

1. 点击左侧 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbG...`

## 4. 配置 Vercel 环境变量

在 Vercel Dashboard:

1. 进入你的项目
2. Settings → Environment Variables
3. 添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key

4. 重新部署项目

## 5. 配置 GitHub Secrets

在 GitHub 仓库:

1. Settings → Secrets and variables → Actions
2. 添加：
   - `SUPABASE_URL` = 你的 Project URL
   - `SUPABASE_KEY` = 你的 anon key

## ✅ 完成

现在你有了一个永久的云数据库，所有环境都能访问！

