# 🔐 管理后台访问指南

## 🚀 快速访问

### 正确的访问路径

1. **登录页面**：
   ```
   https://lumi-demo.vercel.app/admin/login
   ```

2. **市场管理页面**：
   ```
   https://lumi-demo.vercel.app/admin/markets
   ```

3. **创建市场页面**：
   ```
   https://lumi-demo.vercel.app/admin/create-market
   ```

## ❌ 错误的路径

以下路径**不存在**，会导致 404 错误：
- ❌ `/markets/admin/markets`
- ❌ `/admin/markets/admin/markets`
- ❌ `/markets/create-market`

## 🔒 访问步骤

### 步骤1：访问登录页面

打开浏览器，访问：
```
https://lumi-demo.vercel.app/admin/login
```

### 步骤2：输入密码

- **开发环境**：默认密码 `admin123`
- **生产环境**：需要在 Vercel 环境变量中配置 `ADMIN_PASSWORD`

### 步骤3：登录成功

登录成功后，会自动重定向到：
- `/admin/create-market`（创建市场页面）

或者手动访问：
- `/admin/markets`（市场管理页面）

## 📋 功能说明

### 1. 登录页面 (`/admin/login`)

- 密码输入
- 错误提示
- 自动重定向
- 记住登录状态（7天）

### 2. 市场管理页面 (`/admin/markets`)

- 查看所有市场
- 按链上状态筛选（全部、未上链、激活中、已上链、失败）
- 激活市场上链
- 删除市场
- 查看市场详情
- 创建新市场

### 3. 创建市场页面 (`/admin/create-market`)

- 创建新市场
- 配置市场信息
- 选择分类和子分类
- 设置时间
- 配置优先级
- 实时表单反馈

## 🔧 配置环境变量

在 Vercel 中配置环境变量：

1. 打开 Vercel 项目设置
2. 进入 **Environment Variables**
3. 添加以下变量：
   - `ADMIN_PASSWORD`: 管理员密码（必填）
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

## ⚠️ 常见问题

### Q1: 访问 `/admin/markets` 显示 404？

**A**: 检查：
1. 路径是否正确：应该是 `/admin/markets`，不是 `/markets/admin/markets`
2. 是否已部署最新代码
3. 清除浏览器缓存并刷新

### Q2: 访问 `/admin/markets` 被重定向到登录页？

**A**: 这是正常的！中间件保护了所有 `/admin/*` 路径，需要先登录。

### Q3: 登录后仍然无法访问？

**A**: 检查：
1. Cookie 是否正常设置（F12 → Application → Cookies）
2. 环境变量 `ADMIN_PASSWORD` 是否配置
3. 清除浏览器缓存并重新登录

### Q4: 忘记密码？

**A**: 
- 开发环境：默认密码 `admin123`
- 生产环境：检查 Vercel 环境变量 `ADMIN_PASSWORD`

## 🔗 相关文档

- [管理员访问指南](./ADMIN_ACCESS_GUIDE.md)
- [管理后台访问路径](./docs/管理后台访问路径.md)
- [激活市场指南](./docs/激活市场指南.md)

