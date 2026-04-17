---
name: frontend-scaffold
description: Scaffold a new frontend feature with correct file structure, types, tests, and styles. Triggers on "scaffold feature", "new feature", "scaffold component", "create feature", "set up feature".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Frontend Scaffold — Feature-Level Structure

Scaffold a complete frontend feature with all the files it needs, following the project's existing conventions.

## Step 1: Read Existing Conventions

Scan the project's file structure:
```bash
ls src/ && ls src/components/ 2>/dev/null && ls src/pages/ 2>/dev/null
```

Read 2-3 existing features to understand conventions: naming, file organization, test placement, style approach.

## Step 1: Gather Requirements

Ask the user (skip what's obvious from context):
- **What**: Feature name and purpose
- **Where**: Which page/route does it live on?
- **Data**: Does it fetch data? From where?
- **State**: Does it share state with other components?
- **Interactivity**: What user interactions does it handle?

## Step 2: Plan the File Structure

Based on project conventions and framework:

### React SPA
```
src/features/[feature-name]/
  components/
    FeatureName.tsx
    FeatureName.module.css
    FeatureName.test.tsx
    SubComponent.tsx
  hooks/
    useFeatureData.ts
    useFeatureData.test.ts
  types.ts
  api.ts                    # API calls (if TanStack Query: query keys + functions)
```

### Astro + Preact
```
src/
  pages/
    feature-name.astro       # Astro page (static shell)
  islands/
    FeatureIsland.tsx         # Interactive Preact island
    FeatureIsland.module.css
  components/
    FeatureStatic.astro       # Non-interactive parts
  stores/
    featureStore.ts           # Nanostores (if cross-island state needed)
```

### Next.js App Router
```
app/feature-name/
  page.tsx                    # Server Component page
  loading.tsx                 # Loading UI
  error.tsx                   # Error boundary
  _components/
    FeatureClient.tsx         # 'use client' interactive parts
    FeatureClient.module.css
```

**Always match the project's existing structure.** If they use flat `components/`, don't introduce `features/`. If they co-locate tests, don't create a `__tests__` directory.

## Step 3: Generate Files

Each file type has specific requirements:
- **Components**: Match the project's framework idioms (Preact `class`/`onInput`, React hooks, Astro `.astro`)
- **Types**: Discriminated unions for variants, explicit props types, no `any`
- **Tests**: Testing Library queries by role/label, axe-core a11y scan per component
- **State**: Classify as local/shared/server/URL — use the project's existing library
- **Data fetching**: Use the project's existing library, never introduce a second one
- **Forms**: Every input needs a label, `aria-invalid` on errors, `aria-describedby` linking
- **Routing**: Match existing route pattern (file-based vs. config)

### Type File
```tsx
// types.ts — shared types for this feature
export interface FeatureItem {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
}

export type FeatureFilter = {
  status?: FeatureItem['status']
  search?: string
}
```

### API File (TanStack Query example)
```tsx
// api.ts
import { z } from 'zod'

const FeatureItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.coerce.date(),
})

export const featureKeys = {
  all: ['features'] as const,
  list: (filters: FeatureFilter) => [...featureKeys.all, filters] as const,
  detail: (id: string) => [...featureKeys.all, id] as const,
}

export async function fetchFeatures(filters: FeatureFilter) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('q', filters.search)

  const res = await fetch(`/api/features?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch features: ${res.status}`)
  const data = await res.json()
  return z.array(FeatureItemSchema).parse(data)
}
```

### Starter Test
```tsx
// FeatureName.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, test, expect } from 'vitest'
import { FeatureName } from './FeatureName'

expect.extend(toHaveNoViolations)

describe('FeatureName', () => {
  test('renders feature content', () => {
    render(<FeatureName />)
    expect(screen.getByRole('heading', { name: /feature/i })).toBeInTheDocument()
  })

  test('has no accessibility violations', async () => {
    const { container } = render(<FeatureName />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

## Step 4: Verify Completeness

Run through the checklist:
- [ ] All files follow project naming conventions
- [ ] TypeScript types are precise (no `any`)
- [ ] Component has loading, error, and empty states
- [ ] Tests exist with at least: render test, interaction test, a11y scan
- [ ] Styles use project's approach (CSS Modules / Tailwind / scoped)
- [ ] Data fetching uses project's library
- [ ] State management matches project pattern
- [ ] Route added (if new page)
- [ ] Accessible: semantic HTML, keyboard, screen reader

## Step 5: Present to User

Show the file tree and ask:
- "Does this structure match your project's conventions?"
- "Any files I should add or remove?"
- "Ready to generate, or should I adjust?"

Generate only after confirmation.
