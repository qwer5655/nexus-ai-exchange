# DJANGO_DELETION_CHECKLIST

## 前置条件
☐ 备份 arbitrage/ 目录
☐ 确认生产服务器 SSH 可连接

## 步骤 1: 停止 Django 服务
☐ sudo systemctl stop nexus-gunicorn
☐ sudo systemctl disable nexus-gunicorn
☐ 确认端口 8000 无进程

## 步骤 2: 删除 Django 文件
☐ rm -rf /opt/nexus-ai/backend/arbitrage/
☐ rm /opt/nexus-ai/backend/manage.py
☐ rm /opt/nexus-ai/backend/requirements.txt
☐ rm /opt/nexus-ai/venv/bin/gunicorn (如果存在)

## 步骤 3: 更新 systemd
☐ rm /etc/systemd/system/nexus-gunicorn.service
☐ sudo systemctl daemon-reload

## 步骤 4: 更新 Nginx
☐ 编辑 nginx/nexus-ai.conf
☐ 移除 Django proxy_pass 块 (/api/ 和 /admin/ 的 8000 代理)
☐ sudo nginx -t
☐ sudo systemctl reload nginx

## 步骤 5: 更新部署脚本
☐ deploy/deploy.sh: 移除 Django 部署步骤
☐ deploy/deploy-production.md: 移除 Django 相关文档
☐ deploy/scripts/backup.sh: 移除 Django 备份步骤
☐ deploy/scripts/rollback.sh: 移除 Django 回滚步骤
☐ deploy/scripts/update.sh: 移除 Django 更新步骤

## 步骤 6: 验证
☐ curl localhost:3000 (Next.js)
☐ npm run build (通过)
☐ 所有 Admin 页面正常
☐ 用户登录/注册正常
☐ 充值/钱包正常

## 回滚方案
如遇问题，恢复 nexus-gunicorn.service 并重新安装 Django 依赖即可。
