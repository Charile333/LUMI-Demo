# Lottery 和 Lottery Game 页面品牌名称更新

## 📋 更新概览

已将 `/lottery` 和 `/lottery-game` 两个页面的产品名称从 "FortuneChain" 更新为 "LUMI"。

## ✅ 已完成的更新

### 1️⃣ lottery-game 页面
**文件**: `app/lottery-game/page.tsx`

- ✅ 页脚品牌名称: FortuneChain → LUMI

```555:555:app/lottery-game/page.tsx
<div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>LUMI</div>
```

### 2️⃣ lottery 页面
**文件**: `app/lottery/page.tsx`

- ✅ 页脚品牌名称通过翻译键 `t('lottery.footer.brandName')` 显示为 "LUMI"

```778:778:app/lottery/page.tsx
<div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('lottery.footer.brandName')}</div>
```

### 3️⃣ 翻译文件更新

#### 中文翻译 (`locales/zh.json`)

新增的翻译键：
```json
{
  "lottery": {
    "game": {
      "copyright": "© 2023 LUMI. 保留所有权利。"
    },
    "footer": {
      "brandName": "LUMI",
      "brandDescription": "持牌区块链博彩平台，提供公平可证明的游戏、透明运营和即时支付。请理性博彩。",
      "copyrightText": "© 2023 LUMI。保留所有权利。",
      "copyright": "© 2023 LUMI。保留所有权利。",
      
      // 新增所有链接键
      "gamesTitle": "游戏",
      "slotsLink": "老虎机",
      "liveCasinoLink": "真人娱乐场",
      "sportsBettingLink": "体育博彩",
      "esportsLink": "电竞",
      "tournamentsLink": "锦标赛",
      
      "supportTitle": "支持",
      "helpCenterLink": "帮助中心",
      "faqLink": "常见问题",
      "contactLink": "联系我们",
      "responsibleGamblingLink": "理性博彩",
      "termsConditionsLink": "条款和条件",
      
      "legalTitle": "法律",
      "licenseInfoLink": "许可证信息",
      "privacyPolicyLink": "隐私政策",
      "termsServiceLink": "服务条款",
      "cookiePolicyLink": "Cookie 政策",
      "jurisdictionLink": "司法管辖区限制"
    }
  }
}
```

#### 英文翻译 (`locales/en.json`)

相应的英文翻译键：
```json
{
  "lottery": {
    "game": {
      "copyright": "© 2023 LUMI. All rights reserved."
    },
    "footer": {
      "brandName": "LUMI",
      "brandDescription": "A licensed blockchain gambling platform offering provably fair games, transparent operations, and instant payouts. Gamble responsibly.",
      "copyrightText": "© 2023 LUMI. All rights reserved.",
      "copyright": "© 2023 LUMI. All rights reserved.",
      
      // All link keys in English
      "gamesTitle": "Games",
      "slotsLink": "Slots",
      "liveCasinoLink": "Live Casino",
      "sportsBettingLink": "Sports Betting",
      "esportsLink": "Esports",
      "tournamentsLink": "Tournaments",
      
      "supportTitle": "Support",
      "helpCenterLink": "Help Center",
      "faqLink": "FAQs",
      "contactLink": "Contact Us",
      "responsibleGamblingLink": "Responsible Gambling",
      "termsConditionsLink": "Terms & Conditions",
      
      "legalTitle": "Legal",
      "licenseInfoLink": "License Information",
      "privacyPolicyLink": "Privacy Policy",
      "termsServiceLink": "Terms of Service",
      "cookiePolicyLink": "Cookie Policy",
      "jurisdictionLink": "Jurisdiction Restrictions"
    }
  }
}
```

## 📝 品牌名称出现位置

### lottery-game 页面
- 页脚左侧品牌标识

### lottery 页面
- 页脚左侧品牌标识（通过翻译键）
- 版权声明（通过翻译键）

## 🔄 相关更新

除了品牌名称外，还完善了以下内容：

1. **补充了缺失的翻译键**
   - 为 `lottery.footer` 添加了所有链接的翻译键
   - 包括游戏、支持、法律三个部分的所有链接

2. **统一了版权信息**
   - lottery.game.copyright: "© 2023 LUMI. ..."
   - lottery.footer.copyright: "© 2023 LUMI. ..."
   - lottery.footer.copyrightText: "© 2023 LUMI. ..."

## 🎯 验证建议

1. **视觉检查**
   - 访问 `/lottery` 页面，检查页脚品牌名称
   - 访问 `/lottery-game` 页面，检查页脚品牌名称
   - 确认两个页面都显示为 "LUMI"

2. **语言切换测试**
   - 在两个页面切换语言（EN/中）
   - 确认品牌名称 "LUMI" 在两种语言下都正确显示

3. **版权声明检查**
   - 检查页脚底部的版权声明
   - 确认显示为 "© 2023 LUMI. ..."

## 📁 更新的文件

1. `app/lottery-game/page.tsx` - 直接更新品牌名称
2. `locales/zh.json` - 新增/更新品牌名称和相关翻译键
3. `locales/en.json` - 新增/更新品牌名称和相关翻译键

## 🎨 样式说明

品牌名称使用的样式：
- 字体: 'Playfair Display', serif（优雅衬线字体）
- 颜色: #b8860b（金色）
- 大小: text-2xl（较大）
- 粗细: font-bold（加粗）

这个样式与整个页面的金色主题保持一致。

---
**状态**: ✅ 完成
**日期**: 2025-10-27



