# ID冲突修复总结

## 问题描述
不同分类的市场数据文件使用了相同的ID范围，导致在详细页显示时，导航栏高亮显示错误的分类。

例如：
- 用户在"科技发布与AI创新"页面点击卡片（ID 101-104）
- 详细页同时在 `smartDeviceData` 和 `techAiData` 中找到数据
- 由于查询逻辑 `automotiveData || smartDeviceData || techAiData || ...`
- `smartDeviceData` 被优先使用，导致导航栏错误高亮"手机与智能硬件"

## 解决方案
重新分配所有分类的ID范围，确保每个分类使用唯一的ID区间。

## 新的ID分配方案

| 分类 | 文件 | ID范围 | 状态 |
|------|------|--------|------|
| 汽车与新能源 | `marketData.ts` | 1-100 | ✅ 保持不变 |
| 手机与智能硬件 | `smartDevicesData.ts` | 101-200 | ✅ 保持不变 |
| 科技发布与AI创新 | `techAiData.ts` | 201-300 | ✅ 已修改 (原 101-104 → 201-204) |
| 娱乐与文化 | `entertainmentData.ts` | 301-400 | ✅ 已修改 (原 201-204 → 301-304) |
| 体育与电竞 | `sportsGamingData.ts` | 401-500 | ✅ 已修改 (原 301-304 → 401-404) |
| 经济与社会趋势 | `economySocialData.ts` | 501-600 | ✅ 已修改 (原 401-404 → 501-504) |
| 新兴赛道 | `emergingData.ts` | 601-700 | ✅ 已修改 (原 501-504 → 601-604) |

## 修改的文件
1. ✅ `market/lib/techAiData.ts`
2. ✅ `market/lib/entertainmentData.ts`
3. ✅ `market/lib/sportsGamingData.ts`
4. ✅ `market/lib/economySocialData.ts`
5. ✅ `market/lib/emergingData.ts`

## 预期效果
现在当用户：
1. 在任何分类页面点击卡片进入详细页
2. 详细页的导航栏会正确高亮当前卡片所属的分类
3. 点击"返回"按钮会回到正确的分类页面

## 测试建议
1. 在"科技发布与AI创新"页面点击卡片，检查详细页导航栏是否正确高亮
2. 在"体育与电竞"页面点击卡片，检查详细页导航栏是否正确高亮
3. 在其他分类页面重复测试
4. 确认"返回"按钮能正确返回到来源分类页面

## 技术细节
详细页的分类判断逻辑（`market/app/event/[eventId]/page.tsx`）：
```typescript
let currentCategory = 'automotive';
if (automotiveData) currentCategory = 'automotive';
else if (smartDeviceData) currentCategory = 'smart-devices';
else if (techAiData) currentCategory = 'tech-ai';
else if (entertainmentData) currentCategory = 'entertainment';
else if (sportsGamingData) currentCategory = 'sports-gaming';
else if (economySocialData) currentCategory = 'economy-social';
else if (emergingData) currentCategory = 'emerging';
```

由于现在每个ID只会在一个数据源中存在，这个逻辑能够正确识别卡片所属的分类。

---
修复日期：2025-10-19

