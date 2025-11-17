# 🔑 如何获取 GitLab 配置变量

## 📋 需要配置的 2 个变量

1. **CRON_SECRET** - Cron 安全密钥
2. **VERCEL_APP_URL** - Vercel 应用 URL

---

## 🔐 变量 1：CRON_SECRET

### 方法 1：从 Vercel 环境变量中获取（推荐）

#### 步骤 1：打开 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 登录你的 Vercel 账户
3. 选择你的项目（LUMI-Demo 或类似名称）

#### 步骤 2：查看环境变量

1. 在项目页面，点击顶部菜单 `Settings`（设置）
2. 点击左侧菜单 `Environment Variables`（环境变量）
3. 在变量列表中查找 `CRON_SECRET`

#### 步骤 3：复制值

1. 找到 `CRON_SECRET` 变量
2. 点击变量右侧的 `...`（三个点）或眼睛图标
3. 点击 `Reveal Value`（显示值）
4. 复制完整的值（例如：`PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=`）
5. ⚠️ **重要**：确保复制完整，不要有空格或换行

#### 如果 Vercel 中没有 CRON_SECRET

**创建新的 CRON_SECRET：**

1. 在 Vercel Dashboard > Settings > Environment Variables
2. 点击 `Add New`（添加新变量）
3. 配置：
   - **Key**: `CRON_SECRET`
   - **Value**: 生成新的密钥（见方法 2）
   - **Environment**: `Production`（或 `All Environments`）
4. 点击 `Save`
5. 复制这个值到 GitLab

---

### 方法 2：生成新的 CRON_SECRET

如果 Vercel 中没有 `CRON_SECRET`，可以生成一个新的：

#### 方法 2.1：使用 OpenSSL（推荐）

在终端运行：

```bash
openssl rand -base64 32
```

**输出示例：**
```
PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=
```

复制这个值，然后：
1. 添加到 Vercel 环境变量（`CRON_SECRET`）
2. 添加到 GitLab CI/CD 变量（`CRON_SECRET`）

**注意**：两处的值必须完全一致！

---

#### 方法 2.2：使用 Node.js

在项目目录运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**输出示例：**
```
PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=
```

---

#### 方法 2.3：使用在线工具

访问：https://www.random.org/strings/

配置：
- **Length**: 32
- **Characters**: `A-Za-z0-9+/=`
- 点击 `Generate`
- 复制生成的值

---

### 方法 3：从 .env.local 文件中获取

如果本地开发环境中有 `.env.local` 文件：

#### 步骤 1：打开 .env.local 文件

在项目根目录找到 `.env.local` 文件

#### 步骤 2：查找 CRON_SECRET

查找类似这样的行：
```env
CRON_SECRET=PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=
```

#### 步骤 3：复制值

复制 `=` 后面的值（不包括等号和空格）

---

## 🌐 变量 2：VERCEL_APP_URL

### 方法 1：从 Vercel Dashboard 获取（推荐）

#### 步骤 1：打开 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 登录你的 Vercel 账户
3. 选择你的项目

#### 步骤 2：查看项目 URL

**方式 A：从项目概览页面**
1. 在项目页面，顶部会显示项目的 URL
2. 格式：`https://your-project-name.vercel.app`
3. 复制这个 URL

**方式 B：从 Deployments（部署）页面**
1. 点击顶部菜单 `Deployments`（部署）
2. 点击最新的部署
3. 在部署详情页面，可以看到 `Visit` 按钮旁边的 URL
4. 复制这个 URL

**方式 C：从 Settings（设置）页面**
1. 点击顶部菜单 `Settings`（设置）
2. 在 `General`（常规）部分
3. 可以看到 `Domains`（域名）部分
4. 会显示项目的 URL（例如：`your-project.vercel.app`）
5. 前面加上 `https://`，格式：`https://your-project.vercel.app`

---

### 方法 2：从浏览器地址栏获取

1. 访问你的 Vercel 应用（在浏览器中打开）
2. 查看浏览器地址栏的 URL
3. 复制完整的 URL（例如：`https://your-project.vercel.app`）

**示例：**
- ✅ 正确：`https://lumi-demo.vercel.app`
- ✅ 正确：`https://your-app-name.vercel.app`
- ❌ 错误：`https://lumi-demo.vercel.app/`（不要尾部斜杠）
- ❌ 错误：`https://www.lumi-demo.vercel.app`（不要 www）

---

### 方法 3：从 Vercel CLI 获取

如果你安装了 Vercel CLI：

```bash
vercel ls
```

会列出你的所有项目及其 URL。

---

## 📝 配置示例

### CRON_SECRET 示例

```
值示例：PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=

特点：
- 通常是 32-44 个字符
- 包含字母、数字、+、/、= 字符
- Base64 编码格式
```

---

### VERCEL_APP_URL 示例

```
格式：https://your-project-name.vercel.app

示例：
- https://lumi-demo.vercel.app
- https://lumi-demo-git-master.vercel.app（预览部署）
- https://your-custom-domain.com（如果有自定义域名）

注意：
- 必须包含 https://
- 不要包含尾部斜杠 /
- 不要包含路径（如 /api）
```

---

## ⚠️ 重要注意事项

### CRON_SECRET 注意事项

1. **两处必须一致**
   - Vercel 环境变量中的 `CRON_SECRET`
   - GitLab CI/CD 变量中的 `CRON_SECRET`
   - 必须完全一致（包括大小写、特殊字符）

2. **不要有空格**
   - 复制时确保前后没有空格
   - 不要有换行符

3. **安全保护**
   - 在 GitLab 中勾选 `Masked`（隐藏变量）
   - 这样在日志中不会显示实际值

---

### VERCEL_APP_URL 注意事项

1. **不要包含尾部斜杠**
   - ✅ 正确：`https://your-app.vercel.app`
   - ❌ 错误：`https://your-app.vercel.app/`

2. **不要包含路径**
   - ✅ 正确：`https://your-app.vercel.app`
   - ❌ 错误：`https://your-app.vercel.app/api/cron/settle-trades`

3. **使用生产环境 URL**
   - 使用主域名（例如：`your-app.vercel.app`）
   - 不要使用预览部署 URL（例如：`your-app-git-branch.vercel.app`）

4. **自定义域名**
   - 如果有自定义域名，也可以使用自定义域名
   - 例如：`https://your-custom-domain.com`

---

## 🔍 验证配置

### 验证 CRON_SECRET

1. **检查 Vercel**
   - Vercel Dashboard > Settings > Environment Variables
   - 确认 `CRON_SECRET` 存在且有值

2. **检查 GitLab**
   - GitLab Settings > CI/CD > Variables
   - 确认 `CRON_SECRET` 存在且标记为 Masked

3. **对比一致性**
   - 确保两处的值完全一致
   - 可以在 Vercel 中点击 "Reveal Value" 查看
   - 在 GitLab 中，如果已 Masked，无法查看（但可以重新添加）

---

### 验证 VERCEL_APP_URL

1. **测试 URL 是否可访问**
   ```bash
   curl https://your-app.vercel.app
   ```
   应该返回 HTML 页面

2. **测试 API 端点**
   ```bash
   curl https://your-app.vercel.app/api/cron/settle-trades
   ```
   应该返回 JSON 响应（可能需要 Authorization header）

3. **在浏览器中打开**
   - 直接在浏览器中访问 URL
   - 应该能看到你的应用页面

---

## 🚀 快速获取步骤总结

### CRON_SECRET

**选项 A：从 Vercel 获取（如果已有）**
1. Vercel Dashboard > Settings > Environment Variables
2. 找到 `CRON_SECRET`
3. 点击显示值
4. 复制

**选项 B：生成新的**
1. 运行：`openssl rand -base64 32`
2. 复制输出
3. 添加到 Vercel 环境变量
4. 添加到 GitLab CI/CD 变量

---

### VERCEL_APP_URL

**最简单的方法：**
1. 在浏览器中打开你的 Vercel 应用
2. 查看地址栏的 URL
3. 复制 URL（不包括尾部斜杠）
4. 确保格式：`https://your-app.vercel.app`

---

## ✅ 配置检查清单

配置完成后，检查：

- [ ] `CRON_SECRET` 已添加到 Vercel 环境变量
- [ ] `CRON_SECRET` 已添加到 GitLab CI/CD 变量
- [ ] 两处的 `CRON_SECRET` 值完全一致
- [ ] GitLab 中的 `CRON_SECRET` 已勾选 `Masked`
- [ ] `VERCEL_APP_URL` 已添加到 GitLab CI/CD 变量
- [ ] `VERCEL_APP_URL` 格式正确（无尾部斜杠）
- [ ] `VERCEL_APP_URL` 可以在浏览器中正常访问

---

## 🎯 下一步

获取这两个变量后：

1. ✅ 添加到 GitLab CI/CD Variables
2. ✅ 创建 Pipeline Schedule
3. ✅ 测试执行

详细步骤请查看：`docs/GitLab批量结算配置步骤.md`


