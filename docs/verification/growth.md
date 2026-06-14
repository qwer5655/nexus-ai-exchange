# P1-Growth — 增长分析接口验证

## Endpoint
GET /api/analytics/growth?days={n}

## Auth Required
Yes — admin role. Header: x-admin-email

## 参数
| 参数 | 必填 | 说明 |
|------|------|------|
| days | ❌ | 回溯天数，默认 90 |

## 预期响应
`json
{
  "daily_registrations": [{ "date": "2026-05-01", "count": 3 }],
  "total_registrations": 150,
  "acquisition_sources": [{ "source": "direct", "count": 80 }]
}
`

## 依赖
- profiles 表
- analytics_events 表（utm_source 字段）

## 测试
`ash
node --experimental-strip-types tests/analytics/growth.test.ts
`

## 状态
❌ 代码存在，未经验证
