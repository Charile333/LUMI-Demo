// PM2 配置文件
// 用于管理 Cron 调度器和后台任务

module.exports = {
  apps: [
    {
      name: 'lumi-cron',
      script: 'node',
      args: 'node_modules/ts-node/dist/bin.js scripts/cron-scheduler.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 合并日志
      merge_logs: true,
      // 日志轮转
      log_type: 'json'
    }
  ]
};

