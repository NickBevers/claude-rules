---
name: app-store-optimization
description: Optimize app store listings for visibility and conversion. Triggers on "ASO", "app store optimization", "app listing", "play store", "app store listing", "app description".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# App Store Optimization — Listing & Visibility

Optimize app store presence for maximum discoverability and conversion.

## Step 1: Gather Context

Platform (iOS/Android/both), category/subcategory, target audience search behavior, top 3-5 competitor apps, current listing status, unique selling points (3 max).

## Step 2: Keyword Research (parallel agents)

**Agent A — "Discovery Keywords"**: High-volume search terms with intent focus. Check competitor titles/subtitles for patterns.

**Agent B — "Long-Tail Keywords"**: Lower-competition, high-conversion phrases. Feature-specific, problem-specific, audience-specific.

## Step 3: Listing Optimization

**App Name** (30 chars iOS / 50 Android): Brand + primary keyword. 3 variants.

**Subtitle** (iOS 30 chars) / **Short Description** (Android 80 chars): Core value prop + secondary keyword. 3 variants.

**Description**: First 3 lines = hook + benefits + CTA (visible before "Read More"). Body = feature highlights with natural keywords. Closing = download CTA.

**Keywords** (iOS 100 chars): No spaces after commas, no duplicates from title/subtitle, include common misspellings, singular forms only.

**Screenshots**: First 2 most critical (visible in search). One feature + one benefit per screenshot. Show app in action. Dark mode if supported. Correct dimensions per device.

**Ratings**: Prompt after positive interaction (not first launch). iOS: SKStoreReviewController (max 3/year). Respond to negative reviews within 24h.

## Step 4: Localization

Translate + localize title/subtitle/keywords per market (not just translate). Priority: US, UK, DE, FR, JP, KR, BR unless region-specific.

## Step 5: Deliver

Keyword priority list, title/subtitle/description variants (3 each), screenshot content plan, localization recommendation, review prompt timing.

## Rules

- No keyword stuffing — listings must read naturally
- No false claims or misleading screenshots
- Comply with Apple/Google review guidelines
- No emojis in title/subtitle. Focus on conversion, not just impressions.
