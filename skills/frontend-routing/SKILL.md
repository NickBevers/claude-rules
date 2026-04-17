---
name: frontend-routing
description: Implement routing patterns for React (React Router, Next.js, TanStack Router) and Astro. Triggers on "routing", "add route", "dynamic route", "nested routes", "page navigation", "router setup".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Routing — Framework-Aware Navigation Patterns

Routing APIs differ significantly between frameworks and versions. Use the patterns matching the project's router.

## Router Quick Reference

| Router | Key Pattern |
|---|---|
| React Router 7 | Framework mode (Remix merged), `loader`/`action`/`Component` route modules |
| React Router 6 | `createBrowserRouter`, loaders, actions, `<Outlet>`, relative routes |
| React Router 5 | `<Switch>`, `<Route component={}>`, `useHistory` |
| TanStack Router | Type-safe routes, search param validation, file-based codegen |
| Next.js App Router | File-based, `layout.tsx`/`page.tsx`/`loading.tsx`/`error.tsx` |
| Next.js Pages Router | `getServerSideProps`, `getStaticProps`, `_app.tsx` |
| Astro | File-based in `src/pages/`, `getStaticPaths` for dynamic routes |

## Step 1: Astro Routing

### Static Routes
File path = URL path:
```
src/pages/
  index.astro        → /
  about.astro        → /about
  blog/
    index.astro      → /blog
    [slug].astro     → /blog/:slug
  [...slug].astro    → catch-all
```

### Dynamic Routes (SSG)
```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

const { post } = Astro.props
---
```

### Server Routes (SSR)
```astro
---
// Per-page SSR opt-in
export const prerender = false

// Access request data
const session = Astro.cookies.get('session')
if (!session) return Astro.redirect('/login')
---
```

### API Routes
```ts
// src/pages/api/users.ts
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1')
  const users = await getUsers({ page })
  return new Response(JSON.stringify(users), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Navigation
```astro
<!-- Astro: plain <a> tags — no client-side router -->
<a href="/about">About</a>
<a href={`/blog/${post.slug}`}>{post.data.title}</a>

<!-- View Transitions for SPA-like navigation -->
<head>
  <ClientRouter />
</head>
```

## Step 2: React Router (v6/v7)

### Route Definition
```tsx
// React Router 6/7 (library mode)
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          { index: true, element: <UsersList />, loader: usersLoader },
          { path: ':id', element: <UserDetail />, loader: userLoader },
        ],
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}
```

### Data Loading (v6.4+)
```tsx
// Loader: runs before component renders
export async function usersLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = url.searchParams.get('page') ?? '1'
  return getUsers({ page: Number(page) })
}

// In component
function UsersList() {
  const users = useLoaderData<typeof usersLoader>()
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### Navigation
```tsx
import { Link, NavLink, useNavigate } from 'react-router-dom'

// Declarative
<Link to="/users/123">View User</Link>
<NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
  Users
</NavLink>

// Programmatic
const navigate = useNavigate()
navigate('/users/123')
navigate(-1)  // back
```

### Search Params as State
```tsx
import { useSearchParams } from 'react-router-dom'

function UsersList() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '1')
  const sort = params.get('sort') ?? 'name'

  return (
    <button onClick={() => setParams({ page: String(page + 1), sort })}>
      Next page
    </button>
  )
}
```

## Step 3: Next.js App Router

### File Conventions
```
app/
  layout.tsx          → Root layout (wraps all pages)
  page.tsx            → / (home)
  loading.tsx         → Loading UI (Suspense boundary)
  error.tsx           → Error UI (Error boundary)
  not-found.tsx       → 404 page
  blog/
    page.tsx          → /blog
    [slug]/
      page.tsx        → /blog/:slug
    layout.tsx        → Blog-specific layout
  (auth)/             → Route group (no URL segment)
    login/page.tsx    → /login
    signup/page.tsx   → /signup
  api/
    users/route.ts    → API route: /api/users
```

### Server vs. Client Components
```tsx
// Server Component (default — no directive needed)
async function BlogPage() {
  const posts = await getPosts()  // Direct DB/API access
  return <PostList posts={posts} />
}

// Client Component (opt-in)
'use client'
import { useState } from 'react'

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>Like</button>
}
```

Push `'use client'` as far down the tree as possible — only the interactive leaf needs it.

### Metadata
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest posts',
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  return { title: post.title, description: post.excerpt }
}
```

## Step 4: Protected Routes

### Pattern (any router)
```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSkeleton />
  if (!user) return <Navigate to="/login" replace />

  return children
}
```

### React Router loader guard
```tsx
export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request)
  if (!session) throw redirect('/login')
  return session
}
```

### Astro middleware guard
```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  const protectedPaths = ['/dashboard', '/settings']
  if (protectedPaths.some(p => url.pathname.startsWith(p))) {
    const session = cookies.get('session')
    if (!session) return redirect('/login')
  }
  return next()
})
```

## Step 5: Self-Check

- [ ] Verified router library and version before writing code
- [ ] Routes match project's existing pattern (file-based vs. config-based)
- [ ] Dynamic routes have proper data loading (loaders, getStaticPaths, server components)
- [ ] Navigation uses the router's `<Link>` component (not raw `<a>` in SPAs)
- [ ] Search params used for filterable/shareable state (not React state)
- [ ] Error boundaries/pages exist for route errors
- [ ] Protected routes redirect unauthenticated users
- [ ] 404 handling exists (catch-all route or `not-found` page)
- [ ] Astro: static content in `.astro`, interactive parts in islands only
