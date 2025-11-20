# 🔷 GitLab 任务运行说明

## 📋 概述

GitLab CI/CD 配置中有**两个独立的任务**，它们**不会一起运行**，而是通过不同的环境变量分别触发。

---

## 🎯 两个任务对比

| 特性 | 概率曲线任务 | 批量结算任务 |
|------|------------|------------|
| **任务名称** | `record-price-history` | `batch-settle-trades` |
| **Stage** | `price-history` | `settle-trades` |
| **触发变量** | `RUN_PRICE_HISTORY=true` | `RUN_SETTLE_TRADES=true` |
| **运行频率** | 每 5-10 分钟 | 每小时 |
| **功能** | 记录市场价格历史，用于生成概率曲线 | 批量结算已完成的交易 |
| **执行方式** | 运行 Node.js 脚本 | 调用 Vercel API |
| **镜像** | `node:18-alpine` | `curlimages/curl:latest` |

---

## 🔍 如何区分两个任务

### 1. 通过 Pipeline 日志区分

#### 概率曲线任务 (`record-price-history`)
```
📊 开始记录价格历史...
时间: ...
分支: ...
触发源: schedule
npm ci
npm run record-prices
✅ 价格历史记录完成
```

#### 批量结算任务 (`batch-settle-trades`)
```
🔄 触发批量结算 API...
时间: ...
分支: ...
触发源: schedule
调用 API: https://your-app.vercel.app/api/cron/settle-trades
HTTP 状态码: 200
✅ 批量结算触发成功
```

### 2. 通过环境变量区分

在 Pipeline Schedule 的 Variables 中：

**概率曲线任务需要：**
```
RUN_PRICE_HISTORY=true
```

**批量结算任务需要：**
```
RUN_SETTLE_TRADES=true
```

### 3. 通过 Stage 区分

在 Pipeline 视图中，可以看到不同的 Stage：

- **Stage 1**: `price-history` → 概率曲线任务
- **Stage 2**: `settle-trades` → 批量结算任务

---

## ⚙️ 运行机制

### 独立运行，互不影响

两个任务配置在不同的 `stage` 中，可以**并行运行**，互不依赖：

```yaml
stages:
  - price-history      # Stage 1: 概率曲线
  - settle-trades     # Stage 2: 批量结算
```

### 触发规则

每个任务都有自己的触发规则：

#### 概率曲线任务
```yaml
rules:
  # 定时任务触发（需要 RUN_PRICE_HISTORY=true）
  - if: $CI_PIPELINE_SOURCE == "schedule" && $RUN_PRICE_HISTORY == "true"
  # 手动触发
  - if: $CI_PIPELINE_SOURCE == "web" && $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
    when: manual
```

#### 批量结算任务
```yaml
rules:
  # 定时任务触发（需要 RUN_SETTLE_TRADES=true）
  - if: $CI_PIPELINE_SOURCE == "schedule" && $RUN_SETTLE_TRADES == "true"
  # 手动触发
  - if: $CI_PIPELINE_SOURCE == "web" && $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
    when: manual
```

---

## 📅 配置两个独立的 Schedule

### Schedule 1: 概率曲线（每 5 分钟）

1. 进入 `CI/CD` > `Schedules`
2. 点击 `New schedule`
3. 配置：
   - **Description**: `价格历史记录（概率曲线）`
   - **Interval Pattern**: `*/5 * * * *`（每 5 分钟）
   - **Timezone**: `Asia/Shanghai`
   - **Target Branch**: `master`
   - **Activated**: ✅ 勾选
4. 在 **Variables** 中添加：
   ```
   Key: RUN_PRICE_HISTORY
   Value: true
   ```
5. 点击 `Save pipeline schedule`

### Schedule 2: 批量结算（每小时）

1. 进入 `CI/CD` > `Schedules`
2. 点击 `New schedule`
3. 配置：
   - **Description**: `批量结算交易`
   - **Interval Pattern**: `0 * * * *`（每小时整点）
   - **Timezone**: `Asia/Shanghai`
   - **Target Branch**: `master`
   - **Activated**: ✅ 勾选
4. 在 **Variables** 中添加：
   ```
   Key: RUN_SETTLE_TRADES
   Value: true
   ```
5. 点击 `Save pipeline schedule`

---

## 🔍 如何检查任务是否运行

### 方法 1: 查看 Pipeline 列表

1. 进入 `CI/CD` > `Pipelines`
2. 查看最近的 Pipeline：
   - 如果看到 `record-price-history` job → 概率曲线任务已运行
   - 如果看到 `batch-settle-trades` job → 批量结算任务已运行

### 方法 2: 查看 Schedule 执行历史

1. 进入 `CI/CD` > `Schedules`
2. 点击对应的 Schedule
3. 查看 "Last pipeline" 和 "Next run" 信息

### 方法 3: 查看任务日志

#### 概率曲线任务日志
- 会显示：`📊 开始记录价格历史...`
- 会显示：`✅ 价格历史记录完成`
- 会显示每个市场的价格记录情况

#### 批量结算任务日志
- 会显示：`🔄 触发批量结算 API...`
- 会显示：`HTTP 状态码: 200`
- 会显示：`✅ 批量结算触发成功`

---

## ⚠️ 常见问题

### Q: 两个任务会一起运行吗？

**A:** 不会。它们是**独立触发**的：
- 概率曲线任务：当 `RUN_PRICE_HISTORY=true` 时运行
- 批量结算任务：当 `RUN_SETTLE_TRADES=true` 时运行

### Q: 如果两个 Schedule 同时触发会怎样？

**A:** 会创建两个独立的 Pipeline，每个 Pipeline 只运行对应的任务。

### Q: 如何只运行其中一个任务？

**A:** 在手动触发 Pipeline 时，只设置对应的环境变量：
- 只运行概率曲线：设置 `RUN_PRICE_HISTORY=true`
- 只运行批量结算：设置 `RUN_SETTLE_TRADES=true`

### Q: 两个任务可以同时运行吗？

**A:** 可以。它们在不同的 stage 中，互不依赖，可以并行运行。

---

## 📝 总结

1. ✅ **两个任务是独立的**，不会一起运行
2. ✅ **通过环境变量区分**：`RUN_PRICE_HISTORY` vs `RUN_SETTLE_TRADES`
3. ✅ **需要创建两个 Schedule**，分别配置不同的触发变量
4. ✅ **可以并行运行**，互不影响
5. ✅ **通过 Pipeline 日志可以清楚区分**两个任务

