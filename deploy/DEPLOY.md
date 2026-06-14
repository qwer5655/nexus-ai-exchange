# NEXUS AI Exchange — 服务器部署文档

## 服务器信息
- IP: 149.28.23.92
- 地区: 东京
- 系统: Ubuntu 22.04
- Node.js: v22.22.3
- 项目路径: /root/nexus

## 当前状态

| 组件 | 状态 | 端口 |
|---|---|---|
| Next.js (PM2) | ✅ 运行中 | 3000 |
| PM2 进程 | ✅ 运行中 | — |
| Node.js | ✅ 已安装 | — |
| Nginx | ❌ 未安装 | — |
| SSL | ❌ 未配置 | — |
| 外部访问 | ❌ 端口未开放 | 80/443 |

## 本地测试：SSH 连接服务器

打开 PowerShell，执行：
`powershell
ssh root@149.28.23.92
`

## 步骤一：修复外部访问

进入服务器后执行：
`ash
# 关闭 ufw 防火墙（先放行所有流量测试）
ufw disable

# 或者保留 ufw 但放行端口
ufw allow 80/tcp
ufw allow 3000/tcp
ufw reload
`

然后在本地 PowerShell 执行测试：
`powershell
curl.exe -s http://149.28.23.92/ -o NUL -w "%{http_code}"
`
如果返回 200，说明问题就是防火墙。

浏览器访问 http://149.28.23.92:3000 确认能打开。

## 步骤二：安装 Nginx（可选）

进入服务器：
`ash
# 先修复 apt
rm -f /etc/apt/sources.list.d/nodesource.list
apt update

# 安装 Nginx
apt install -y nginx

# 配置反向代理
cat > /etc/nginx/sites-available/nexus << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
    }

    location /_next/static {
        alias /root/nexus/.next/static;
        expires 365d;
    }
}
EOF

ln -sf /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
`

## 步骤三：配置域名和 SSL

1. 在 Cloudflare 添加 A 记录指向 149.28.23.92
2. 购买域名后执行：
`ash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名.com -d www.你的域名.com
`

## 步骤四：PM2 自启动（已配置）

验证自启动：
`ash
pm2 startup
pm2 save
`

## 常用命令

| 命令 | 作用 |
|---|---|
| pm2 status | 查看进程状态 |
| pm2 logs nexus | 查看日志 |
| pm2 restart nexus | 重启服务 |
| pm2 stop nexus | 停止服务 |
| ssh root@149.28.23.92 | SSH 登录 |
| cd /root/nexus | 项目目录 |
| 
pm run build | 重新构建 |

## 当前 PM2 状态

`ash
pm2 status
`
应显示 nexus 进程为 online 状态。

## 验证部署

`ash
curl -s http://localhost:3000/api/health
`
应返回 JSON 格式的健康检查结果。
