# 🍪 浏览器 Cookie 问题解决方案

## 🚨 问题：登录后无法进入页面

### 问题原因

浏览器的**跟踪保护（Tracking Prevention）**或隐私设置阻止了 Cookie 的设置。

从控制台看到：
```
⚠️ Tracking Prevention blocked access to storage
```

这意味着浏览器认为我们的 Cookie 是跟踪 Cookie，并阻止了它。

## 🔧 解决方案

### 方案 1: 允许本地 Cookie（推荐）

#### Microsoft Edge / Chrome

1. **点击地址栏左侧的图标**（锁或盾牌图标）
2. **点击"Cookie"**
3. **选择"允许本站点 Cookie"**
4. **刷新页面**

或者：

1. 打开浏览器设置
2. 进入 **隐私、搜索和服务**
3. 找到 **跟踪防护** 或 **Cookie 和网站权限**
4. 添加 `localhost` 到允许列表

#### Firefox

1. 点击地址栏左侧的盾牌图标
2. 关闭 **增强型跟踪保护**
3. 刷新页面

#### Safari

1. 打开 Safari 设置
2. 进入 **隐私** 标签
3. 取消勾选 **阻止所有 Cookie**

### 方案 2: 使用隐身/无痕模式（临时）

1. 打开隐身/无痕窗口（Ctrl+Shift+N）
2. 访问 `http://localhost:3000/admin/login`
3. 登录

### 方案 3: 修改 Cookie 设置（开发环境）

在浏览器中手动允许第三方 Cookie：

#### Edge/Chrome
1. 设置 → 隐私、搜索和服务
2. Cookie 和网站权限 → Cookie 和网站数据
3. 选择 **允许所有 Cookie**（仅开发环境）

#### Firefox
1. 设置 → 隐私与安全
2. Cookie 和网站数据
3. 选择 **接受 Cookie 和网站数据**

### 方案 4: 使用不同的浏览器

如果当前浏览器问题持续，尝试：
- Chrome
- Firefox
- Edge
- Safari

## 🔍 验证 Cookie 是否设置

### 1. 检查开发者工具

1. 打开开发者工具（F12）
2. 进入 **Application** 或 **应用程序** 标签
3. 展开 **Cookies**
4. 选择 `http://localhost:3000`
5. 查找 `admin_authenticated` Cookie

**应该看到**：
- Name: `admin_authenticated`
- Value: 一长串 Base64 字符串
- Path: `/`
- HttpOnly: ✓

### 2. 使用 JavaScript 检查

在控制台运行：
```javascript
document.cookie
```

**应该看到**：
```
admin_authenticated=...
```

### 3. 访问认证检查 API

```
http://localhost:3000/api/admin/check-auth
```

**正常响应**：
```json
{
  "success": true,
  "authenticated": true,
  "message": "认证有效"
}
```

## 📝 详细步骤

### Edge 浏览器（推荐）

1. **允许本地 Cookie**：
   - 点击地址栏左侧的 🔒 图标
   - 点击 **Cookie**
   - 选择 **允许**
   - 刷新页面

2. **重新登录**：
   - 访问 `http://localhost:3000/admin/login`
   - 输入密码
   - 点击登录

3. **验证**：
   - 应该能成功跳转到管理页面
   - 控制台应该显示 `✅ 登录成功`

### Chrome 浏览器

1. **允许本地 Cookie**：
   - 点击地址栏右侧的 👁 图标
   - 点击 **网站未正常运行？**
   - 点击 **允许 Cookie**
   - 刷新页面

2. **重新登录**：
   - 访问 `http://localhost:3000/admin/login`
   - 输入密码
   - 点击登录

### Firefox 浏览器

1. **允许本地 Cookie**：
   - 点击地址栏左侧的 🛡 图标
   - 关闭 **增强型跟踪保护**
   - 刷新页面

2. **重新登录**：
   - 访问 `http://localhost:3000/admin/login`
   - 输入密码
   - 点击登录

## 🔧 开发环境推荐配置

### Edge/Chrome

1. 进入 `edge://settings/content/cookies` 或 `chrome://settings/content/cookies`
2. 添加到 **允许使用 Cookie 的网站** 列表：
   ```
   http://localhost:3000
   [*.]localhost
   ```

### Firefox

1. 进入 `about:preferences#privacy`
2. Cookie 和网站数据
3. **管理例外** → 添加：
   ```
   http://localhost:3000
   ```
   选择 **允许**

## 🎯 快速测试

运行以下命令测试 Cookie：

```bash
# 测试登录 API
curl -v -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}' \
  -c cookies.txt

# 查看 Cookie
cat cookies.txt

# 使用 Cookie 访问受保护页面
curl -v -b cookies.txt http://localhost:3000/api/admin/check-auth
```

**应该看到**：
```json
{
  "success": true,
  "authenticated": true,
  "message": "认证有效"
}
```

## ⚠️ 常见错误

### 错误 1: "Tracking Prevention blocked access to storage"

**原因**：浏览器的跟踪保护阻止了 Cookie

**解决**：按照上述方案 1 允许本地 Cookie

### 错误 2: Cookie 未设置

**原因**：浏览器阻止了第三方 Cookie

**解决**：检查浏览器设置，允许 localhost 的 Cookie

### 错误 3: 登录成功但立即退出

**原因**：Cookie 设置后立即被清除

**解决**：
1. 关闭隐私模式
2. 允许本地 Cookie
3. 重启浏览器

## 📞 仍然无法解决？

如果按照以上步骤仍然无法登录，请尝试：

1. **完全关闭浏览器并重新打开**
2. **清除所有浏览器数据**（缓存、Cookie、网站数据）
3. **使用不同的浏览器**
4. **检查是否安装了阻止 Cookie 的浏览器扩展**
5. **尝试隐身/无痕模式**

## 🔗 相关文档

- [登录问题排查指南](./登录问题排查指南.md)
- [本地访问限制说明](./本地访问限制说明.md)

