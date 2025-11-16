#!/bin/bash

# 🚀 启动平台自动结算 Cron 调度器

echo "🚀 启动平台自动结算 Cron 调度器..."
echo ""

# 检查环境变量
if [ -z "$PLATFORM_WALLET_PRIVATE_KEY" ]; then
  echo "❌ 错误: PLATFORM_WALLET_PRIVATE_KEY 未配置"
  echo ""
  echo "请在 .env.local 中配置 PLATFORM_WALLET_PRIVATE_KEY:"
  echo ""
  echo "  PLATFORM_WALLET_PRIVATE_KEY=your_private_key_here"
  echo ""
  exit 1
fi

echo "✅ 环境变量检查通过"
echo ""

# 检查是否安装了 PM2
if ! command -v pm2 &> /dev/null; then
  echo "⚠️  PM2 未安装"
  echo "正在安装 PM2..."
  npm install -g pm2
  echo ""
fi

# 检查是否已运行
if pm2 list | grep -q "lumi-cron"; then
  echo "⚠️  Cron 调度器已在运行"
  echo ""
  read -p "是否重启? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 重启 Cron 调度器..."
    pm2 restart lumi-cron
  else
    echo "✅ 保持运行状态"
    pm2 status
    exit 0
  fi
else
  # 启动 Cron 调度器
  echo "🚀 启动 Cron 调度器..."
  pm2 start scripts/cron-scheduler.ts --name "lumi-cron" --interpreter ts-node
  
  # 保存 PM2 配置
  pm2 save
  
  echo ""
  echo "✅ Cron 调度器已启动"
  echo ""
fi

# 显示状态
echo "📊 当前状态:"
pm2 status

echo ""
echo "📝 常用命令:"
echo "  查看日志: pm2 logs lumi-cron"
echo "  查看实时日志: pm2 logs lumi-cron --lines 50"
echo "  重启: pm2 restart lumi-cron"
echo "  停止: pm2 stop lumi-cron"
echo "  查看详情: pm2 describe lumi-cron"
echo ""

echo "🎉 平台自动结算已启用！"
echo "   - 批量结算任务将每 5 分钟运行一次"
echo "   - 用户订单将自动批量结算"
echo "   - 平台代付 Gas，用户无需支付"
echo ""

