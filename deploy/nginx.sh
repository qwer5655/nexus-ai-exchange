# Nginx 配置脚本
# 运行前先设置你的域名
# bash deploy/nginx.sh your-domain.com

DOMAIN=
if [ -z "" ]; then
  echo "用法: bash deploy/nginx.sh 你的域名.com"
  exit 1
fi

cat > /etc/nginx/sites-available/nexus << 'NGINX'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP ;
        proxy_set_header X-Forwarded-For ;
        proxy_set_header X-Forwarded-Proto ;
        proxy_cache_bypass ;
    }

    location /_next/static {
        alias /root/nexus/.next/static;
        expires 365d;
        access_log off;
    }

    location /public {
        alias /root/nexus/public;
        expires 30d;
        access_log off;
    }
}
NGINX

sed -i "s/DOMAIN_PLACEHOLDER//g" /etc/nginx/sites-available/nexus

ln -sf /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx

echo "Nginx 配置完成！域名: "
echo "下一步：配置 SSL（可选）："
echo "apt install -y certbot python3-certbot-nginx"
echo "certbot --nginx -d  -d www."
