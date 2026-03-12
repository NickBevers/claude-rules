---
name: analytics-reporter
description: Set up analytics, create dashboards, and generate performance reports. Triggers on "analytics", "tracking", "dashboard", "metrics", "reporting", "KPIs", "track events".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# Analytics Reporter — Tracking & Reporting

Set up privacy-respecting analytics, define KPIs, and generate actionable reports.

## Step 1: Determine Needs

What to track (page views, journeys, conversions, errors, performance), privacy requirements (GDPR, cookie-free), tool preference, existing tracking.

## Step 2: Analytics Tool Selection

**Privacy-First** (no cookie banner): Plausible ($9/mo or self-host), Umami (free self-host), Fathom ($14/mo).

**Full Product Analytics**: PostHog (feature flags, funnels, replays), Mixpanel (event-based).

**Performance**: Vercel Analytics (Web Vitals), Sentry (errors + performance).

Recommendation: Plausible/Umami for marketing sites, PostHog for SaaS.

## Step 3: Implementation

**Event Taxonomy**: Consistent naming — `Category:Action:Label` (e.g., `page:view:{path}`, `cta:click:{button}`, `form:submit:{name}`).

**Privacy**: Load with `defer`, respect Do Not Track, no tracking before consent (if cookies), anonymize IP, no PII in events.

**For Astro**: Script in BaseHead, production-only via `import.meta.env.PROD`.

## Step 4: KPI Dashboard Design

**Marketing Site**: Unique visitors, top pages, referrals, CTA click-through, form submissions, bounce rate.

**SaaS**: Signup conversion, activation rate, DAU/MAU, feature adoption, churn indicators, error rates.

**Report Template**: Key metrics table (this period vs. previous + change %), top insights with actions, anomalies, data-driven recommendations.

## Rules

- Privacy-first: prefer cookieless analytics
- No tracking without user awareness. No PII in event data.
- Production-only: never track in dev/staging
- Real metrics only — never fake data in reports
