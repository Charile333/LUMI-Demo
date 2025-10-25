# 📝 创建话题功能说明

## 功能概述

在页面右下角添加了一个悬浮按钮，用户可以：
1. 提交自己的话题想法
2. 查看所有用户提交的话题
3. 对感兴趣的话题进行投票

## 使用方法

### 1. 创建话题
1. 点击右下角的悬浮按钮（create.png图标）
2. 在弹窗中输入话题标题（必填，最多100字符）
3. 输入话题描述（可选，最多500字符）
4. 点击"🚀 提交话题"按钮

### 2. 查看话题列表
1. 在创建话题弹窗中，点击"查看所有话题"按钮
2. 或在提交话题后自动跳转到话题列表
3. 话题按投票数排序，投票最多的在最前面

### 3. 投票
1. 在话题列表中，点击任意话题的"👍 投票"按钮
2. 每个用户对每个话题只能投一次票
3. 投票后按钮会显示为"已投票 ✓"

## 数据库设置

运行以下命令创建所需的数据库表：

```bash
psql $DATABASE_URL -f scripts/create-topics-tables.sql
```

或在 `package.json` 中添加命令：

```json
{
  "scripts": {
    "db:setup-topics": "psql $DATABASE_URL -f scripts/create-topics-tables.sql"
  }
}
```

然后运行：

```bash
npm run db:setup-topics
```

## API 端点

### GET /api/topics
获取所有话题列表（按投票数和创建时间排序）

**响应示例：**
```json
{
  "success": true,
  "topics": [
    {
      "id": 1,
      "title": "特斯拉2025年能否突破1000美元？",
      "description": "详细描述...",
      "votes": 42,
      "createdBy": "0x1234...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/topics
创建新话题

**请求体：**
```json
{
  "title": "话题标题",
  "description": "话题描述（可选）"
}
```

**响应示例：**
```json
{
  "success": true,
  "topic": {
    "id": 1,
    "title": "特斯拉2025年能否突破1000美元？",
    "description": "...",
    "votes": 0,
    "createdBy": "anonymous",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/topics/[topicId]/vote
对话题投票

**响应示例：**
```json
{
  "success": true,
  "votes": 43
}
```

## 技术栈

- **前端组件**: React + TypeScript + Tailwind CSS
- **悬浮按钮**: 使用 Next.js Image 组件优化
- **弹窗**: 原生 Modal 实现，带背景模糊效果
- **API**: Next.js 14 App Router API Routes
- **数据库**: PostgreSQL

## 特性

### UI/UX
- ✨ 悬浮按钮带hover动画效果
- 🎨 深色主题弹窗设计
- 📱 响应式布局，移动端友好
- 🔄 实时投票数更新
- ✅ 表单验证和错误提示

### 功能
- 🔒 防止重复投票
- 📊 投票数实时统计
- 🔍 话题列表按人气排序
- 💬 支持详细描述
- 👤 记录创建者信息

### 安全
- 字符长度限制
- SQL注入防护
- XSS防护
- 唯一性约束

## 未来优化建议

1. **用户认证集成**
   - 与钱包地址绑定
   - 显示用户昵称/头像
   
2. **话题管理**
   - 管理员审核功能
   - 话题编辑和删除
   - 话题分类标签

3. **高级投票**
   - 投票权重（根据持有代币数量）
   - 投票排行榜
   - 投票趋势图表

4. **话题转化**
   - 高票话题自动转为预测市场
   - 话题讨论区

5. **通知系统**
   - 话题更新通知
   - 投票达标提醒

## 相关文件

```
LUMI/
├── components/
│   └── CreateTopicButton.tsx         # 悬浮按钮和弹窗组件
├── app/
│   ├── client-layout.tsx             # 添加了悬浮按钮
│   └── api/
│       └── topics/
│           ├── route.ts              # 话题CRUD API
│           └── [topicId]/
│               └── vote/
│                   └── route.ts      # 投票API
├── scripts/
│   └── create-topics-tables.sql      # 数据库表创建脚本
└── public/
    └── image/
        └── create.png                # 悬浮按钮图标
```

## 故障排除

### 悬浮按钮不显示
- 检查 `create.png` 文件是否存在于 `/public/image/` 目录
- 确认 `client-layout.tsx` 中已导入 `CreateTopicButton`

### 数据库错误
- 确保已运行数据库迁移脚本
- 检查数据库连接配置
- 查看表是否成功创建

### 投票失败
- 检查是否已对该话题投过票
- 确认话题ID是否有效
- 查看浏览器控制台错误信息

## 关于"感兴趣"按钮

感兴趣按钮只在**未激活的市场**上显示（`blockchain_status === 'not_created'`），位于市场卡片的操作按钮区域。

- 未激活市场：显示"感兴趣"按钮
- 已激活市场：只显示"交易"按钮

