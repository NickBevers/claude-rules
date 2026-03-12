---
name: app-store-optimization
description: Optimize app store listings for visibility and conversion. Triggers on "ASO", "app store optimization", "app listing", "play store", "app store listing", "app description".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# App Store Optimization — Listing & Visibility

Optimize app store presence for maximum discoverability and conversion.

## Step 1: Gather Context

- Platform: iOS App Store, Google Play, or both?
- App category and subcategory
- Target audience and their search behavior
- Competitor apps (top 3-5 in category)
- Current listing (if updating) — what's working, what's not?
- Unique selling points (3 max)

## Step 2: Keyword Research (parallel agents)

**Agent A — "Discovery Keywords"**: High-volume search terms users type when looking for this type of app. Focus on intent, not just volume. Check competitor app titles/subtitles for keyword patterns.

**Agent B — "Long-Tail Keywords"**: Specific, lower-competition phrases with high conversion intent. Feature-specific keywords, problem-specific keywords, audience-specific keywords.

## Step 3: Listing Optimization

### App Name (30 chars iOS / 50 chars Android)
- Brand name + primary keyword
- 3 variants for user to choose

### Subtitle (iOS 30 chars) / Short Description (Android 80 chars)
- Core value proposition with secondary keyword
- 3 variants

### Description
- **First 3 lines** (visible before "Read More"): Hook + core benefits + CTA
- **Body**: Feature highlights with keywords naturally integrated
- **Structure**: Short paragraphs, feature blocks, social proof section
- **Closing**: Download CTA

### Keywords (iOS 100 chars, comma-separated)
- No spaces after commas (saves characters)
- No duplicates of words already in title/subtitle
- Include common misspellings if they have volume
- Singular forms only (Apple pluralizes automatically)

### Screenshots Strategy
- First 2 screenshots = most critical (visible in search results)
- Each screenshot: one feature, one benefit statement, one visual
- Show the app in action, not splash screens
- Dark mode screenshot if supported (shows polish)
- Dimensions: iPhone 6.7" (1290×2796), iPad 12.9" (2048×2732)

### Ratings & Reviews Strategy
- In-app review prompt: after positive interaction, not on first launch
- iOS: `SKStoreReviewController` (max 3 prompts/year)
- Respond to negative reviews within 24 hours with action taken

## Step 4: Localization Priorities

- Translate title + subtitle + keywords for top markets by revenue potential
- Don't just translate — localize keywords per market
- Priority markets: US, UK, DE, FR, JP, KR, BR (unless app is region-specific)

## Step 5: Present Optimization Plan

Deliver:
1. Keyword priority list (primary, secondary, long-tail)
2. Title/subtitle/description variants (3 options each)
3. Screenshot content plan
4. Localization recommendation
5. Review prompt timing recommendation

## Rules

- No keyword stuffing — listings must read naturally
- No false claims or misleading screenshots
- Comply with Apple/Google review guidelines
- No emojis in title/subtitle (wastes characters, looks unprofessional)
- Focus on conversion (download rate) not just impressions
