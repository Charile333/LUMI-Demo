# 🔐 管理后台访问指南

## ✅ 已修复的问题

### 问题原因
`_dev_only_admin` 文件夹因为**下划线开头**，在 Next.js App Router 中被视为私有文件夹，不会生成路由。

### 解决方案
已将所有管理页面移动到正确的位置：

```
❌ 旧位置（不生成路由）: _dev_only_admin/
✅ 新位置（正常路由）: app/admin/
```

---

## 🚀 访问步骤

### 1️⃣ 访问登录页面

**URL**: 
```
http://localhost:3000/admin/login
```

### 2️⃣ 输入密码

**默认密码**（开发环境）：
```
admin123
```

**生产环境密码**：
在 `.env` 或 `.env.local` 中配置：
```env
ADMIN_PASSWORD=your_secure_password_here
```

### 3️⃣ 登录成功后访问

登录成功后会自动重定向到：
```
http://localhost:3000/admin/create-market
```

或者手动访问其他管理页面：
- 创建市场：`/admin/create-market`
- 其他管理功能：待添加

---

## 📂 文件结构

### ✅ 新的路由结构

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          ← 登录页面 ✅
│   └── create-market/
│       └── page.tsx          ← 创建市场页面 ✅
└── api/
    └── admin/
        ├── auth/
        │   ├── login/
        │   │   └── route.ts  ← 登录 API ✅
        │   └── logout/
        │       └── route.ts  ← 登出 API ✅
        └── markets/
            └── create/
                └── route.ts  ← 创建市场 API ✅
```

### ⚠️ 旧的文件（将被忽略）

```
_dev_only_admin/               ← 下划线开头，不生成路由
├── login/
│   └── page.tsx              ❌ 不可访问
└── create-market/
    └── page.tsx              ❌ 不可访问
```

---

## 🔒 权限保护

### 中间件保护

文件：`middleware.ts`

```typescript
// 保护所有 /admin 路径
if (request.nextUrl.pathname.startsWith('/admin')) {
  // 检查认证 cookie
  const authCookie = request.cookies.get('admin_authenticated');
  
  // 如果未认证，重定向到登录页
  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.redirect('/admin/login');
  }
}
```

### Cookie 配置

登录成功后设置的 Cookie：
- 名称：`admin_authenticated`
- 值：`true`
- 有效期：7 天
- HttpOnly：`true`（防止 XSS 攻击）
- Secure：生产环境自动启用
- SameSite：`lax`

---

## 🎯 快速测试

### 测试登录功能

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问登录页**：
   ```
   http://localhost:3000/admin/login
   ```

3. **输入密码**：
   ```
   admin123
   ```

4. **点击登录**

5. **自动跳转到创建市场页面**

### 测试创建市场

登录后：

1. 填写表单：
   - 标题：`测试市场 - 特斯拉 2025 Q1 销量预测`
   - 描述：`预测特斯拉 2025 年第一季度交付量是否超过 50 万辆`
   - 主分类：`🚗 汽车与新能源`
   - 子分类：`新能源`

2. 选择市场类型：
   - **二元选项**（推荐）：YES / NO
   - 多选项：自定义多个选项
   - 数值范围：预测具体数值

3. 设置时间：
   - 结束时间：2025-04-15
   - 结算时间：2025-04-20

4. 点击"创建市场"

5. 查看成功提示

---

## 🛡️ 安全建议

### 开发环境 ✅
```env
ADMIN_PASSWORD=admin123
```
- 简单易记
- 方便开发测试

### 生产环境 ⚠️
```env
ADMIN_PASSWORD=Xk9$mP2#qL7&nW5@vB8!
```
- 使用强密码
- 至少 16 位
- 包含大小写字母、数字、特殊符号
- 定期更换

### 推荐密码生成器
```bash
# 使用 OpenSSL 生成随机密码
openssl rand -base64 24
```

---

## 🔧 环境变量配置

### 创建 `.env.local` 文件

```env
# 管理员密码（必填）
ADMIN_PASSWORD=your_secure_password

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他配置...
```

---

## 📝 常见问题

### Q1: 为什么访问 `/admin/create-market` 显示 404？

**A**: 确保：
1. 文件在 `app/admin/create-market/page.tsx`（不是 `_dev_only_admin`）
2. 已启动开发服务器 `npm run dev`
3. 清除浏览器缓存并刷新

### Q2: 登录后立即被踢出？

**A**: 检查：
1. Cookie 是否正常设置（F12 → Application → Cookies）
2. 中间件配置是否正确
3. 重启开发服务器

### Q3: 忘记密码怎么办？

**A**: 
- 开发环境：默认密码 `admin123`
- 生产环境：检查 `.env` 文件中的 `ADMIN_PASSWORD`
- 或临时修改 `app/api/admin/auth/login/route.ts` 中的密码

### Q4: 想要修改默认密码？

**A**: 在项目根目录创建 `.env.local`：
```env
ADMIN_PASSWORD=your_new_password
```

---

## 🎨 页面功能

### 登录页面 (`/admin/login`)

**功能**：
- ✅ 密码输入
- ✅ 错误提示
- ✅ 自动重定向
- ✅ 记住登录状态（7天）

**特点**：
- 美观的渐变背景
- 响应式设计
- 友好的错误提示

### 创建市场页面 (`/admin/create-market`)

**功能**：
- ✅ 完整的表单验证
- ✅ 三种市场类型
  - 二元选项（YES/NO）
  - 多选项（自定义）
  - 数值范围（预测数值）
- ✅ 分类和子分类选择
- ✅ 时间设置
- ✅ 优先级配置
- ✅ 实时表单反馈

**特点**：
- 免费创建（仅保存到数据库）
- 活跃后自动上链
- 支持批量操作
- 美观的UI设计

---

## 🚨 注意事项

1. **不要提交密码到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 不要将密码写在代码里

2. **生产环境必须使用强密码**
   - 默认密码 `admin123` 仅用于开发
   - 生产环境必须修改

3. **定期检查安全**
   - Cookie 配置
   - 中间件保护
   - API 权限

---

## 📞 支持

如有问题：
1. 检查控制台错误
2. 查看网络请求（F12 → Network）
3. 检查 Cookie 设置
4. 重启开发服务器

---

## ✨ 更新日志

### 2025-01-09
- ✅ 创建 `app/admin/login/page.tsx`
- ✅ 创建 `app/admin/create-market/page.tsx`
- ✅ 修复路由问题（从 `_dev_only_admin` 迁移）
- ✅ 添加默认密码提示
- ✅ 改进登录UI

---

**现在可以正常访问管理后台了！** 🎉

默认密码：`admin123`

