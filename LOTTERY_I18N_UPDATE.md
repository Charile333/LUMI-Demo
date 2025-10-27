# Lottery 页面国际化更新说明

## ✅ 已完成的工作

### 1. 翻译文件更新
- ✅ 更新了 `locales/zh.json` - 添加了完整的中文翻译
- ✅ 更新了 `locales/en.json` - 添加了完整的英文翻译

### 2. 新增的翻译键（共6大模块）

#### 📍 Banner 横幅
- `lottery.banner.title` - 标题
- `lottery.banner.description` - 描述
- `lottery.banner.exploreGames` - 探索游戏按钮
- `lottery.banner.depositFunds` - 存款按钮

#### 🎮 Game Categories 游戏分类
- `lottery.gameCategories.title` - 分类标题
- `lottery.gameCategories.slots` - 老虎机
- `lottery.gameCategories.slotsCount` - 游戏数量
- `lottery.gameCategories.liveCasinoTitle` - 真人娱乐场
- `lottery.gameCategories.liveCasinoCount` - 桌子数量
- `lottery.gameCategories.sportsbook` - 体育博彩
- `lottery.gameCategories.sportsbookCount` - 运动数量
- `lottery.gameCategories.tournamentsTitle` - 锦标赛
- `lottery.gameCategories.tournamentsCount` - 活跃数量

#### ⭐ Featured Games 精选游戏
- `lottery.featured.title` - 标题
- `lottery.featured.viewAll` - 查看全部
- `lottery.featured.hot` - 热门标签
- `lottery.featured.live` - 直播标签
- `lottery.featured.rating` - 评分
- `lottery.featured.playNow` - 立即游戏
- `lottery.featured.betNow` - 立即投注
- 各个游戏的名称和描述

#### 🏀 Live Sports 实时体育
- `lottery.liveSports.title` - 标题
- `lottery.liveSports.football` - 足球
- `lottery.liveSports.basketball` - 篮球
- `lottery.liveSports.premierLeague` - 英超联赛
- `lottery.liveSports.laLiga` - 西甲联赛
- `lottery.liveSports.nba` - NBA
- `lottery.liveSports.moreMarkets` - 更多市场

#### ✅ Provably Fair 公平可证明
- `lottery.provablyFair.title` - 标题
- `lottery.provablyFair.description` - 描述
- `lottery.provablyFair.transparentTitle` - 透明结果标题
- `lottery.provablyFair.transparentDesc` - 透明结果描述
- `lottery.provablyFair.verifiableTitle` - 可验证结果标题
- `lottery.provablyFair.verifiableDesc` - 可验证结果描述
- `lottery.provablyFair.instantTitle` - 即时支付标题
- `lottery.provablyFair.instantDesc` - 即时支付描述
- `lottery.provablyFair.learnMore` - 了解更多
- `lottery.provablyFair.licensed` - 持有许可证
- `lottery.provablyFair.licenseNumber` - 许可证号

#### 🎫 Bet Slip 投注单
- `lottery.betSlip.title` - 标题
- `lottery.betSlip.clearAll` - 清除全部
- `lottery.betSlip.empty` - 空状态提示
- `lottery.betSlip.emptyDesc` - 空状态描述
- `lottery.betSlip.stake` - 投注额
- `lottery.betSlip.totalStake` - 总投注额
- `lottery.betSlip.potentialWin` - 潜在赢奖
- `lottery.betSlip.placeBet` - 下注按钮

#### 💰 Account 账户
- `lottery.account.title` - 标题
- `lottery.account.availableBalance` - 可用余额
- `lottery.account.deposit` - 存款
- `lottery.account.withdraw` - 提款
- `lottery.account.recentTransactions` - 最近交易
- `lottery.account.transactionDeposit` - 存款交易
- `lottery.account.transactionBet` - 投注交易
- `lottery.account.transactionWinnings` - 奖金
- `lottery.account.transactionWithdrawal` - 提款交易
- `lottery.account.viewAll` - 查看所有交易
- `lottery.account.today` - 今天
- `lottery.account.yesterday` - 昨天

#### 🎁 Promotions 促销
- `lottery.promotionsCard.title` - 标题
- `lottery.promotionsCard.welcomeBonus` - 欢迎奖金
- `lottery.promotionsCard.welcomeBonusDesc` - 欢迎奖金描述
- `lottery.promotionsCard.weeklyCashback` - 每周返现
- `lottery.promotionsCard.weeklyCashbackDesc` - 返现描述
- `lottery.promotionsCard.claimNow` - 立即领取
- `lottery.promotionsCard.learnMore` - 了解更多

#### 🔗 Footer 页脚
- `lottery.footer.description` - 平台描述
- `lottery.footer.gamesSection` - 游戏部分
- `lottery.footer.supportSection` - 支持部分
- `lottery.footer.legalSection` - 法律部分
- 以及所有链接的翻译

## 📝 需要继续的工作

### 下一步：更新 lottery/page.tsx 文件

由于 lottery 页面有 827 行代码，建议使用"查找替换"功能批量更新所有硬编码文本：

#### 示例替换规则：

1. **游戏分类部分** (行 140-178)
```typescript
// 替换前
<h2 className="text-lg font-semibold">Game Categories</h2>

// 替换后
<h2 className="text-lg font-semibold">{t('lottery.gameCategories.title')}</h2>
```

2. **精选游戏部分** (行 182-258)
```typescript
// 替换前
<h2 className="text-xl font-bold">Featured Games</h2>
<a href="#" className="text-sm">View All</a>

// 替换后
<h2 className="text-xl font-bold">{t('lottery.featured.title')}</h2>
<a href="#" className="text-sm">{t('lottery.featured.viewAll')}</a>
```

3. **实时体育部分** (行 262-444)
```typescript
// 替换前
<h2 className="text-xl font-bold">Live Sports Events</h2>

// 替换后
<h2 className="text-xl font-bold">{t('lottery.liveSports.title')}</h2>
```

4. **公平可证明部分** (行 448-513)
```typescript
// 替换前
<h2 className="text-lg font-semibold">Provably Fair Gaming</h2>
<p className="text-sm text-gray-300 mb-4">
  All our games operate on a provably fair system...
</p>

// 替换后
<h2 className="text-lg font-semibold">{t('lottery.provablyFair.title')}</h2>
<p className="text-sm text-gray-300 mb-4">
  {t('lottery.provablyFair.description')}
</p>
```

5. **投注单部分** (行 520-596)
```typescript
// 替换前
<h2 className="text-lg font-semibold">Bet Slip</h2>
<p className="text-gray-500 mb-2">Your bet slip is empty</p>

// 替换后
<h2 className="text-lg font-semibold">{t('lottery.betSlip.title')}</h2>
<p className="text-gray-500 mb-2">{t('lottery.betSlip.empty')}</p>
```

6. **账户部分** (行 600-688)
```typescript
// 替换前
<h2 className="text-lg font-semibold">My Account</h2>
<span className="text-sm text-gray-400">Available Balance</span>

// 替换后
<h2 className="text-lg font-semibold">{t('lottery.account.title')}</h2>
<span className="text-sm text-gray-400">{t('lottery.account.availableBalance')}</span>
```

7. **促销部分** (行 691-725)
```typescript
// 替换前
<h2 className="text-lg font-semibold">Current Promotions</h2>
<h3 className="font-medium text-white">Welcome Bonus</h3>

// 替换后
<h2 className="text-lg font-semibold">{t('lottery.promotionsCard.title')}</h2>
<h3 className="font-medium text-white">{t('lottery.promotionsCard.welcomeBonus')}</h3>
```

8. **页脚部分** (行 755-812)
```typescript
// 替换前
<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Games</h3>
<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>

// 替换后
<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.footer.gamesSection')}</h3>
<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.footer.supportSection')}</h3>
```

## 🎯 快速操作指南

### 方法 1：使用 VS Code 批量替换
1. 打开 `app/lottery/page.tsx`
2. 按 `Ctrl+H` 打开查找替换
3. 使用正则表达式模式
4. 逐个替换所有硬编码文本

### 方法 2：使用脚本自动替换
创建一个简单的 Node.js 脚本来批量替换所有文本。

## ✨ 预期效果

完成后，lottery 页面将：
- ✅ 支持中英文完全切换
- ✅ 所有文本都通过 i18n 管理
- ✅ 保持现有的所有功能和样式
- ✅ 便于未来添加更多语言

## 📌 注意事项

1. **保留数字和符号**：如 "48 Games"、"0.001 ETH" 等
2. **保留HTML结构**：只替换文本内容
3. **测试所有语言切换**：确保中英文都正常显示
4. **检查长文本**：确保中文文本不会造成布局问题

---

**更新时间：** 2025年10月27日  
**状态：** 翻译文件已完成 ✅，页面更新进行中 🚧

