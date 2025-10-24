# 动态背景更新 - Cascading Waves

## 更新日期
2025-10-20

## 概述
成功将主页面的动态背景从 Spipa Circle（圆形粒子）替换为 Cascading Waves（层叠波浪）。

## 更改内容

### 1. 移除旧的 Spipa Circle 背景
- ✅ 删除了 spipa-circle.js 和 spipa-circle.css 的引用
- ✅ 更新了清理函数以移除旧的 canvas 元素

### 2. 添加新的 Cascading Waves 背景
- ✅ 创建了 `market/public/cascading-waves.js` - 包含完整的独立动画脚本
  - 内嵌了 SimplexNoise 库实现（移除外部依赖）
  - 实现了完整的 canvas 绘制功能
  - 添加了窗口调整处理
- ✅ 创建了 `market/public/cascading-waves.css` - 简洁的背景样式

### 3. 更新主页面代码
- ✅ 修改了 `market/app/page.tsx`
  - 更新了 useEffect 来加载新的 CSS 和 JS
  - 设置背景色为 #141414（深灰色）
  - 更新了清理函数

## 新背景特性

### 视觉效果
- 🌊 流动的波浪线条动画
- 🎨 粉色/紫色到蓝色的渐变色彩循环
- ✨ 模糊发光效果（blur: 10px）
- 🌈 动态色调变化（在色相 340° 和 210° 之间切换）

### 技术特点
- **SimplexNoise 噪声算法**：创建平滑的波浪运动
- **40x60 网格系统**：40 条横线，60 个波浪段
- **渐变动画**：
  - 全局透明度在 0.15-0.3 之间波动
  - 色彩渐变每秒循环变化
- **Canvas 效果**：
  - 使用 'lighter' 混合模式
  - 双层描边（模糊层 + 清晰层）
  - 响应式画布大小

### 性能优化
- Canvas 设置为 `pointer-events: none`，不干扰交互
- 固定定位，z-index: 1，位于内容下方
- 使用 requestAnimationFrame 优化动画性能
- 深灰色背景（#141414）减少视觉疲劳

### 数学原理
- 使用 3D Simplex Noise 生成波浪
- 噪声参数：`noise3D(x, time, cosine_offset)`
- 时间步进：0.01 每帧
- 波浪幅度：`noise_value * height_half`

## 文件结构

### 新增文件
- `market/public/cascading-waves.js` (约 8KB) - 完整的独立动画脚本
- `market/public/cascading-waves.css` - 背景样式

### 修改文件
- `market/app/page.tsx` - 主页面组件

### 可删除的旧文件（如不再需要）
- `market/public/spipa-circle.js`
- `market/public/spipa-circle.css`

## 构建状态
✅ **构建成功** - 退出代码 0

## 与之前背景的对比

| 特性 | Spipa Circle | Cascading Waves |
|------|--------------|-----------------|
| 视觉风格 | 圆形粒子轨迹 | 流动波浪线条 |
| 颜色方案 | 蓝色单色调 | 粉紫 ↔ 蓝色循环 |
| 运动方式 | 粒子物理运动 | 噪声波浪流动 |
| 视觉效果 | 清晰线条 | 模糊发光 |
| 背景色 | 纯黑色 | 深灰色 (#141414) |
| 复杂度 | 中等 | 中等 |
| 性能 | 良好 | 良好 |
| 独立性 | ✅ 无依赖 | ✅ 无依赖 |

## 使用说明

### 开发模式
```bash
cd market
npm run dev
```

访问 `http://localhost:3000/` 查看新的 Cascading Waves 背景

### 生产模式
```bash
cd market
npm run build
npm start
```

## 调整参数

如果想要自定义波浪效果，可以修改 `cascading-waves.js` 中的参数：

```javascript
// 波浪密度
let xCount = 40;  // 横向线条数（更少=更稀疏）
let yCount = 60;  // 纵向分段数（更少=更大波浪）

// 颜色配置
let hueA = 340;  // 粉色色调（0-360）
let hueB = 210;  // 蓝色色调（0-360）

// 透明度范围
ctx.globalAlpha = map(cos(time), -1, 1, 0.15, 0.3);

// 模糊程度
ctx.filter = 'blur(10px)';  // 增加数值=更模糊

// 线条粗细
stroke(grad, 5);  // 第二个参数是粗细
```

## 浏览器兼容性
- ✅ Chrome/Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 故障排查

### Q: 背景不显示？
A: 检查浏览器控制台是否有 JavaScript 错误，尝试刷新页面（Ctrl + Shift + R）

### Q: 动画卡顿？
A: 可能是设备性能问题，可以减少 `xCount` 和 `yCount` 的值

### Q: 颜色不对？
A: 确保 `cascading-waves.js` 文件完整加载，检查 Network 面板

## 技术栈
- Canvas API
- SimplexNoise (内嵌实现)
- RequestAnimationFrame
- CSS3 (fixed positioning)

## 总结
新的 Cascading Waves 背景提供了更加流畅、梦幻的视觉体验，带有动态的色彩变化和柔和的发光效果，非常适合现代化的 Web 应用界面。

---

**状态**: ✅ 已完成
**构建**: ✅ 通过
**测试**: 待用户确认

**下一步**: 重启开发服务器查看效果
```bash
# 停止当前服务器 (Ctrl + C)
cd market
npm run dev
```

