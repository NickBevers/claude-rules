---
name: frontend-data-fetching
description: Implement data fetching patterns with caching, loading states, and error handling for React, Preact, and Astro. Triggers on "fetch data", "api call", "tanstack query", "swr", "data loading", "server state", "use query".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Data Fetching — Correct Patterns per Framework

Match the project's existing library. Never introduce a second one.

| Context | Pattern |
|---|---|
| Astro page (SSG/SSR) | `fetch()` in frontmatter |
| Astro island (client) | TanStack Query, SWR, or Signals |
| React (server state) | TanStack Query / SWR |
| React 19 (simple) | `use()` with Suspense |
| Preact island | `fetch` + Signals or `useEffect` |

## Step 1: Astro

**Build-time:**
```astro
---
const posts = await (await fetch('https://api.example.com/posts')).json()
---
```

**Per-request (SSR):**
```astro
---
export const prerender = false
const session = Astro.cookies.get('session')?.value
const res = await fetch('https://api.example.com/me', {
  headers: { Authorization: `Bearer ${session}` },
})
if (!res.ok) return Astro.redirect('/login')
const user = await res.json()
---
```

**Content collections:**
```astro
---
const posts = await getCollection('blog', ({ data }) => !data.draft)
---
```

## Step 2: TanStack Query

```tsx
const { data: user, isPending, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000,
})

if (isPending) return <ProfileSkeleton />
if (error) return <ErrorMessage error={error} />
return <Profile user={user} />
```

### Query Keys (hierarchical)
```tsx
queryKey: ['users']                   // all users
queryKey: ['users', userId]           // specific user
queryKey: ['users', userId, 'posts']  // user's posts
```

### Mutations
```tsx
const mutation = useMutation({
  mutationFn: () => deleteUser(userId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
})
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
  onError: (_, __, ctx) => queryClient.setQueryData(['user', userId], ctx?.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['user', userId] }),
})
```

## Step 3: Preact Fetch

```tsx
import { signal } from '@preact/signals'

const user = signal<User | null>(null)
const loading = signal(true)
const error = signal<Error | null>(null)

export function loadUser(id: string) {
  loading.value = true
  error.value = null
  fetch(`/api/users/${id}`)
    .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
    .then(data => { user.value = data })
    .catch(err => { error.value = err })
    .finally(() => { loading.value = false })
}
```

With hooks — always include `AbortController` cleanup:
```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal })
    .then(r => r.json()).then(setData)
    .catch(err => { if (err.name !== 'AbortError') setError(err) })
  return () => controller.abort()
}, [url])
```

## Step 4: Loading & Error States

Every fetch needs three states: **loading, error, success**.

- **Loading**: Skeleton screens matching content layout (not spinners). Show immediately.
- **Error**: Plain language, retry action, preserve user context.
- **Empty**: Distinguish "no results" from "error". Show helpful action.

## Self-Check

- [ ] Using project's existing fetching library
- [ ] Every fetch has loading, error, success states
- [ ] Astro: server-side fetch in frontmatter for page data
- [ ] TanStack Query: hierarchical keys, `staleTime` configured
- [ ] Mutations invalidate related queries
- [ ] `AbortController` in `useEffect`-based fetches
- [ ] Error shows user-friendly message + retry
