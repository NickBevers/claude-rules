---
name: pagespeed-audit
description: Run PageSpeed Insights and Lighthouse audits to measure Core Web Vitals, accessibility, SEO, and best practices. Triggers on "pagespeed", "lighthouse", "core web vitals", "page speed", "performance score", "lighthouse audit", "psi check".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# PageSpeed Audit — Automated Performance Validation

| Method | When | Result |
|---|---|---|
| **PSI API** | Deployed/public site | Field data (CrUX) + Lab data |
| **Lighthouse CLI** | Local dev server or CI | Lab data (synthetic) |
| **Unlighthouse** | Bulk audit many pages | Lighthouse across entire site |

## Step 1: PageSpeed Insights API

```bash
# Mobile (stricter — test first)
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&category=performance&category=accessibility&category=seo&category=best-practices&strategy=mobile" > /tmp/psi-mobile.json

# Desktop
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&strategy=desktop&category=performance&category=accessibility&category=seo&category=best-practices" > /tmp/psi-desktop.json
```

No API key needed for occasional use. For automated checks: free key from console.developers.google.com (25k queries/day).

### Parse Results

```bash
cat /tmp/psi-mobile.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
cats = d.get('lighthouseResult', {}).get('categories', {})
for name, cat in cats.items():
    print(f'{name}: {cat.get(\"score\", 0) * 100:.0f}/100')
print('\n--- Core Web Vitals (Field) ---')
for key, val in d.get('loadingExperience', {}).get('metrics', {}).items():
    print(f'{key}: p75={val.get(\"percentile\", \"N/A\")} [{val.get(\"category\", \"NONE\")}]')
print('\n--- Lab Metrics ---')
audits = d.get('lighthouseResult', {}).get('audits', {})
for a in ['largest-contentful-paint','cumulative-layout-shift','total-blocking-time','first-contentful-paint','speed-index','interactive']:
    au = audits.get(a, {})
    if au: print(f'{a}: {au.get(\"displayValue\", \"N/A\")} [score: {au.get(\"score\", 0):.2f}]')
"
```

### CWV Thresholds

| Metric | Good | Needs Work | Poor |
|---|---|---|---|
| LCP | ≤2500ms | ≤4000ms | >4000ms |
| INP | ≤200ms | ≤500ms | >500ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |
| FCP | ≤1800ms | ≤3000ms | >3000ms |
| TTFB | ≤800ms | ≤1800ms | >1800ms |

Field data may show `NONE` for low-traffic sites — fall back to lab data.

## Step 2: Lighthouse CLI

```bash
npx lighthouse http://localhost:4321 \
  --output=json --output-path=/tmp/lh.json \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,seo,best-practices --quiet

# HTML report for visual review
npx lighthouse http://localhost:4321 --output=html --output-path=/tmp/lh.html \
  --chrome-flags="--headless=new --no-sandbox" --quiet
```

### Parse
```bash
cat /tmp/lh.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for cat_id, cat in d['categories'].items():
    s = cat['score'] * 100
    print(f'{'✓' if s >= 90 else '⚠' if s >= 50 else '✗'} {cat[\"title\"]}: {s:.0f}/100')
print()
for mid in ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive']:
    a = d['audits'].get(mid, {})
    if a: print(f'{mid}: {a.get(\"displayValue\", \"N/A\")}')
"
```

### Key Flags

| Flag | Purpose |
|---|---|
| `--preset=desktop` | Desktop sim (no throttling) |
| `--budget-path=budget.json` | Assert perf budgets |
| `--throttling.cpuSlowdownMultiplier=4` | Simulate slow device |

## Step 3: Performance Budgets

```json
[{
  "path": "/*",
  "timings": [
    { "metric": "largest-contentful-paint", "budget": 2500 },
    { "metric": "cumulative-layout-shift", "budget": 0.1 },
    { "metric": "total-blocking-time", "budget": 200 }
  ],
  "resourceSizes": [
    { "resourceType": "script", "budget": 150 },
    { "resourceType": "total", "budget": 800 },
    { "resourceType": "font", "budget": 100 }
  ]
}]
```

Run: `npx lighthouse URL --budget-path=budget.json --output=json --chrome-flags="--headless=new --no-sandbox" --quiet`

## Step 4: Bulk Audit

```bash
npx unlighthouse --site http://localhost:4321 --output-path /tmp/unlighthouse
npx unlighthouse --site URL --urls /,/about,/blog --throttle --max-routes 20
```

## Step 5: Diagnose & Fix

### LCP >2.5s
- Hero image: `fetchpriority="high"`, remove `loading="lazy"`, explicit dimensions
- Fonts: `font-display: swap`, preload critical fonts
- Render-blocking CSS: inline critical, defer rest
- Slow TTFB: caching headers, CDN

### CLS >0.1
- Images without dimensions: add `width`/`height`
- Dynamic content above fold: reserve space with min-height
- Font reflow: `size-adjust` in `@font-face`

### TBT >200ms
- Long tasks: `requestIdleCallback` or `scheduler.yield()`
- Large bundles: code-split, lazy-load below-fold
- Third-party scripts: `defer`/`async`, load on interaction

## Step 6: CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install && bun run build
      - run: bun run preview &
      - run: sleep 5
      - run: |
          npx lighthouse http://localhost:4321 --budget-path=budget.json \
            --output=json --output-path=/tmp/lh.json \
            --chrome-flags="--headless=new --no-sandbox" --quiet
      - run: |
          PERF=$(python3 -c "import json; print(int(json.load(open('/tmp/lh.json'))['categories']['performance']['score']*100))")
          echo "Performance: $PERF/100"
          if [ "$PERF" -lt 90 ]; then echo "::error::Score $PERF < 90"; exit 1; fi
```

## Report Template

```
## PageSpeed Audit — [URL] — [date]

| Category | Mobile | Desktop | Target |
|---|---|---|---|
| Performance | XX | XX | ≥90 |
| Accessibility | XX | XX | ≥90 |

| CWV | Value | Rating | Target |
|---|---|---|---|
| LCP | X.Xs | FAST/SLOW | ≤2.5s |
| INP | Xms | FAST/SLOW | ≤200ms |
| CLS | X.XX | FAST/SLOW | ≤0.1 |

### Top Issues
1. **[Issue]** → [fix]
2. **[Issue]** → [fix]
```

## Self-Check

- [ ] Tested both mobile AND desktop
- [ ] Field data checked (trumps lab data when available)
- [ ] All four categories audited
- [ ] Top 3 issues identified with actionable fixes
- [ ] LCP element identified and optimized
- [ ] CLS sources identified and fixed
- [ ] All scores ≥90
