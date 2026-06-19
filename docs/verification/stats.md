# P1-Stats — 统计模块接口验证

## Endpoint
GET /api/analytics/stats?days={n}

## Auth Required
No

## 参数
| 参数 | 必填 | 说明 |
|------|------|------|
| days | ❌ | 回溯天数，默认 30 |

## 预期响应
`json
{
  "registrations": { "today": 5, "yesterday": 3, "week": { ... } },
  "deposits": { "total": 20, "approved": 15, "total_amount": 4000 },
  "unlocks": { "total": 10, "total_revenue": 500 },
  "referrals": { "total": 8 },
  "events_count": 200
}
`

## 依赖
- profiles / deposits / unlocks / referrals / analytics_events 表

## 测试
`ash
node --experimental-strip-types tests/analytics/stats.test.ts
`

## 状态
❌ 代码存在，未经验证
