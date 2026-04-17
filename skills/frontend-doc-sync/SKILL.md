---
name: frontend-doc-sync
description: Verify frontend code against latest official documentation for React, Preact, Astro, and related libraries. Triggers on "check docs", "is this current", "api changed", "deprecated", "doc sync", "verify api", "latest docs".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Doc Sync — Verify Against Official Documentation

Fetch live documentation to verify that patterns, APIs, and recommendations are current. Useful when a user reports a pattern doesn't work, after a major dependency upgrade, or when a framework API seems uncertain.

## Step 1: Identify What to Verify

Scan the code or proposed change for framework APIs:

```bash
grep -rE '(useActionState|useFormStatus|useOptimistic|use\(|forwardRef|createContext|Suspense|lazy|startTransition|useTransition|useDeferredValue)' src/
```

List every API, hook, component, or pattern that will be used.

## Step 2: Fetch Latest Documentation

### React
WebSearch for each API: `site:react.dev/reference <API_NAME>`

Key pages to check:
- `react.dev/reference/react` — hooks, components, APIs
- `react.dev/reference/react-dom` — DOM-specific APIs
- `react.dev/blog` — release announcements for breaking changes
- `react.dev/learn` — recommended patterns (these change with new versions)

**React moves fast. Things that changed in v19:**
- `forwardRef` → `ref` is a regular prop
- `useFormState` → renamed to `useActionState`
- `<Context.Provider>` → `<Context>` works directly
- `use()` is new — reads promises and context
- Metadata tags in components hoist to `<head>`

### Preact
WebSearch: `site:preactjs.com <TOPIC>`

Key pages:
- `preactjs.com/guide/v10/getting-started`
- `preactjs.com/guide/v10/signals`
- `preactjs.com/guide/v10/hooks`
- `preactjs.com/guide/v10/differences-to-react`

**Preact-specific things to verify:**
- Signal API changes (still evolving)
- `preact/compat` compatibility matrix
- Hook import paths (`preact/hooks` vs. built-in)

### Astro
WebSearch: `site:docs.astro.build <TOPIC>`

Key pages:
- `docs.astro.build/en/guides/content-collections/`
- `docs.astro.build/en/guides/server-islands/`
- `docs.astro.build/en/reference/configuration-reference/`
- `docs.astro.build/en/guides/upgrade-to/v5/` (or current major)

**Astro-specific things to verify:**
- Content collection config (moved from `src/content/config.ts` to `src/content.config.ts` in v5)
- `astro:env` module (new in v5)
- `astro:actions` API surface
- Image component API (`astro:assets`)
- Loader API for content collections

### TanStack Query
WebSearch: `site:tanstack.com/query <TOPIC>`
- v5 changed: `useQuery` options, `QueryClientProvider` setup, `isPending` vs `isLoading`

### React Router
WebSearch: `site:reactrouter.com <TOPIC>`
- v7 merged Remix — framework mode vs. library mode
- v6 → v7 migration path

### Next.js
WebSearch: `site:nextjs.org/docs <TOPIC>`
- App Router vs. Pages Router APIs
- Server Components + Server Actions
- Metadata API

## Step 3: Cross-Reference Code

For each API found in Step 1, compare the project's usage against the fetched docs:

1. **Does the API exist in this version?** (Check version in `package.json`)
2. **Is the signature correct?** (Parameters, return type, options)
3. **Is there a newer recommended pattern?** (Deprecated API with a replacement)
4. **Are there known gotchas?** (SSR behavior, hydration mismatches, bundle impact)

## Step 4: Report Findings

For each issue found, report:

```
## [API Name] — [Status: Current / Deprecated / Changed / Not Available]

**Project version**: [library]@[version]
**Issue**: [What's wrong or outdated]
**Fix**: [Exact code change needed]
**Source**: [URL of the documentation page]
```

Group by severity:
1. **Breaking**: Code will fail or already fails (deprecated API removed, wrong signature)
2. **Deprecated**: Code works but uses deprecated patterns (will break in next major)
3. **Suboptimal**: Code works but a better pattern exists (newer API, simpler approach)

## Step 5: Suggest Rule Updates (if applicable)

If doc sync reveals a pattern change that affects rules in `rules/frontend.md` or other rule files, propose the update with the documentation source. Ask the user before modifying rule files.
