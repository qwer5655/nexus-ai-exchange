# NEXUS AI EXCHANGE — 完整部署指南

## 一、购买服务器

推荐：Hetzner（德国，稳定便宜）

### 步骤：
1. 打开 https://www.hetzner.com/cloud
2. 注册账号（邮箱 + 密码，地址随便填）
3. 添加支付方式（PayPal / 信用卡）
4. 创建项目 → 点击 "Add Server"
5. 选择配置：

| 配置 | 选择 | 价格 |
|---|---|---|
| 型号 | CX22 | €3.99/月 |
| CPU | 2 核 | — |
| 内存 | 4 GB | ✅ 足够 |
| 硬盘 | 40 GB NVMe | ✅ 足够 |
| 系统 | Ubuntu 22.04 | 推荐 |
| 区域 | 德国 Nuremberg | 亚洲速度尚可 |

6. 创建后得到：服务器 IP 地址 + root 密码

## 二、购买域名

推荐：Cloudflare Registrar（成本价不赚差价）

1. 打开 https://cloudflare.com → 注册
2. 左侧菜单 → Domain Registration → Register Domains
3. 搜索域名（例如: nexusai.trade / worldcup-ai.com）
4. 付款（.com 约 .15/年 ≈ ¥65）

## 三、Cloudflare DNS 解析

在 Cloudflare → DNS → Records 添加：

A记录 @ → 你的服务器IP（开启代理橙色云）
A记录 www → 你的服务器IP（开启代理橙色云）

## 四、登录服务器

> 打开电脑终端（Mac终端 / Windows PowerShell）

ssh root@你的服务器IP
（输入密码）

## 五、装宝塔面板（aaPanel国际版）

wget -O install.sh http://www.aapanel.com/script/install-ubuntu.sh && bash install.sh

装完后会显示面板地址和账号密码，保存好。

浏览器打开：http://你的IP:7800/xxxxx

## 六、宝塔内配置

### 1. 安装环境
登录宝塔 → 弹窗选 LNMP → 只保留 Nginx → 去掉 MySQL 和 PHP → 点安装

### 2. 安装 PM2
左侧 软件商店 → 搜索 PM2 → 安装

### 3. 上传代码
左侧 文件 → 进入 /www/wwwroot/ → 新建文件夹（名字填你的域名）→ 上传源码

### 4. 安装依赖 + 构建
软件商店 → PM2 管理器 → 添加项目：
- 选择项目目录
- 启动命令填：
  cd /www/wwwroot/你的域名 && npm install && npm run build && npm start -- --port 3000
- 勾选开机启动

### 5. 添加网站
左侧 网站 → 添加站点 → 域名填你的域名 → 去掉FTP和数据库 → 提交

### 6. 反向代理
网站列表 → 点你的域名 → 反向代理 → 添加：
- 目标URL: http://127.0.0.1:3000

### 7. 环境变量
在项目目录新建 .env.local，内容：

NEXT_PUBLIC_SUPABASE_URL=https://dcfwldxwyvvotvfdnywy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
NEXT_PUBLIC_APP_URL=https://你的域名.com
NEXT_PUBLIC_SITE_NAME=NEXUS AI Exchange

### 8. SSL 证书
网站 → SSL → Let's Encrypt → 申请 → 勾选强制HTTPS

## 七、验证

浏览器打开 https://你的域名.com → 看到首页

curl https://你的域名.com/api/health → 返回 { "status": "ok", ... }

## 八、数据库迁移

打开 Supabase Dashboard → SQL Editor → 依次执行：
1. supabase/migrations/001_schema.sql
2. supabase/migrations/002_production_security.sql
3. supabase/migrations/003_analytics.sql
4. supabase/migrations/004_growth.sql

## 九、费用

| 项目 | 费用 |
|---|---|
| Hetzner CX22 服务器 | €3.99/月 ≈ ¥32 |
| 域名 .com | .15/年 ≈ ¥65 |
| Supabase 数据库 | 免费 |
| 合计 | ≈ ¥37/月 |

## 十、你需要做的事

1. 花 5 分钟去 hetzner.com 注册买服务器 → 拿到 IP 和密码
2. 花 5 分钟去 cloudflare.com 注册买域名
3. 把服务器 IP 和域名发给我 → 我帮你搞定剩下的全部配置

## 我能帮你做的事

- 生成完整的 Nginx 配置文件
- 生成 PM2 启动配置
- 生成一键部署脚本
- 写爬虫脚本（自动抓取赔率数据）
- 配置定时任务（自动更新机会数据）
