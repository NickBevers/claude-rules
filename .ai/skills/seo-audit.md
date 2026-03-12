---
name: seo-audit
description: Technical SEO audit and implementation for web projects. Triggers on "SEO audit", "SEO check", "meta tags", "structured data", "sitemap", "SEO", "open graph".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# SEO Audit — Technical Search Optimization

Audit existing sites or implement SEO foundations for new builds. Report-first, then implement on approval.

## Step 1: Determine Scope

Full audit or specific area (meta, performance, structured data, crawlability)? New build or existing site?

## Step 2: Audit Agents (parallel)

**Agent A — "On-Page & Meta"**: Title tags (unique, 50-60 chars, keyword-front), meta descriptions (unique, 150-160 chars, CTA), OG tags (title/desc/image 1200x630/type/url), Twitter Card tags, canonical URLs, heading hierarchy (single h1, logical nesting), image alt text, internal linking (3 clicks from home).

**Agent B — "Technical & Crawlability"**: robots.txt, XML sitemap at /sitemap.xml, canonical tags, lang attribute, mobile-friendly (viewport, touch targets), Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1), HTTPS/no mixed content, custom 404, no redirect chains, JSON-LD structured data.

**Agent C — "Content & Semantic"**: Semantic HTML elements, clean URL structure, content-to-code ratio, duplicate content/canonicals, no thin pages.

## Step 3: Report

Categorize findings as Critical (blocks indexing), Important (hurts ranking), Opportunities (quick wins). Include implementation checklist with file paths.

## Step 4: Implement (on approval)

For Astro: BaseHead component with meta/OG props, @astrojs/sitemap, JSON-LD in head, robots.txt in public/, canonical via Astro.url.

## Rules

- Every finding must reference a specific file and line
- No keyword stuffing recommendations
- Focus on technical SEO developers control, not content marketing
