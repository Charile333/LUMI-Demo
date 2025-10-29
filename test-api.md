# 🧪 API测试指南

## 快速测试

### 1. 检查环境变量
```
浏览器访问: http://localhost:3000/api/test-env
```

**期望结果：**
```json
{
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "已配置 ✅",
  "supabaseServiceKey": "已配置 ✅",
  "cronSecret": "已配置 ✅"
}
```

---

### 2. 测试崩盘事件API
```
浏览器访问: http://localhost:3000/api/crash-events
```

**期望结果：**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "date": "2025-10-10",
      "asset": "BTC/USDT",
      "crashPercentage": "-16.77",
      ...
    },
    ... (共6个事件)
  ],
  "count": 6
}
```

---

### 3. 测试Cron Job（可选）
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/detect-crash" `
  -Headers @{Authorization="Bearer d296d8eafc92f249cf2533dad0d04897756db5f237c25956cda5b9e1793e6837"}
```

**期望结果：**
```json
{
  "success": true,
  "timestamp": "2025-10-29T...",
  "results": [...]
}
```

---

## 页面测试

### 免费版页面
```
http://localhost:3000/black-swan-v2-polling
```

**检查清单：**
- [ ] 页面正常加载
- [ ] 看到 "Auto-Refresh Active" 绿色指示器
- [ ] 显示 "Total Events: 6"
- [ ] 左侧列表显示6个崩盘事件
- [ ] 点击事件可以看到图表
- [ ] 没有控制台错误

---

## 常见问题

### 环境变量显示"未配置"
**解决：**
1. 检查 `.env.local` 文件是否存在
2. 确认变量名拼写正确
3. 重启开发服务器

### API返回500错误
**解决：**
1. 检查Supabase密钥是否正确
2. 确认数据库已创建表
3. 查看终端错误日志

### 页面空白或加载失败
**解决：**
1. 打开浏览器控制台（F12）
2. 查看错误信息
3. 确认API端点正常

---

## 调试技巧

### 查看服务器日志
开发服务器的终端会显示所有请求和错误。

### 查看浏览器控制台
按F12查看JavaScript错误和网络请求。

### 使用Supabase Dashboard
访问 Supabase > Table Editor 查看数据是否正确插入。





