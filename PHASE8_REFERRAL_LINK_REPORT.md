# PHASE8 — REFERRAL LINK AUDIT REPORT

## 问题

用户点击"复制链接"后复制出的邀请链接返回 404。

## 原始链接

| 来源 | 文件 | 原始链接 |
|------|------|----------|
| 推广页 (Referral) | src/app/(main)/referral/page.tsx:16 | https://arbitrage.ai/ref/CODE |
| 个人页 (Profile) | src/app/(main)/profile/page.tsx:43 | window.location.origin + '/register?ref=CODE' |
| AuthStore | src/store/authStore.ts:158 | https://arbitrage.ai/ref/CODE |

## 实际路由

| 路由 | 存在？ |
|------|--------|
| /register | ? 不存在 — 项目使用弹窗注册（无独立注册页） |
| /register?ref=... | ? 404 |
| https://arbitrage.ai/ref/... | ? 外部域名，项目无法控制 |
| https://proodd.com/register?ref=... | ? 外部域名 |
| / (主页) | ? 存在 — 带有 AuthModalManager |
| /?ref=CODE | ? 存在 |

## 修改内容

### 1. 推广页 (referral/page.tsx)
**修改:** 'https://arbitrage.ai/ref/' + (d.referral_code || '')
**改为:** window.location.origin + '/?ref=' + (d.referral_code || '')
**注意:** 在 useEffect 内执行，无 SSR 问题

### 2. 个人页 (profile/page.tsx)
**修改:** efData?.referral_code ? window.location.origin + '/register?ref=' + refData.referral_code : 'https://proodd.com/register?ref=' + ...
**改为:** window.location.origin + '/?ref=' + (refData?.referral_code || (user as any)?.id?.substring(0,8) || '')
**注意:** 添加了 	ypeof window !== 'undefined' SSR 保护

### 3. AuthStore (authStore.ts)
**修改:** 'https://arbitrage.ai/ref/' + (u.referralCode || 'NEXUSDEFAULT')
**改为:** (typeof window !== 'undefined' ? window.location.origin : '') + '/?ref=' + (u.referralCode || 'NEXUSDEFAULT')
**注意:** 添加了 	ypeof window !== 'undefined' SSR 保护

### 4. 主页 (page.tsx)
**新增:** 检测 ?ref=CODE 查询参数，自动打开注册弹窗
`	s
// 存储邀请码
if (refCode) localStorage.setItem('nexus_referral', refCode)
// 页面就绪后自动打开注册弹窗
if (refCode) useAuthStore.getState().openAuthModal('register')
`

## 是否解决 404

### 是。邀请链接的工作流程现在为：

1. 用户复制链接: http://localhost:3000/?ref=NXCODE
2. 受邀用户访问该链接
3. 主页加载 → 检测到 ?ref=NXCODE 参数
4. 自动打开注册弹窗
5. 注册弹窗已预填邀请码（存储在 localStorage）

### 构建验证

- ? 
pm run build — 100% 通过（135 静态页面）
- ? 无 type error
- ? 无语法错误
- ? 无 SSR 兼容性问题

## 修改文件列表

| # | 文件 | 修改类型 |
|---|------|----------|
| 1 | src/app/page.tsx | 添加 ref 参数检测 + 自动打开注册弹窗 |
| 2 | src/app/(main)/referral/page.tsx | 修复邀请链接 URL |
| 3 | src/app/(main)/profile/page.tsx | 修复邀请链接 URL + SSR guard |
| 4 | src/store/authStore.ts | 修复邀请链接 URL + SSR guard |
