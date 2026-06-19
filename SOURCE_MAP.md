# 套利源码 - 前端/后端标注

> NEXUS AI EXCHANGE — 基于 Next.js 15 + Supabase 的全栈 FIFA 套利交易平台
> 架构: 纯 Next.js (Django 已于 2026-06-14 移除)

---

## 目录结构

| 路径 | 类型 | 说明 |
|------|:----:|------|
| src/app/page.tsx | 前端 | 首页 (Landing Page) |
| src/app/layout.tsx | 前端 | 根布局 |
| src/app/globals.css | 前端 | 全局样式 |
| src/app/(landing)/ | 前端 | 着陆页面布局 |
| src/app/(main)/ | 前端 | 主应用布局 + 页面 |
| src/app/(main)/dashboard/ | 前端 | 仪表盘 |
| src/app/(main)/vip/ | 前端 | VIP 中心 |
| src/app/(main)/deposit/ | 前端 | 充值中心 |
| src/app/(main)/withdraw/ | 前端 | **新增** 提现页面 |
| src/app/(main)/my-opportunities/ | 前端 | 我的机会 |
| src/app/(main)/opportunities/ | 前端 | 套利机会列表 |
| src/app/(main)/profile/ | 前端 | 个人中心 |
| src/app/(main)/referral/ | 前端 | 邀请返佣 |
| src/app/(main)/ai-center/ | 前端 | AI 中心 |
| src/app/(main)/news/ | 前端 | 新闻 |
| src/app/(main)/leaderboard/ | 前端 | 排行榜 |
| src/app/(main)/matches/ | 前端 | 比赛日程 |
| src/app/(main)/setup/ | 前端 | 设置引导页 |
| src/app/(main)/support/ | 前端 | 客服支持 |
| src/app/(main)/opportunity/[id]/ | 前端 | 机会详情页 |

---

## Admin 后台

| 路径 | 类型 | 说明 |
|------|:----:|------|
| src/app/admin/ | 前端 | Admin 主布局 |
| src/app/admin/page.tsx | 前端 | Admin 首页面板 |
| src/app/admin/users/ | 前端 | 用户管理 |
| src/app/admin/users/vip/ | 前端 | VIP 管理 |
| src/app/admin/users/login-logs/ | 前端 | 登录日志 |
| src/app/admin/deposits/ | 前端 | 充值审核 |
| src/app/admin/withdrawals/ | 前端 | 提现审核 |
| src/app/admin/finance/ | 前端 | 财务管理 (balance-flow, manual-topup, revenue) |
| src/app/admin/analytics/ | 前端 | 数据分析 |
| src/app/admin/operations/ | 前端 | 运营管理 (announcements, banners, tickets) |
| src/app/admin/payment/ | 前端 | 支付管理 (wallets, recharges) |
| src/app/admin/promotion/ | 前端 | 推广管理 (commissions, referrals, invitations) |
| src/app/admin/opportunities/ | 前端 | 机会管理 |
| src/app/admin/orders/ | 前端 | 订单管理 |
| src/app/admin/risk/ | 前端 | 风控管理 |
| src/app/admin/billing/ | 前端 | 计费管理 |
| src/app/admin/settings/ | 前端 | 站点设置 |
| src/app/admin/enterprise/ | 前端 | 企业管理 |
| src/app/admin/automation/ | 前端 | 自动化规则 |
| src/app/admin/notifications/ | 前端 | 通知管理 |
| src/app/admin/system/ | 前端 | 系统管理 |

---

## API 后端 (Next.js API Routes)

| 路径 | 类型 | 说明 |
|------|:----:|------|
| src/app/api/auth/ | 后端 | 认证 (login, register, rpc-login, me, login-logs) |
| src/app/api/withdrawals/ | 后端 | **新增** 用户提现 (POST 创建, GET 查询) |
| src/app/api/deposits/ | 后端 | 充值 |
| src/app/api/opportunities/ | 后端 | 机会数据 |
| src/app/api/referrals/ | 后端 | 邀请返佣 |
| src/app/api/notifications/ | 后端 | 通知 |
| src/app/api/unlocks/ | 后端 | 机会解锁 |
| src/app/api/billing/ | 后端 | 计费 (pricing, subscribe, webhook, credits) |
| src/app/api/public/ | 后端 | 公开API (wallets, news, leaderboard, matches, players) |
| src/app/api/admin/ | 后端 | Admin API (users, deposits, withdrawals, stats, etc.) |
| src/app/api/setup/ | 后端 | 系统安装/迁移 |

---

## 核心代码

| 路径 | 类型 | 说明 |
|------|:----:|------|
| src/components/ | 前端 | React 组件 (auth, charts, dashboard, layout, ui 等) |
| src/store/authStore.ts | 前端 | Zustand 用户状态管理 |
| src/store/useStore.ts | 前端 | Zustand 全局状态 (语言等) |
| src/lib/supabase.ts | 后端 | Supabase 客户端 (anon + service_role) |
| src/lib/admin-auth.ts | 后端 | Admin 认证中间件 |
| src/lib/i18n.ts | 前端 | 国际化 |
| src/lib/admin-fetch.ts | 后端 | Admin API fetch 封装 |
| src/services/ | 后端 | 数据服务层 (auth, deposit, unlock, notification 等) |
| src/types/ | 共享 | TypeScript 类型定义 |
| src/middleware.ts | 后端 | Next.js 中间件 (限流 + VIP 检查) |

---

## 数据库

| 路径 | 类型 | 说明 |
|------|:----:|------|
| supabase/migrations/ | 数据库 | 核心表 SQL 迁移 (001-006) |
| supabase/sql/ | 数据库 | 扩展功能 SQL (007-021, 900) |
| .env | 配置 | Supabase 连接参数 (service_role key, anon key) |

---

## 部署相关

| 路径 | 说明 |
|------|------|
| deploy/ | VPS部署脚本 (nginx, systemd) |
| 
ginx/ | Nginx 配置 |
| systemd/ | systemd 服务文件 |
| outputs/ | 测试报告输出 |

---

## 技术栈

- **前端框架**: Next.js 15 (React 19)
- **状态管理**: Zustand
- **样式**: Tailwind CSS / PostCSS
- **动画**: Framer Motion
- **图表**: ECharts
- **图标**: Lucide React
- **数据库**: Supabase PostgreSQL (含 RLS)
- **认证**: Supabase Auth (GoTrue)
- **ORM**: Supabase JS Client (RESTful)
- **测试**: Playwright 1.60
