# DuoLume + Market 整合项目

本项目已成功将 **duolume** 和 **market** 两个项目整合为一个统一的 Next.js 应用。

## 📁 项目结构

```
market/
├── app/
│   ├── page.tsx                 # DuoLume Landing 主页
│   ├── market/
│   │   ├── page.tsx            # 预测市场首页（原 market 项目）
│   │   ├── automotive/
│   │   ├── tech-ai/
│   │   ├── crypto/
│   │   └── ... 其他分类
│   ├── api/
│   │   ├── alerts/route.ts     # 警报 API 代理
│   │   └── prices/route.ts     # 价格 API 代理
│   ├── layout.tsx
│   └── globals.css             # 合并后的样式文件
├── components/
│   ├── DynamicBackground.tsx   # 动态背景组件
│   ├── Navbar.tsx              # 导航栏
│   └── wallet/
├── public/
│   ├── dynamic-bg.css          # 动态背景样式
│   └── images/
│       ├── Dute2.png           # DuoLume Logo
│       └── LUMI1.png           # Market Logo
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd market
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，配置后端 API 地址：

```env
FLASK_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. 启动后端服务（可选）

如果需要实时警报功能，需要启动 Flask 后端和 WebSocket 服务器：

#### 启动 Flask API：

```bash
cd ../duolume-master/crypto_alert_api
python src/main.py
```

#### 启动 WebSocket 警报服务器：

```bash
cd ../duolume-master
node alert_server.js
```

### 4. 启动 Next.js 开发服务器

```bash
cd market
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔗 路由说明

- **`/`** - DuoLume Landing 主页（加密货币警报系统）
- **`/market`** - 预测市场平台首页
- **`/market/automotive`** - 汽车行业预测市场
- **`/market/tech-ai`** - 科技与AI预测市场
- **`/market/crypto`** - 加密货币预测市场
- **`/event/[eventId]`** - 单个事件详情页

## 🎨 功能特性

### DuoLume Landing 页面
- ✅ 动态黑白三角形背景动画
- ✅ 实时加密货币警报展示（终端风格）
- ✅ WebSocket 实时推送
- ✅ 时间线路线图
- ✅ 预测市场快速入口

### Market 预测市场
- ✅ 多分类预测市场浏览
- ✅ 事件详情和交易
- ✅ 响应式设计
- ✅ 搜索和筛选功能

## 🔧 技术栈

- **前端框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **后端**: Python Flask (独立服务)
- **实时通信**: WebSocket
- **状态管理**: React Hooks

## 📦 API 路由

Next.js API Routes 作为代理层，连接 Flask 后端：

- `GET /api/alerts` - 获取加密货币警报列表
- `POST /api/alerts` - 创建新警报
- `GET /api/prices?symbol=BTCUSDT` - 获取价格数据

## 🎯 后续改进建议

1. **环境变量管理**: 使用 `.env.local` 进行本地开发配置
2. **错误处理**: 增强 API 错误处理和用户提示
3. **缓存策略**: 实现 SWR 或 React Query 进行数据缓存
4. **SEO 优化**: 为各个页面添加 metadata
5. **性能优化**: 
   - 图片懒加载
   - 代码分割
   - 动态导入组件
6. **测试**: 添加单元测试和集成测试
7. **部署**: 配置 Vercel 或其他平台部署

## 🐛 常见问题

### WebSocket 连接失败
- 确保 `alert_server.js` 已启动
- 检查端口 3001 是否被占用
- 验证防火墙设置

### API 请求失败
- 确认 Flask 后端正在运行（端口 5000）
- 检查 `.env.local` 中的 `FLASK_API_URL` 配置
- 查看浏览器控制台和终端日志

### 样式不显示
- 确认 `dynamic-bg.css` 文件存在于 `public/` 目录
- 清除浏览器缓存并重新加载
- 检查 `globals.css` 中的 `@import` 语句

## 📝 开发笔记

### 已完成的迁移工作

1. ✅ 将 DuoLume Landing 页面从 React (Vite) 迁移到 Next.js (TSX)
2. ✅ 迁移 DynamicBackground 组件到 Next.js
3. ✅ 调整 market 路由结构（移到 `/market` 路径下）
4. ✅ 合并和迁移静态资源（图片、CSS）
5. ✅ 合并样式文件（Tailwind 配置、全局样式）
6. ✅ 创建 Next.js API Routes 代理 Flask 后端
7. ✅ 更新 WebSocket 连接逻辑
8. ✅ 更新 package.json 和项目配置

### 文件变更说明

- **新增**: `app/page.tsx` - DuoLume Landing 主页
- **移动**: `app/page.tsx` → `app/market/page.tsx` - Market 首页
- **新增**: `components/DynamicBackground.tsx` - 动态背景组件
- **新增**: `app/api/alerts/route.ts` - 警报 API
- **新增**: `app/api/prices/route.ts` - 价格 API
- **更新**: `app/globals.css` - 合并 duolume 样式
- **新增**: `public/dynamic-bg.css` - 三角形动画样式
- **新增**: `public/images/Dute2.png` - DuoLume Logo

## 📞 支持

如有问题，请查看：
- Next.js 文档: https://nextjs.org/docs
- React 文档: https://react.dev
- Tailwind CSS 文档: https://tailwindcss.com/docs

---

**版本**: 1.0.0  
**最后更新**: 2025-10-19

