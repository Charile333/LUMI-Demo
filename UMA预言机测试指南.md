# 🧪 UMA 预言机完整测试指南

## 🎉 恭喜！部署完成

您现在拥有完整的 Polymarket 系统，包括 **UMA 官方预言机**！

---

## 📋 已部署的组件

| 组件 | 地址 | 状态 |
|------|------|------|
| **RealUmaCTFAdapter** | `0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C` | ✅ 新部署 |
| **UMA Oracle V2** | `0x263351499f82C107e540B01F0Ca959843e22464a` | ✅ 官方 |
| **ConditionalTokens** | `0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2` | ✅ 已配置 |
| **CTF Exchange** | `0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d` | ✅ 已配置 |
| **Mock USDC** | `0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a` | ✅ 已配置 |

---

## 🚀 测试步骤

### 第 1 阶段：基础功能测试（5分钟）

#### 1.1 访问主页

```
http://localhost:3000
```

**验证**：
- [ ] 页面正常加载
- [ ] 没有控制台错误
- [ ] 导航栏显示正常

#### 1.2 浏览市场列表

```
http://localhost:3000/grid-market
```

**验证**：
- [ ] 市场卡片正常显示
- [ ] 价格数据加载正常
- [ ] 可以筛选市场分类

#### 1.3 查看市场详情

点击任意市场卡片

**验证**：
- [ ] 市场详情页打开
- [ ] 显示价格图表
- [ ] 显示订单簿
- [ ] 可以查看市场描述

---

### 第 2 阶段：钱包连接测试（5分钟）

#### 2.1 连接 MetaMask

1. 点击 "Connect Wallet"
2. 选择 MetaMask
3. 切换到 **Polygon Amoy** 测试网

**验证**：
- [ ] 钱包成功连接
- [ ] 显示正确的地址
- [ ] 显示余额

#### 2.2 添加测试网络（如果需要）

**Polygon Amoy 网络配置**：
```
网络名称: Polygon Amoy Testnet
RPC URL: https://polygon-amoy-bor-rpc.publicnode.com
Chain ID: 80002
货币符号: POL
区块浏览器: https://amoy.polygonscan.com
```

---

### 第 3 阶段：交易功能测试（10分钟）

#### 3.1 查看订单簿

在市场详情页查看订单簿

**验证**：
- [ ] 显示买单和卖单
- [ ] 价格和数量正确显示
- [ ] 订单簿实时更新

#### 3.2 测试下单（可选）

1. 选择买入或卖出
2. 输入金额
3. 确认订单

**验证**：
- [ ] 订单创建成功
- [ ] 订单显示在订单簿中
- [ ] 钱包余额更新

---

### 第 4 阶段：管理后台测试（10分钟）

#### 4.1 访问管理后台

```
http://localhost:3000/_dev_only_admin/create-market
```

#### 4.2 创建测试市场

**填写市场信息**：
```
标题: Will Bitcoin exceed $100k in 2024?
描述: This market will resolve to YES if Bitcoin...
结算时间: 选择一个未来时间
奖励: 100 USDC
```

**验证**：
- [ ] 市场创建表单正常
- [ ] 可以输入所有字段
- [ ] 提交按钮可点击

#### 4.3 部署市场到链上

点击 "Deploy to Blockchain"

**验证**：
- [ ] MetaMask 弹出交易确认
- [ ] 交易参数正确显示
- [ ] Gas 费用合理

#### 4.4 确认交易

在 MetaMask 中确认交易

**验证**：
- [ ] 交易成功提交
- [ ] 显示交易哈希
- [ ] 可以在浏览器查看交易

#### 4.5 查看新市场

等待交易确认后刷新市场列表

**验证**：
- [ ] 新市场出现在列表中
- [ ] 市场信息正确显示
- [ ] 可以进入市场详情页

---

### 第 5 阶段：UMA 预言机测试（高级）

#### 5.1 理解 UMA 预言机流程

```
1. 市场到期
   ↓
2. 提议者提交结果（需要保证金）
   ↓
3. 挑战期（2小时）
   ├─ 无人质疑 → 结果确定
   └─ 有人质疑 → UMA投票
   ↓
4. 市场结算
```

#### 5.2 创建短期测试市场

**建议设置**：
```
标题: Test Market - Will this resolve to YES?
描述: Quick test market for UMA oracle
结算时间: 当前时间 + 5分钟
奖励: 10 USDC（测试用）
```

#### 5.3 等待市场到期

等待设定的结算时间

#### 5.4 调用 UMA 预言机

**方法 1：使用 Hardhat 脚本**
```bash
npx hardhat run scripts/request-oracle-price.js --network amoy
```

**方法 2：使用管理后台**
访问管理后台的结算功能

#### 5.5 观察预言机流程

**查看合约交互**：
```
https://amoy.polygonscan.com/address/0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C
```

**验证**：
- [ ] 可以看到 `requestOraclePrice` 交易
- [ ] UMA Oracle 合约收到请求
- [ ] 开始挑战期倒计时

#### 5.6 等待挑战期（2小时）

在真实的 UMA 预言机中，需要等待约 2 小时的挑战期

**期间可以**：
- [ ] 查看提案详情
- [ ] 观察是否有争议
- [ ] 监控预言机状态

#### 5.7 结算市场

挑战期结束后，调用结算函数

**验证**：
- [ ] 市场状态变为 "已结算"
- [ ] 显示最终结果（YES/NO）
- [ ] 用户可以赎回代币

---

## 🔍 验证部署

### 检查合约部署

访问区块链浏览器：
```
https://amoy.polygonscan.com/address/0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C
```

**验证**：
- [ ] 合约存在且已验证
- [ ] 可以看到合约代码
- [ ] 有交易历史

### 检查 UMA 预言机

```
https://amoy.polygonscan.com/address/0x263351499f82C107e540B01F0Ca959843e22464a
```

**验证**：
- [ ] 显示为 `OptimisticOracleV2`
- [ ] 是 UMA 官方部署
- [ ] 有大量交易历史

---

## 🐛 常见问题

### Q1: 页面显示 404 错误

**解决方案**：
```bash
# 清理缓存
Remove-Item -Path .next -Recurse -Force

# 重启服务器
npm run dev
```

### Q2: 钱包连接失败

**检查**：
- 是否安装了 MetaMask
- 是否切换到 Polygon Amoy 网络
- 网络配置是否正确

### Q3: 交易失败

**可能原因**：
- Gas 费用不足
- 余额不足
- 网络拥堵

**解决方案**：
- 增加 Gas 限制
- 获取更多测试币
- 等待网络恢复

### Q4: UMA 预言机没有响应

**可能原因**：
- 市场还未到期
- 没有提案者提交结果
- 挑战期还未结束

**检查**：
```bash
# 查看合约状态
npx hardhat run scripts/check-market-status.js --network amoy
```

---

## 📊 性能测试

### 测试项目

- [ ] 页面加载时间 < 3秒
- [ ] 市场列表加载 < 2秒
- [ ] 订单簿更新 < 1秒
- [ ] 交易确认 < 5秒
- [ ] 图表渲染流畅

### 压力测试

- [ ] 同时显示 100+ 市场
- [ ] 订单簿 1000+ 订单
- [ ] 多用户同时交易
- [ ] 长时间运行稳定

---

## ✅ 测试检查清单

### 基础功能
- [ ] 页面正常加载
- [ ] 市场列表显示
- [ ] 市场详情可访问
- [ ] 钱包连接正常
- [ ] 订单簿工作正常

### 高级功能
- [ ] 可以创建市场
- [ ] 可以部署到链上
- [ ] UMA 预言机集成正常
- [ ] 市场结算功能正常
- [ ] 代币赎回正常

### 性能测试
- [ ] 页面加载速度快
- [ ] 无内存泄漏
- [ ] 实时更新流畅
- [ ] 移动端适配良好

---

## 🎯 成功标准

完成以下测试即为成功：

1. ✅ 基础功能测试全部通过
2. ✅ 可以创建和部署市场
3. ✅ UMA 预言机正常工作
4. ✅ 交易流程完整可用
5. ✅ 没有严重 bug

---

## 📚 参考资料

### 官方文档
- **UMA 文档**: https://docs.uma.xyz
- **Polymarket**: https://polymarket.com
- **Gnosis CTF**: https://docs.gnosis.io/conditionaltokens

### 项目文档
- `POLYMARKET_SYSTEM_CONFIG.md` - 系统配置
- `完整部署Polymarket系统指南.md` - 部署指南
- `UMA预言机使用说明.md` - 预言机说明

### 区块链浏览器
- **Polygon Amoy**: https://amoy.polygonscan.com
- **您的合约**: https://amoy.polygonscan.com/address/0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C

---

## 🎉 测试完成

完成所有测试后，您将确认：

✅ 系统功能完整  
✅ UMA 预言机工作正常  
✅ 与 Polymarket 架构一致  
✅ 可以用于生产环境  

---

**祝测试顺利！** 🚀

如有问题，参考文档或查看区块链浏览器获取更多信息。

