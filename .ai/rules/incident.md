# Incident Response Rules

## Severity Levels

| Level | Definition | Response Time | Example |
|---|---|---|---|
| SEV1 | Service down, all users affected | Immediate | Site unreachable, data loss |
| SEV2 | Major feature broken, workaround exists | < 1 hour | Auth broken, payments failing |
| SEV3 | Minor feature broken, low impact | < 4 hours | UI bug, non-critical error |
| SEV4 | Cosmetic or edge case | Next business day | Typo, minor style issue |

## Response Checklist

1. **Assess**: What's broken? Who's affected? What severity?
2. **Communicate**: Notify client/stakeholders immediately (SEV1/2)
3. **Mitigate**: Can we rollback? Feature flag? Maintenance page?
4. **Fix**: Root cause fix or temporary patch
5. **Verify**: Confirm fix in production. Monitor for recurrence.
6. **Document**: Post-mortem within 24 hours (SEV1/2)

## Communication Templates

**Initial (SEV1/2)**:
> We're aware of [issue description]. We're investigating and will update within [30 min / 1 hour]. Current impact: [who is affected and how].

**Update**:
> Update on [issue]: [what we found]. [What we're doing]. Next update in [timeframe].

**Resolved**:
> [Issue] has been resolved as of [time]. Root cause: [brief]. We'll share a full post-mortem by [date].

## Post-Mortem Template

```
# Post-Mortem: [Title]
Date: [YYYY-MM-DD]
Severity: [SEV1-4]
Duration: [start - end]

## Summary
[1-2 sentences]

## Timeline
[Chronological events with timestamps]

## Root Cause
[What actually broke and why]

## Impact
[Users affected, duration, data impact]

## Resolution
[What fixed it]

## Action Items
- [ ] [Preventive measure] — Owner: [name] — Due: [date]
```

## Rollback Checklist

- [ ] Previous Docker image tag identified
- [ ] Database migration reversible? (check before rolling back app)
- [ ] Redeploy previous tag via Coolify/Docker
- [ ] Verify rollback successful: health check + manual test
- [ ] Communicate resolution to stakeholders
