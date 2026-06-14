module.exports = {
  apps: [{
    name: 'nexus',
    script: 'node_modules/next/dist/bin/next',
    args: 'start --port 3000',
    cwd: '/root/nexus',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
