# P1-Event — 事件分析接口验证

## Endpoint
POST /api/analytics/event

## Auth Required
No

## 功能
记录用户事件到 analytics_events 表。

## 请求体
`json
{
  "userId": "uuid-or-null",
  "eventName": "page_view",
  "eventData": { "page": "/home" }
}
`

## 预期响应
`json
{ "success": true }
`

## 依赖
- analytics_events 表

## 测试
`ash
node --experimental-strip-types tests/analytics/event.test.ts
`

## 状态
❌ 代码存在，未经验证
