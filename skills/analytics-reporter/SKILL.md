---
name: analytics-reporter
description: Set up analytics, create dashboards, and generate performance reports. Triggers on "analytics", "tracking", "dashboard", "metrics", "reporting", "KPIs", "track events".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# Analytics Reporter — Tracking & Reporting

Set up privacy-respecting analytics, define KPIs, and generate actionable reports.

## Step 1: Determine Needs

- What to track: page views, user journeys, conversions, errors, performance?
- Privacy requirements: GDPR compliance needed? Cookie-free preferred?
- Tool preference: Plausible, Umami, PostHog, Vercel Analytics, or Google Analytics?
- Existing tracking (if any)?

## Step 2: Analytics Tool Selection

### Privacy-First (no cookie banner needed)
| Tool | Best For | Pricing |
|---|---|---|
| **Plausible** | Simple traffic analytics | $9/mo or self-host |
| **Umami** | Self-hosted, lightweight | Free (self-host) |
| **Fathom** | Simple, GDPR compliant | $14/mo |

### Full Product Analytics
| Tool | Best For | Pricing |
|---|---|---|
| **PostHog** | Feature flags, funnels, replays | Free tier, self-host |
| **Mixpanel** | Event-based analytics | Free tier |

### Performance Monitoring
| Tool | Best For | Pricing |
|---|---|---|
| **Vercel Analytics** | Web Vitals (Vercel deploys) | Free tier |
| **Sentry** | Error tracking, performance | Free tier |

Recommendation: **Plausible or Umami** for marketing sites, **PostHog** for SaaS products.

## Step 3: Implementation

### Event Taxonomy
Define a consistent naming convention:
```
Category:Action:Label
page:view:{path}
cta:click:{button_name}
form:submit:{form_name}
form:error:{form_name}:{field}
signup:complete:{plan}
feature:use:{feature_name}
```

### Privacy Implementation
- Load analytics script with `defer` (not blocking)
- Respect `Do Not Track` header
- No tracking before cookie consent (if using cookies)
- Anonymize IP where possible
- No PII in event properties (no emails, names, IDs)

### For Astro Projects
```astro
<!-- BaseHead.astro -->
{import.meta.env.PROD && (
  <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js" />
)}
```

### Custom Event Tracking (Preact islands)
```tsx
// Track only in production, fail silently
function track(event: string, props?: Record<string, string>) {
  if (typeof window !== 'undefined' && 'plausible' in window) {
    (window as any).plausible(event, { props });
  }
}
```

## Step 4: KPI Dashboard Design

### Marketing Site KPIs
- Unique visitors (daily/weekly/monthly)
- Top pages by views
- Referral sources
- CTA click-through rate
- Contact form submissions
- Bounce rate by landing page

### SaaS KPIs
- Signup conversion rate
- Activation rate (first meaningful action)
- Daily/Monthly Active Users
- Feature adoption rates
- Churn indicators (decreased usage)
- Error rates by page/feature

### Report Template
```
# Analytics Report — [Period]

## Key Metrics
| Metric | This Period | Previous | Change |
|---|---|---|---|
| [metric] | [value] | [value] | [+/-X%] |

## Top Insights
1. [Insight + recommended action]
2. [Insight + recommended action]
3. [Insight + recommended action]

## Anomalies
- [Any unusual patterns worth investigating]

## Recommendations
- [Data-driven suggestion]
```

## Rules

- Privacy-first: prefer cookieless analytics
- No tracking without user's awareness
- No PII in event data
- Production-only: never track in dev/staging
- Real metrics only — never fake data in reports
- No icons or decorative elements
