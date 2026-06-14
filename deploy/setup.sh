# NEXUS AI EXCHANGE — 一键部署脚本
# 用法：在服务器上运行
# bash deploy/setup.sh

set -e

echo "===== NEXUS AI EXCHANGE 部署脚本 ====="
echo ""

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update -y && apt upgrade -y

# 2. 安装 Node.js 22
echo "[2/8] 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 3. 安装 PM2
echo "[3/8] 安装 PM2..."
npm install -g pm2

# 4. 安装 Nginx
echo "[4/8] 安装 Nginx..."
apt install -y nginx

# 5. 复制代码（假设代码已在 /root/nexus 或通过 SFTP 上传后执行）
echo "[5/8] 安装依赖..."
cd /root/nexus
npm install

# 6. 构建
echo "[6/8] 构建项目..."
npm run build

# 7. 启动
echo "[7/8] 启动服务..."
pm2 delete nexus 2>/dev/null || true
pm2 start npm --name "nexus" -- start -- --port 3000
pm2 save
pm2 startup

# 8. 配置防火墙
echo "[8/8] 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "===== 部署完成 ====="
echo "下一步：配置 Nginx 反向代理"
echo "bash deploy/nginx.sh"
