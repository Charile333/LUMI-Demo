# 修复模块找不到错误

## 错误原因
`Error: Cannot find module './276.js'` 是 Next.js 的缓存问题，通常在代码更改后热重载失败时出现。

## 已执行的修复
✅ 清理了 `.next` 缓存目录

## 下一步操作

### 1. 停止当前的开发服务器
在运行 `npm run dev` 的终端窗口中按 `Ctrl + C`

### 2. 重新启动开发服务器
```bash
cd market
npm run dev
```

### 3. 等待编译完成
你应该会看到类似以下的输出：
```
> duolume-market@1.0.0 dev
> next dev

  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.5s
```

### 4. 刷新浏览器
访问 `http://localhost:3000/` 查看主页

## 如果问题仍然存在

尝试以下操作：

1. **完全清理并重新安装依赖**
```bash
cd market
Remove-Item node_modules -Recurse -Force
Remove-Item .next -Recurse -Force
npm install
npm run dev
```

2. **检查端口占用**
如果 3000 端口被占用，可以使用其他端口：
```bash
$env:PORT=3001
npm run dev
```

## 预防措施
- 每次大量修改代码后，建议重启开发服务器
- 遇到奇怪的错误时，先尝试清理 `.next` 目录
- 定期更新依赖包保持最新状态

