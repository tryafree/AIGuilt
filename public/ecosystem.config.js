module.exports = {
    apps: [{
      name: "aiguilt-app",
      script: "./server.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log"
    }]
  };