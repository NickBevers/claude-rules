---
name: pagespeed-audit
description: Run PageSpeed Insights and Lighthouse audits to measure Core Web Vitals, accessibility, SEO, and best practices. Triggers on "pagespeed", "lighthouse", "core web vitals", "page speed", "performance score", "lighthouse audit", "psi check".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# PageSpeed Audit — Automated Performance Validation

Run Google PageSpeed Insights (remote) and Lighthouse (local) to measure Core Web Vitals, accessibility, SEO, and best practices. This skill lets an LLM validate performance without a human opening a browser.

## Step 0: Choose Audit Method

| Method | When to Use | What You Get |
|---|---|---|
| **PageSpeed Insights API** | Site is deployed / publicly accessible | Field data (CrUX real users) + Lab data (Lighthouse) |
| **Lighthouse CLI** | Local dev server running, or CI pipeline | Lab data only (synthetic, reproducible) |
| **Unlighthouse** | Need to audit many pages at once | Bulk Lighthouse across entire site |

Check what's available:

```bash
# Is Lighthouse installed?
npx lighthouse --version 2>/dev/null || echo "Not installed"

# Is the dev server running?
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321 2>/dev/null || echo "No dev server"
```

## Step 1: PageSpeed Insights API (Remote — Deployed Sites)

### Run the Audit

```bash
# Mobile (default, stricter — test this first)
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL_HERE&category=performance&category=accessibility&category=seo&category=best-practices&strategy=mobile" | python3 -m json.tool > /tmp/psi-mobile.json

# Desktop
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL_HERE&category=performance&category=accessibility&category=seo&category=best-practices&strategy=desktop" | python3 -m json.tool > /tmp/psi-desktop.json
```

**No API key required** for occasional use. For automated/frequent checks, get a free key at `console.developers.google.com` (enable "PageSpeed Insights API") and append `&key=YOUR_KEY`. Rate limits: 25,000 queries/day with key.

### Parse the Results

```bash
# Extract category scores (0-1 scale, multiply by 100 for percentage)
cat /tmp/psi-mobile.json | python3 -c "
import json, sys
d = json.load(sys.stdin)

# Category scores
cats = d.get('lighthouseResult', {}).get('categories', {})
for name, cat in cats.items():
    score = cat.get('score', 0)
    print(f'{name}: {score * 100:.0f}/100')

# Core Web Vitals (field data from real users)
print('\n--- Field Data (CrUX) ---')
metrics = d.get('loadingExperience', {}).get('metrics', {})
for key, val in metrics.items():
    print(f'{key}: p75={val.get(\"percentile\", \"N/A\")} [{val.get(\"category\", \"NONE\")}]')

# Lab metrics
print('\n--- Lab Data (Lighthouse) ---')
audits = d.get('lighthouseResult', {}).get('audits', {})
for audit_id in ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint', 'speed-index', 'interactive']:
    audit = audits.get(audit_id, {})
    if audit:
        print(f'{audit_id}: {audit.get(\"displayValue\", \"N/A\")} [score: {audit.get(\"score\", 0):.2f}]')
"
```

### Interpret Field Data (CrUX — Real User Metrics)

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤2500ms | ≤4000ms | >4000ms |
| INP (Interaction to Next Paint) | ≤200ms | ≤500ms | >500ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |
| FCP (First Contentful Paint) | ≤1800ms | ≤3000ms | >3000ms |
| TTFB (Time to First Byte) | ≤800ms | ≤1800ms | >1800ms |

**Field data may say `NONE`** if the URL doesn't have enough traffic in CrUX. This is normal for small sites. Fall back to lab data.

## Step 2: Lighthouse CLI (Local — Dev Server)

### Install & Run

```bash
# Run against local dev server (must be running)
npx lighthouse http://localhost:4321 \
  --output=json \
  --output-path=/tmp/lighthouse-report.json \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,seo,best-practices \
  --quiet

# Also generate HTML report for visual review
npx lighthouse http://localhost:4321 \
  --output=html \
  --output-path=/tmp/lighthouse-report.html \
  --chrome-flags="--headless=new --no-sandbox" \
  --quiet
```

### Parse Lighthouse JSON

```bash
cat /tmp/lighthouse-report.json | python3 -c "
import json, sys
d = json.load(sys.stdin)

# Scores
print('=== SCORES ===')
for cat_id, cat in d['categories'].items():
    score = cat['score'] * 100
    status = '✓' if score >= 90 else '⚠' if score >= 50 else '✗'
    print(f'{status} {cat[\"title\"]}: {score:.0f}/100')

# Performance metrics
print('\n=== PERFORMANCE METRICS ===')
metric_ids = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
    'interactive',
]
for mid in metric_ids:
    audit = d['audits'].get(mid, {})
    score = audit.get('score', 0)
    display = audit.get('displayValue', 'N/A')
    status = '✓' if score >= 0.9 else '⚠' if score >= 0.5 else '✗'
    print(f'{status} {mid}: {display}')

# Failed audits (opportunities)
print('\n=== FAILED AUDITS (score < 0.9) ===')
for audit_id, audit in d['audits'].items():
    score = audit.get('score')
    if score is not None and score < 0.9 and audit.get('details', {}).get('type') in ['opportunity', 'table', 'list']:
        print(f'  {audit[\"title\"]}: {audit.get(\"displayValue\", \"\")}')
        desc = audit.get('description', '')
        if desc:
            # Truncate long descriptions
            print(f'    {desc[:120]}')
"
```

### Lighthouse Flags Reference

| Flag | Purpose |
|---|---|
| `--only-categories=performance,accessibility,seo,best-practices` | Which audits to run |
| `--chrome-flags="--headless=new --no-sandbox"` | Headless Chrome (required in CLI/CI) |
| `--throttling.cpuSlowdownMultiplier=4` | Simulate slow device (default for mobile) |
| `--throttling.throughputKbps=1638` | Simulate slow network |
| `--preset=desktop` | Desktop simulation (no throttling) |
| `--budget-path=budget.json` | Assert performance budgets |
| `--max-wait-for-load=45000` | Timeout for page load (ms) |
| `--output=json,html` | Multiple output formats |

## Step 3: Performance Budgets

### Define a Budget

```json
// budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 1800 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "total-blocking-time", "budget": 200 },
      { "metric": "interactive", "budget": 3500 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 150 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "stylesheet", "budget": 50 },
      { "resourceType": "total", "budget": 800 },
      { "resourceType": "font", "budget": 100 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 5 },
      { "resourceType": "script", "budget": 10 },
      { "resourceType": "font", "budget": 3 }
    ]
  }
]
```

### Run with Budget

```bash
npx lighthouse http://localhost:4321 \
  --budget-path=budget.json \
  --output=json \
  --output-path=/tmp/lighthouse-budget.json \
  --chrome-flags="--headless=new --no-sandbox" \
  --quiet
```

Budget violations appear in `audits.performance-budget.details.items`.

## Step 4: Bulk Audit (Unlighthouse)

For scanning multiple pages:

```bash
# Scan entire site (respects sitemap)
npx unlighthouse --site http://localhost:4321 --output-path /tmp/unlighthouse

# Limit to specific routes
npx unlighthouse --site http://localhost:4321 --urls /,/about,/blog,/contact

# With max concurrent pages
npx unlighthouse --site http://localhost:4321 --throttle --max-routes 20
```

Unlighthouse generates an interactive HTML dashboard at the output path.

## Step 5: Diagnose & Fix Common Issues

After running the audit, diagnose and fix the top issues:

### LCP Too Slow (>2.5s)

```bash
# Find the LCP element
cat /tmp/lighthouse-report.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
lcp = d['audits'].get('largest-contentful-paint-element', {})
items = lcp.get('details', {}).get('items', [])
for item in items:
    print(f'LCP element: {item.get(\"node\", {}).get(\"snippet\", \"unknown\")}')"
```

**Fixes:**
- Hero image: add `fetchpriority="high"`, remove `loading="lazy"`, add explicit `width`/`height`
- Web fonts blocking render: add `font-display: swap`, preload critical fonts
- Render-blocking CSS: inline critical CSS, defer non-critical
- Server response slow (TTFB): check server, add caching headers, use CDN

### CLS Too High (>0.1)

```bash
# Find CLS-causing elements
cat /tmp/lighthouse-report.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
cls = d['audits'].get('layout-shifts', d['audits'].get('layout-shift-elements', {}))
items = cls.get('details', {}).get('items', [])
for item in items:
    print(f'Shift: {item.get(\"node\", {}).get(\"snippet\", \"unknown\")} score={item.get(\"score\", \"?\")}')"
```

**Fixes:**
- Images without dimensions: add `width` and `height` attributes
- Dynamic content injected above existing content: reserve space with min-height
- Web fonts causing reflow: use `size-adjust` / metric overrides in `@font-face`
- Ads/embeds without reserved space: add placeholder containers

### TBT Too High (>200ms)

**Fixes:**
- Long JS tasks: break up with `requestIdleCallback` or `scheduler.yield()`
- Large JS bundles: code-split routes, lazy-load below-fold components
- Third-party scripts: defer with `async`/`defer`, load on interaction
- Unused JS: tree-shake, check with `npx vite-bundle-visualizer`

### Accessibility Score Low

```bash
# List failed accessibility audits
cat /tmp/lighthouse-report.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for aid, audit in d['audits'].items():
    if audit.get('score') == 0 and 'accessibility' in str(d['categories'].get('accessibility', {}).get('auditRefs', [])):
        items = audit.get('details', {}).get('items', [])
        if items:
            print(f'\n{audit[\"title\"]}')
            for item in items[:3]:
                print(f'  {item.get(\"node\", {}).get(\"snippet\", \"\")[:100]}')"
```

**Common fixes:** missing alt text, missing form labels, insufficient contrast, missing lang attribute, missing landmark regions.

## Step 6: CI Integration

### GitHub Actions

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
          npx lighthouse http://localhost:4321 \
            --budget-path=budget.json \
            --output=json \
            --output-path=/tmp/lh.json \
            --chrome-flags="--headless=new --no-sandbox" \
            --quiet
      - run: |
          PERF=$(cat /tmp/lh.json | python3 -c "import json,sys; print(int(json.load(sys.stdin)['categories']['performance']['score']*100))")
          echo "Performance: $PERF/100"
          if [ "$PERF" -lt 90 ]; then echo "::error::Performance score $PERF is below 90"; exit 1; fi
```

## Step 7: Report Template

After running the audit, present findings in this format:

```
## PageSpeed Audit — [URL] — [date]

### Scores
| Category | Mobile | Desktop | Target |
|---|---|---|---|
| Performance | XX/100 | XX/100 | ≥90 |
| Accessibility | XX/100 | XX/100 | ≥90 |
| Best Practices | XX/100 | XX/100 | ≥90 |
| SEO | XX/100 | XX/100 | ≥90 |

### Core Web Vitals (Field Data)
| Metric | Value | Rating | Target |
|---|---|---|---|
| LCP | X.Xs | FAST/AVERAGE/SLOW | ≤2.5s |
| INP | Xms | FAST/AVERAGE/SLOW | ≤200ms |
| CLS | X.XX | FAST/AVERAGE/SLOW | ≤0.1 |

### Top Issues (ordered by impact)
1. **[Issue]** — [what's wrong] → [specific fix]
2. **[Issue]** — [what's wrong] → [specific fix]
3. **[Issue]** — [what's wrong] → [specific fix]

### Resource Budget
| Resource | Size | Budget | Status |
|---|---|---|---|
| Total | XXX KB | 800 KB | ✓/✗ |
| Scripts | XXX KB | 150 KB | ✓/✗ |
| Images | XXX KB | 500 KB | ✓/✗ |
| Fonts | XXX KB | 100 KB | ✓/✗ |
```

## Self-Check

- [ ] Tested both mobile AND desktop (mobile is stricter and more important)
- [ ] Field data checked (CrUX) — if available, this trumps lab data
- [ ] All four categories audited (performance, accessibility, seo, best-practices)
- [ ] Top 3 issues identified with specific, actionable fixes
- [ ] Performance budget defined and checked
- [ ] LCP element identified and optimized
- [ ] CLS sources identified and fixed
- [ ] Accessibility failures listed with DOM element references
- [ ] Results compared against targets (all scores ≥90)
