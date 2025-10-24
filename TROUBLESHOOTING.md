# 🔧 常见问题解决方案

## ❌ 端口被占用错误

### 问题
```
Error: listen EADDRINUSE: address already in use 127.0.0.1:8545
```

### 原因
8545 端口已经被其他进程占用（通常是之前启动的 Hardhat 节点）

### 解决方案

#### Windows PowerShell:

```powershell
# 1. 查找占用端口的进程
netstat -ano | findstr :8545

# 输出示例:
# TCP    127.0.0.1:8545    0.0.0.0:0    LISTENING    37916
#                                                      ↑ 这是进程 ID (PID)

# 2. 终止进程（替换 37916 为你看到的 PID）
taskkill /F /PID 37916

# 3. 重新启动 Hardhat 节点
npx hardhat node
```

#### Linux/Mac:

```bash
# 1. 查找占用端口的进程
lsof -i :8545

# 2. 终止进程（替换 PID）
kill -9 <PID>

# 3. 重新启动
npx hardhat node
```

---

## ❌ 钱包连接失败

### 问题
```
Error: 请安装钱包扩展（MetaMask、OKX Wallet 等）
```

### 解决方案

1. **安装 MetaMask**:
   - 访问 https://metamask.io/
   - 下载并安装浏览器扩展
   - 刷新页面

2. **检查钱包是否解锁**:
   - 打开 MetaMask
   - 输入密码解锁

3. **检查权限**:
   - MetaMask → 设置 → 已连接的站点
   - 确认 localhost 有权限

---

## ❌ 网络错误

### 问题 1: Wrong network

```
请切换到 BSC 主网 (Chain ID: 56)
```

**解决方案**:
- 在 MetaMask 中切换到 BSC Mainnet
- 或点击页面上的"切换到本地网络"按钮

---

### 问题 2: Network request failed

```
Error: Network request failed
```

**解决方案**:
```bash
# 检查 Hardhat 节点是否运行
# 在新终端运行:
npx hardhat node
```

---

## ❌ 部署失败

### 问题
```
Error: cannot estimate gas
```

### 解决方案

**方法 1: 重启 Hardhat 节点**
```bash
# 1. 终止当前节点（Ctrl+C 或用上面的方法）
# 2. 清理缓存
rm -rf cache/ artifacts/

# 3. 重新启动
npx hardhat node
```

**方法 2: 检查合约代码**
```bash
# 重新编译合约
npx hardhat compile
```

---

## ❌ 余额不足

### 问题
```
Error: insufficient funds for intrinsic transaction cost
```

### 解决方案

**本地测试**:
1. 确认使用的是 Hardhat 测试账户
2. 检查 MetaMask 是否切换到 Hardhat Local 网络
3. 测试账户应该有 10000 ETH

**BSC 主网**:
1. 需要真实的 BNB
2. 至少 0.01 BNB 用于测试
3. 可以在币安购买 BNB 转入

---

## ❌ 合约调用失败

### 问题
```
Error: call revert exception
```

### 常见原因和解决方案

#### 1. 未启用 Fork 模式

**错误**: 测试真实 BSC 合约时报错

**解决**:
```bash
# 必须设置 FORK_BSC=true
$env:FORK_BSC="true"
npx hardhat test
```

#### 2. 合约地址错误

**检查**:
```javascript
// 确认使用正确的合约地址
const CONTRACT_ADDRESS = "0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7";
```

#### 3. 参数错误

**检查**:
```javascript
// outcomeCount 必须 >= 2
prepareCondition(oracle, questionId, 2); // ✅ 正确
prepareCondition(oracle, questionId, 1); // ❌ 错误
```

---

## ❌ 交易一直 Pending

### 问题
交易提交后一直显示"处理中"

### 解决方案

**本地测试**:
```bash
# Hardhat 自动挖矿，应该是即时的
# 如果 pending，重启节点:
npx hardhat node
```

**BSC 主网**:
```bash
# 正常等待 3-10 秒
# 可以在 BSCScan 查看:
# https://bscscan.com/tx/你的交易哈希
```

---

## ❌ MetaMask 错误

### 问题 1: Nonce too high

**解决方案**:
```
1. MetaMask → 设置 → 高级
2. 点击"重置账户"
3. 确认重置（不会丢失资金）
```

### 问题 2: 交易被拒绝

**解决方案**:
- 检查 Gas 费用是否合理
- 检查账户余额是否足够
- 重新发起交易

---

## ❌ 前端错误

### 问题: Cannot read property 'getConditionId' of undefined

**解决方案**:
```bash
# 1. 确认 Hardhat 节点运行中
npx hardhat node

# 2. 确认合约已部署
npx hardhat run scripts/deploy-local.js --network localhost

# 3. 重启前端
npm run dev
```

---

## ❌ 测试脚本错误

### 问题: missing trie node

**原因**: BSC RPC 节点不支持历史数据

**解决方案**:
```javascript
// hardhat.config.js
forking: {
  url: "https://bsc-dataseed1.binance.org",
  blockNumber: undefined  // ✅ 不指定 blockNumber
}
```

---

## 🔄 完全重置环境

如果遇到无法解决的问题，可以完全重置：

```bash
# 1. 关闭所有 Hardhat 节点
taskkill /F /IM node.exe  # Windows
# 或
killall node  # Linux/Mac

# 2. 清理所有缓存
rm -rf cache/
rm -rf artifacts/
rm -rf node_modules/.cache/
rm deployment-local.json

# 3. 重新安装依赖（可选）
npm install

# 4. 重新编译
npx hardhat compile

# 5. 重新启动
npx hardhat node
npx hardhat run scripts/deploy-local.js --network localhost
npm run dev
```

---

## 📚 获取帮助

### 检查日志

**Hardhat 节点日志**:
- 查看终端 1 的输出
- 会显示所有交易详情

**前端控制台**:
- F12 打开开发者工具
- 查看 Console 标签

**测试输出**:
- 运行测试时的完整输出
- 包含 Gas 消耗和错误信息

---

### 文档参考

- [START_LOCAL_TEST.md](./START_LOCAL_TEST.md) - 快速开始
- [LOCAL_TEST_GUIDE.md](./LOCAL_TEST_GUIDE.md) - 详细指南
- [TESTING_OVERVIEW.md](./TESTING_OVERVIEW.md) - 测试总览

---

## 💡 预防性建议

### 1. 保持环境整洁
```bash
# 定期清理缓存
rm -rf cache/ artifacts/
```

### 2. 使用独立终端
```
终端 1: Hardhat 节点（保持运行）
终端 2: 部署脚本（运行一次）
终端 3: 前端服务器（保持运行）
```

### 3. 记录重要信息
```
- 合约地址
- 测试账户私钥
- 成功的测试用例
```

### 4. 版本控制
```bash
# 不要提交敏感信息
.env.local
deployment-local.json
```

---

**最后更新**: 2025-10-21  
**帮助**: 如有其他问题，查看项目文档或提交 Issue

