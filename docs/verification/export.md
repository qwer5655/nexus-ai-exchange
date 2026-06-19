# P1-Export — 数据导出接口验证

## Endpoint
GET /api/analytics/export?type={type}&since={iso_date}

## Auth Required
No

## 参数
| 参数 | 必填 | 说明 |
|------|------|------|
| type | ✅ | users / deposits / unlocks / audit |
| since | ❌ | ISO 日期，默认 30 天前 |

## 预期响应
CSV 文件下载（Content-Type: text/csv）

## 依赖
- profiles / deposits / unlocks / admin_logs 表

## 测试
`ash
node --experimental-strip-types tests/analytics/export.test.ts
`

## 状态
❌ 代码存在，未经验证
