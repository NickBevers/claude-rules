---
name: seo-audit
description: Technical SEO audit and implementation for web projects. Triggers on "SEO audit", "SEO check", "meta tags", "structured data", "sitemap", "SEO", "open graph".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# SEO Audit — Technical Search Optimization

Audit existing sites or implement SEO foundations for new builds. Report-first, then implement on approval.

## Step 1: Determine Scope

- Full audit or specific area (meta, performance, structured data, crawlability)?
- New build (implement from scratch) or existing site (audit + fix)?

## Step 2: Audit Agents (parallel)

**Agent A — "On-Page & Meta"**:
- Title tags: unique per page, 50-60 chars, primary keyword near front
- Meta descriptions: unique, 150-160 chars, include CTA
- Open Graph tags: `og:title`, `og:description`, `og:image` (1200x630), `og:type`, `og:url`
- Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Canonical URLs on every page (self-referencing or pointing to primary)
- Heading hierarchy: single `<h1>` per page, logical `<h2>`→`<h3>` nesting
- Image alt text: descriptive, keyword-natural, decorative = `alt=""`
- Internal linking: key pages reachable within 3 clicks from home

**Agent B — "Technical & Crawlability"**:
- `robots.txt`: exists, not blocking important paths
- XML sitemap: exists at `/sitemap.xml`, includes all indexable pages, excludes noindex pages
- Sitemap in `robots.txt`: `Sitemap: https://domain.com/sitemap.xml`
- `<link rel="canonical">` present and correct
- `<html lang="xx">` attribute set
- Mobile-friendly: viewport meta tag, no horizontal scroll, 44px touch targets
- Page speed: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- HTTPS: all resources loaded over HTTPS, no mixed content
- 404 page: custom, helpful, links back to key pages
- Redirect chains: none (direct 301s only)
- Structured data: JSON-LD for Organization, BreadcrumbList, Article/Product as applicable

**Agent C — "Content & Semantic"**:
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`
- URL structure: short, descriptive, hyphenated, no query params for content pages
- Content-to-code ratio: meaningful content not buried in boilerplate
- Duplicate content: no identical pages, canonical tags where needed
- Thin pages: every indexable page has substantial unique content

## Step 3: Report

```
# SEO Audit Report

## Critical (blocks indexing/ranking)
[Issues with file:line references]

## Important (hurts ranking)
[Issues with fixes]

## Opportunities (could improve)
[Quick wins]

## Implementation Checklist
[ ] Each actionable item with file path
```

## Step 4: Implement (on approval)

For Astro projects:
- `<BaseHead>` component with all meta/OG tags via props
- `sitemap.xml` via `@astrojs/sitemap` integration
- JSON-LD structured data as `<script type="application/ld+json">` in `<head>`
- `robots.txt` as static file in `public/`
- Canonical URLs via `Astro.url`

## Rules

- Every finding must reference a specific file and line
- No keyword stuffing recommendations
- Focus on technical SEO that developers control, not content marketing strategy
- No icons or decorative elements in meta/OG content
