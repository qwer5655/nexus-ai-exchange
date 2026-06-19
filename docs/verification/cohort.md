# P1-Cohort — 同期群分析接口验证

## Endpoint
GET /api/analytics/cohort

## Auth Required
Yes — admin role. Header: x-admin-email

## 功能
返回过去 12 周的同期群数据，包括注册量和后续每周活跃度。

## 预期响应
`json
{
  "cohorts": [
    {
      "week": "2026-05-01",
      "registered": 10,
      "w0": 5,
      "w1": 3,
      ...
    }
  ]
}
`

## 依赖
- analytics_events 表（需存在）
- profiles 表

## 测试
`ash
node --experimental-strip-types tests/analytics/cohort.test.ts
`

## 状态
❌ 代码存在，未经验证
