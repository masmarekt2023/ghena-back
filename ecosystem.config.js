module.exports = {
    apps: [{
      name: "mas-backend",
      script: "./index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }]
  }