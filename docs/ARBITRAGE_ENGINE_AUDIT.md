# Arbitrage Engine Authenticity Audit — CRITICAL FINDING

## Sources of Arbitrage Opportunities

| Source | Real? | Evidence |
|---|---|---|
| Database seeds (001_schema.sql) | NO — hardcoded | 5 opportunities INSERTed with fixed ROI, profit, confidence |
| API (/api/opportunities) | FAKE | Reads hardcoded DB records, no calculation |
| API (/api/public/matches) | FAKE | Generates `Math.floor(Math.random()*4)` scores |
| Admin opportunity creation | MANUAL | Admin can CRUD — no automatic scanning |
| data/opportunities.ts | N/A | File does not exist |

## Assessment

### The arbitrage engine does NOT exist.

The 5 "opportunities" shown to users are **static seed data** inserted by `001_schema.sql`:

```sql
INSERT INTO opportunities (...) VALUES
('Canada vs Costa Rica', roi=8.24, profit=835, confidence=76),
('Tunisia vs Algeria', roi=7.53, profit=775, confidence=74),
... (5 total, all hardcoded)
```

There is:
- No real-time odds scanner
- No market data API integration
- No arbitrage calculation algorithm
- No automated opportunity generation
- No scheduled task or cron job

### Matches API generates COMPLETELY FAKE scores

In `src/app/api/public/matches/route.ts`:
```typescript
score = Math.floor(Math.random()*4)+'-'+Math.floor(Math.random()*4);
```

### What does exist for "arbitrage"
- `src/data/matches.ts` — old static match schedule (unused by API)
- Admin can manually create/edit opportunities via admin panel
- Unlock system that charges users to view opportunity details
- Activity feed records "User unlocked an opportunity"

### Risk Implications
1. **Fraud risk**: Users pay real money (via deposits) to unlock opportunities that are fake
2. **Regulatory risk**: Presenting static data as "AI-detected arbitrage" is deceptive
3. **Business continuity risk**: If users discover the "arbitrage" is fake, platform collapses
