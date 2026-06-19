# P1-Retention — 留存分析接口验证

## Endpoint
GET /api/analytics/retention

## Auth Required
Yes — admin role. Header: x-admin-email

## 功能
计算 D1 / D7 / D30 留存率

## 预期响应
`json
{
  "retention": [
    { "period": "D1", "cohort_size": 50, "retained": 10, "rate": 20 },
    { "period": "D7", "cohort_size": 50, "retained": 5, "rate": 10 },
    { "period": "D30", "cohort_size": 50, "retained": 2, "rate": 4 }
  ]
}
`

## 依赖
- profiles 表
- analytics_events 表

## 测试
`ash
node --experimental-strip-types tests/analytics/retention.test.ts
`

## 状态
❌ 代码存在，未经验证
