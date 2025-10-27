# 🎫 Lottery-Game 页面国际化指南

## 📋 需要添加的中文翻译

由于 lottery-game 页面内容较多，这里列出所有需要添加到 `locales/zh.json` 和 `locales/en.json` 的翻译键。

### 建议在 lottery 部分添加 game 子对象：

```json
"lottery": {
  // ... 现有的 lottery 翻译 ...
  
  "game": {
    // 导航栏
    "nav": {
      "lottery": "彩票",
      "jackpots": "奖池",
      "winners": "中奖者",
      "howItWorks": "玩法说明",
      "support": "客服支持"
    },
    
    // 返回按钮
    "backToLottery": "返回博彩",
    "connectWallet": "连接钱包",
    
    // 页面标题
    "title": "Fortune Chain 彩票",
    "subtitle": "可证明公平的区块链彩票，透明开奖，即时到账",
    
    // 倒计时
    "nextDrawIn": "下次开奖倒计时",
    "hours": "小时",
    "minutes": "分钟",
    "seconds": "秒",
    
    // 奖金信息
    "currentJackpot": "当前奖池",
    "totalTickets": "总票数",
    "players": "玩家",
    "drawNumber": "开奖期号",
    
    // 选号区域
    "selectNumbers": "选择您的号码",
    "chooseNumbers": "从1-50中选择5个号码",
    "yourNumbers": "您的号码",
    "clearSelection": "清除选择",
    "selectToStart": "选择5个号码开始",
    "quickPick": "快选（随机号码）",
    
    // 票数和价格
    "ticketQuantity": "票数",
    "pricePerTicket": "每张票价格",
    "standard": "标准",
    "atCurrentRates": "按当前汇率",
    "totalAmount": "总金额",
    "purchaseTickets": "购买彩票",
    "connectToContinue": "连接钱包继续",
    
    // 玩法说明
    "howItWorksTitle": "玩法说明",
    "step1Title": "1. 购买彩票",
    "step1Desc": "选择5个号码或使用快选。每张票0.05 ETH。",
    "step2Title": "2. 等待开奖",
    "step2Desc": "自动抽奖，区块链上透明可验证。",
    "step3Title": "3. 赢取奖金",
    "step3Desc": "中奖后自动发送到您的钱包。",
    
    // 最近开奖
    "recentDraws": "最近开奖",
    "viewHistory": "查看历史",
    "draw": "期号",
    "winningNumbers": "中奖号码",
    "winners": "中奖者",
    "prize": "奖金",
    
    // 我的彩票
    "myTickets": "我的彩票",
    "noTickets": "您还没有购买彩票",
    "buyFirst": "购买您的第一张彩票！",
    "ticket": "票",
    "drawDate": "开奖日期",
    "status": "状态",
    "pending": "待开奖",
    "lost": "未中奖",
    "won": "已中奖",
    
    // 彩票详情
    "ticketDetails": "彩票详情",
    "ticketId": "票号",
    "purchaseDate": "购买日期",
    "yourSelection": "您选择的号码",
    "matchedNumbers": "匹配号码",
    "prizeAmount": "奖金金额",
    
    // 奖金分配
    "prizeDistribution": "奖金分配",
    "match5": "5个号码匹配",
    "match4": "4个号码匹配",
    "match3": "3个号码匹配",
    "match2": "2个号码匹配",
    "jackpot": "大奖",
    "ofPot": "奖池的",
    
    // 统计信息
    "statistics": "统计信息",
    "totalDraws": "总开奖次数",
    "totalWinners": "总中奖人数",
    "largestJackpot": "最大奖池",
    "averageJackpot": "平均奖池",
    
    // 负责任博彩
    "playResponsibly": "请理性博彩",
    "ageRestriction": "仅限18岁以上",
    "gamblingHelp": "博彩问题帮助",
    "termsApply": "条款适用"
  }
}
```

---

## 🔄 需要修改的页面部分

### 1. 导航栏 (第84-88行)
```tsx
// 当前
<a href="#">Lottery</a>
<a href="#">Jackpots</a>
...

// 改为
<a href="#">{t('lottery.game.nav.lottery')}</a>
<a href="#">{t('lottery.game.nav.jackpots')}</a>
...
```

### 2. 标题部分 (第121-122行)
```tsx
// 当前
<h1>Fortune Chain Lottery</h1>
<p>Provably fair blockchain lottery...</p>

// 改为
<h1>{t('lottery.game.title')}</h1>
<p>{t('lottery.game.subtitle')}</p>
```

### 3. 倒计时 (第126-138行)
```tsx
// 当前
<p>Next Draw In</p>
<span>Hours</span>
<span>Mins</span>
<span>Secs</span>

// 改为
<p>{t('lottery.game.nextDrawIn')}</p>
<span>{t('lottery.game.hours')}</span>
<span>{t('lottery.game.minutes')}</span>
<span>{t('lottery.game.seconds')}</span>
```

### 4. 选号区域 (第181-224行)
```tsx
// 当前
<h2>Select Your Numbers</h2>
<p>Choose 5 numbers from 1-50</p>
<button>Quick Pick (Random Numbers)</button>

// 改为
<h2>{t('lottery.game.selectNumbers')}</h2>
<p>{t('lottery.game.chooseNumbers')}</p>
<button>{t('lottery.game.quickPick')}</button>
```

### 5. 购买按钮 (第287-296行)
```tsx
// 当前
<button>Purchase Tickets</button>
<button>Connect Wallet to Continue</button>

// 改为
<button>{t('lottery.game.purchaseTickets')}</button>
<button>{t('lottery.game.connectToContinue')}</button>
```

---

## ✅ 推荐实施步骤

### 步骤 1: 添加翻译到 locales 文件
1. 在 `locales/zh.json` 的 `lottery` 对象中添加 `game` 子对象
2. 在 `locales/en.json` 的 `lottery` 对象中添加对应的英文翻译

### 步骤 2: 逐步替换页面文本
从关键部分开始：
1. 导航栏
2. 标题和副标题  
3. 按钮文本
4. 表单标签
5. 其他辅助文本

### 步骤 3: 测试语言切换
确保两个页面的语言切换同步工作

---

## 📝 注意事项

- 由于内容较多，建议分批次完成
- 优先翻译用户最常看到的部分（标题、按钮）
- 保持翻译键名称清晰易懂
- 中英文翻译要准确对应

---

**需要我帮您完成这个国际化工作吗？我可以逐步替换所有文本。**



