# 🚀 Vercel 部署指南

## ✅ 已修复的问题

### 依赖冲突问题
**错误信息：**
```
npm error Could not resolve dependency:
npm error peer chai@"^4.2.0" from @nomicfoundation/hardhat-chai-matchers@2.1.0
npm error Conflicting peer dependency: chai@6.2.0
```

**修复方案：**
1. ✅ 降级 `chai` 从 `^6.2.0` 到 `^4.5.0`
2. ✅ 添加 `.npmrc` 配置文件
3. ✅ 创建 `vercel.json` 配置

---

## 📝 修改的文件

### 1. package.json
```json
"devDependencies": {
  "chai": "^4.5.0"  // 从 ^6.2.0 降级
}
```

### 2. .npmrc（新建）
```
legacy-peer-deps=true
registry=https://registry.npmjs.org/
```

### 3. vercel.json（新建）
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

---

## 🔧 部署步骤

### 方法1：通过Vercel Dashboard

1. **删除现有部署（如果有）**
   - 进入 Vercel Dashboard
   - Settings → Delete Project（如果之前部署失败）

2. **重新导入项目**
   - New Project → Import Git Repository
   - 选择你的仓库

3. **环境变量配置**
   在 Vercel Dashboard → Settings → Environment Variables 添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   DATABASE_URL=your_database_url
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

---

### 方法2：通过Vercel CLI

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   cd e:\project\demo\LUMI
   vercel
   ```

4. **添加环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add DATABASE_URL
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

---

## 🌍 环境变量清单

部署前确保在Vercel中设置以下环境变量：

### 必需的环境变量
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# 可选：WebSocket（如果使用）
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

---

## 🐛 常见问题排查

### 问题1: 依然报错 "Could not resolve dependency"

**解决方法：**
```bash
# 本地测试
cd e:\project\demo\LUMI
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

如果本地构建成功，推送到Git，Vercel会自动重新部署。

---

### 问题2: Build 超时

**原因：** 安装依赖太慢

**解决方法：**
1. 在 `vercel.json` 中增加超时时间：
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next",
         "config": {
           "maxDuration": 60
         }
       }
     ]
   }
   ```

2. 或者移除不必要的依赖

---

### 问题3: 环境变量未生效

**检查清单：**
- [ ] 环境变量名称正确（大小写敏感）
- [ ] 选择了正确的环境（Production/Preview/Development）
- [ ] 重新部署（环境变量修改后需要重新部署）

**重新部署：**
```bash
# 通过CLI
vercel --prod

# 或在Dashboard中
Deployments → 最新部署 → Redeploy
```

---

## 📦 构建优化建议

### 1. 减少依赖大小

检查是否有不必要的依赖：
```bash
npm ls --depth=0
```

考虑移除：
- Hardhat相关包（如果不在生产环境使用）
- 开发工具包

### 2. 启用缓存

Vercel自动缓存`node_modules`，但确保：
```json
// package.json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 3. 优化构建命令

在 `vercel.json` 中：
```json
{
  "buildCommand": "npm ci --legacy-peer-deps && npm run build",
  "installCommand": "npm ci --legacy-peer-deps"
}
```

`npm ci` 比 `npm install` 更快，适合CI/CD环境。

---

## 🔒 安全检查

### 环境变量安全
- ✅ 不要在代码中硬编码密钥
- ✅ 使用 `NEXT_PUBLIC_` 前缀暴露给前端的变量
- ✅ 敏感信息只在服务器端使用

### .gitignore 检查
确保以下文件已忽略：
```
node_modules/
.env
.env.local
.vercel
.next/
```

---

## 📊 部署后验证

### 1. 检查应用运行
访问部署的URL，检查：
- [ ] 首页加载正常
- [ ] 市场数据显示
- [ ] 钱包连接功能
- [ ] API路由工作

### 2. 检查日志
在 Vercel Dashboard → Deployments → 点击部署 → Logs

查看：
- Build logs
- Function logs（API路由）
- Error logs

### 3. 性能测试
使用 Lighthouse 或 Vercel Analytics 检查：
- 页面加载速度
- SEO分数
- 最佳实践

---

## 🎯 快速修复脚本

如果遇到问题，运行此脚本重置：

```bash
# Windows PowerShell
cd e:\project\demo\LUMI
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
npm run build
git add .
git commit -m "fix: resolve dependency conflicts for Vercel deployment"
git push
```

---

## 📞 需要帮助？

### Vercel支持资源
- [Vercel文档](https://vercel.com/docs)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [Vercel支持](https://vercel.com/support)

### 项目相关
- 查看 `README.md` 了解项目设置
- 查看 `TROUBLESHOOTING.md` 了解常见问题
- 查看 `FIXES_APPLIED.md` 了解最近的修复

---

## ✅ 部署检查清单

部署前确保：

- [ ] `package.json` 中 chai 版本为 `^4.5.0`
- [ ] `.npmrc` 文件已创建
- [ ] `vercel.json` 文件已创建
- [ ] 所有环境变量已在Vercel中配置
- [ ] 代码已推送到Git仓库
- [ ] 本地 `npm run build` 成功
- [ ] `.gitignore` 包含敏感文件
- [ ] 删除了旧的失败部署（如果有）

完成以上检查后，可以安全部署到Vercel！

---

## 🎉 部署成功后

1. **测试核心功能**
   - 浏览市场
   - 连接钱包
   - 创建订单
   - 查看订单簿

2. **设置自定义域名**（可选）
   - Vercel Dashboard → Settings → Domains
   - 添加你的域名
   - 配置DNS记录

3. **启用Analytics**（可选）
   - Vercel Dashboard → Analytics
   - 查看实时访问数据

4. **配置CI/CD**
   - Git推送自动部署
   - Preview部署（Pull Request）
   - Production部署（main分支）

祝部署成功！🚀

