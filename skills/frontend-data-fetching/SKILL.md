---
name: frontend-data-fetching
description: Implement data fetching patterns with caching, loading states, and error handling for React, Preact, and Astro. Triggers on "fetch data", "api call", "tanstack query", "swr", "data loading", "server state", "use query".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Data Fetching — Correct Patterns for Every Framework

Data fetching is where most frontend bugs live: race conditions, stale data, missing error handling, loading state flicker. Use the right pattern for the framework and context.

## Step 1: Choose the Right Pattern

Match the project's existing data fetching library. Never introduce a second one.

| Context | Pattern | Why |
|---|---|---|
| Astro page (SSG) | `fetch()` in frontmatter | Runs at build time, zero client JS |
| Astro page (SSR) | `fetch()` in frontmatter | Runs per-request on server |
| Astro island (client) | TanStack Query or SWR | Needs client-side caching & revalidation |
| React (with server state lib) | TanStack Query / SWR | Caching, deduplication, background refetch |
| React (no library, simple) | `use()` (React 19) or `useEffect` | One-off fetch, no caching needed |
| React Server Component (Next.js) | Direct `fetch()` or `async` component | Server-side, no client bundle |
| Preact island | `fetch` in `useEffect` or Signals | Keep bundle small — no heavy library |

## Step 2: Astro Data Fetching

### Build-Time (SSG)
```astro
---
// Runs once at build time — zero client JS
const response = await fetch('https://api.example.com/posts')
const posts = await response.json()
---
<ul>
  {posts.map(post => <li>{post.title}</li>)}
</ul>
```

### Per-Request (SSR)
```astro
---
export const prerender = false

const session = Astro.cookies.get('session')?.value
const response = await fetch('https://api.example.com/me', {
  headers: { Authorization: `Bearer ${session}` },
})

if (!response.ok) return Astro.redirect('/login')
const user = await response.json()
---
<h1>Welcome, {user.name}</h1>
```

### Content Collections
```astro
---
import { getCollection } from 'astro:content'

const posts = await getCollection('blog', ({ data }) => !data.draft)
const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
---
```

### Client-Side (Island)
For interactive data (search, infinite scroll, real-time), fetch inside a framework island.

## Step 3: TanStack Query (React)

### Basic Query
```tsx
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000,
  })

  if (isPending) return <ProfileSkeleton />
  if (error) return <ErrorMessage error={error} retry={() => {}} />

  return <Profile user={user} />
}
```

### Query Keys
```tsx
// Hierarchical keys enable smart invalidation
queryKey: ['users']                    // all users
queryKey: ['users', { page: 1 }]      // users page 1
queryKey: ['users', userId]            // specific user
queryKey: ['users', userId, 'posts']   // user's posts
```

### Mutations
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function DeleteButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
```

### Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['user', userId] })
    const previous = queryClient.getQueryData(['user', userId])
    queryClient.setQueryData(['user', userId], newData)
    return { previous }
  },
  onError: (_err, _new, context) => {
    queryClient.setQueryData(['user', userId], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] })
  },
})
```

### Provider Setup
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
```

## Step 4: SWR (Alternative)

```tsx
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(`/api/users/${userId}`, fetcher)

  if (isLoading) return <ProfileSkeleton />
  if (error) return <ErrorMessage error={error} />

  return <Profile user={data} />
}
```

SWR is simpler than TanStack Query — good for projects that need basic caching without mutations/optimistic updates.

## Step 5: React 19 `use()` (Simple Cases)

```tsx
import { use, Suspense } from 'react'

const userPromise = fetchUser('123')

function UserProfile() {
  const user = use(userPromise)
  return <Profile user={user} />
}

// Wrapped in Suspense
<Suspense fallback={<ProfileSkeleton />}>
  <UserProfile />
</Suspense>
```

`use()` is for simple, one-off reads. For anything that needs caching, revalidation, or mutation — use TanStack Query or SWR.

## Step 6: Preact Data Fetching

### Minimal (no library)
```tsx
import { signal, effect } from '@preact/signals'

const user = signal<User | null>(null)
const loading = signal(true)
const error = signal<Error | null>(null)

export function loadUser(id: string) {
  loading.value = true
  error.value = null

  fetch(`/api/users/${id}`)
    .then(r => {
      if (!r.ok) throw new Error(`${r.status}`)
      return r.json()
    })
    .then(data => { user.value = data })
    .catch(err => { error.value = err })
    .finally(() => { loading.value = false })
}
```

### With hooks (when Signals aren't appropriate)
```tsx
import { useState, useEffect } from 'preact/hooks'

function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}
```

Always include `AbortController` cleanup in `useEffect`-based fetching.

## Step 7: Loading & Error States

**Every fetch needs three states: loading, error, success.**

### Loading
- Use skeleton screens (not spinners) for content areas
- Match the skeleton to the actual content layout (prevents CLS)
- Show skeletons immediately — no artificial delay
- For mutations: disable the trigger button, show inline "Saving…"

### Error
- Show what went wrong in plain language
- Provide a retry action
- Don't lose user context (keep the form filled, keep the page visible)
- Log error details to monitoring (not console.log)

### Empty State
- Distinguish "no results" from "error fetching"
- Show a helpful action: "No posts yet. Create your first post."

## Self-Check

- [ ] Using the project's existing fetching library (not introducing a new one)
- [ ] Every fetch has loading, error, and success states
- [ ] Astro: server-side fetch in frontmatter (not client-side) for page data
- [ ] TanStack Query: hierarchical query keys, `staleTime` configured
- [ ] Mutations invalidate related queries
- [ ] `AbortController` cleanup in any `useEffect`-based fetch
- [ ] No manual `useState` + `useEffect` + `fetch` when a server state library is available
- [ ] Error state shows user-friendly message + retry action
- [ ] Loading state uses skeleton matching actual content layout
