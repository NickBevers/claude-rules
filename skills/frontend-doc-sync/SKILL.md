---
name: frontend-doc-sync
description: Verify frontend code against latest official documentation for React, Preact, Astro, and related libraries. Triggers on "check docs", "is this current", "api changed", "deprecated", "doc sync", "verify api", "latest docs".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Doc Sync — Verify Against Official Docs

Fetch live documentation to verify patterns and APIs are current.

## Step 1: Identify APIs to Verify

```bash
grep -rE '(useActionState|useFormStatus|useOptimistic|use\(|forwardRef|Suspense|lazy)' src/
```

## Step 2: Fetch Docs

| Framework | Search | Key pages |
|---|---|---|
| React | `site:react.dev/reference` | hooks, components, blog (breaking changes) |
| Preact | `site:preactjs.com` | signals, hooks, differences-to-react |
| Astro | `site:docs.astro.build` | content-collections, server-islands, upgrade guides |
| TanStack Query | `site:tanstack.com/query` | v5 changes: `isPending` vs `isLoading` |
| React Router | `site:reactrouter.com` | v7 merged Remix |

### React 19 Changes
- `forwardRef` → `ref` is regular prop
- `useFormState` → `useActionState`
- `<Context.Provider>` → `<Context>` directly
- `use()` new — reads promises/context
- Metadata tags hoist to `<head>`

## Step 3: Cross-Reference

For each API: Does it exist in this version? Correct signature? Newer pattern available? Known gotchas?

## Step 4: Report

```
## [API] — [Current / Deprecated / Changed]
**Version**: [lib]@[ver]
**Issue**: [what's wrong]
**Fix**: [code change]
**Source**: [URL]
```

Group by severity: Breaking → Deprecated → Suboptimal.

If findings affect rules in `rules/frontend.md`, propose the update with source. Ask before modifying.
