---
name: frontend-routing
description: Implement routing patterns for React (React Router, Next.js, TanStack Router) and Astro. Triggers on "routing", "add route", "dynamic route", "nested routes", "page navigation", "router setup".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Routing — Framework-Aware Navigation

| Router | Key Pattern |
|---|---|
| React Router 7 | Framework mode (Remix merged), `loader`/`action`/`Component` modules |
| React Router 6 | `createBrowserRouter`, loaders, actions, `<Outlet>` |
| TanStack Router | Type-safe routes, search param validation, file-based codegen |
| Next.js App Router | File-based, `layout.tsx`/`page.tsx`/`loading.tsx`/`error.tsx` |
| Astro | File-based in `src/pages/`, `getStaticPaths` for dynamic routes |

## Astro

File path = URL: `src/pages/about.astro` → `/about`, `src/pages/blog/[slug].astro` → `/blog/:slug`

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({ params: { slug: post.slug }, props: { post } }))
}
---
```

Navigation: plain `<a>` tags. SPA-like: add `<ClientRouter />`.

## React Router 6/7

```tsx
const router = createBrowserRouter([{
  path: '/',
  element: <Layout />,
  errorElement: <ErrorPage />,
  children: [
    { index: true, element: <Home /> },
    { path: 'users/:id', element: <UserDetail />, loader: userLoader },
  ],
}])

function App() { return <RouterProvider router={router} /> }
```

### Data Loading
```tsx
export async function usersLoader({ request }: LoaderFunctionArgs) {
  const page = new URL(request.url).searchParams.get('page') ?? '1'
  return getUsers({ page: Number(page) })
}
function UsersList() {
  const users = useLoaderData<typeof usersLoader>()
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### Search Params as State
```tsx
const [params, setParams] = useSearchParams()
const page = Number(params.get('page') ?? '1')
```

## Next.js App Router

```
app/
  layout.tsx     → Root layout
  page.tsx       → /
  blog/[slug]/page.tsx → /blog/:slug
  (auth)/login/page.tsx → /login (route group)
  api/users/route.ts → API route
```

Server components by default. `'use client'` only for interactive leaves.

## Protected Routes

```tsx
// React Router loader guard
export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request)
  if (!session) throw redirect('/login')
  return session
}

// Astro middleware guard
export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  if (['/dashboard', '/settings'].some(p => url.pathname.startsWith(p))) {
    if (!cookies.get('session')) return redirect('/login')
  }
  return next()
})
```

## Self-Check

- [ ] Verified router library and version
- [ ] Routes match existing pattern (file-based vs config)
- [ ] Dynamic routes have proper data loading
- [ ] Navigation uses router's `<Link>` (not raw `<a>` in SPAs)
- [ ] Search params for filterable/shareable state
- [ ] Error boundaries exist
- [ ] 404 handling exists
