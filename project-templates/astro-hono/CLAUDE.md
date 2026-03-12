# Project: [PROJECT NAME]

## Overview

[1-2 sentences: what this project is and who it's for.]

## Stack

- **Runtime:** Bun
- **Backend:** Hono on Bun (same-origin: API + static + SSR from single process)
- **Frontend:** Astro 6 + Preact (islands architecture)
- **Database:** PostgreSQL 16 + Drizzle ORM
- **Styling:** CSS Modules
- **State:** Nanostores (`@nanostores/preact`)
- **Icons:** Tabler Icons (`@tabler/icons-preact`)
- **Charts:** VisX (via `preact/compat`)

## Architecture

- Hono serves everything: API (`/api/v1/*`), Astro static (`dist/client/`), SSR (server islands).
- `serveStatic` from `hono/bun` for static assets. Catch-all forwards to Astro SSR handler.
- Session cookies: HTTP-only, Secure, SameSite=Strict. No CORS. No CSRF middleware.
- Marketing pages: static output. App pages: server islands.

## Database Conventions

- TEXT + md5() hash indexes for unbounded text (never VARCHAR).
- Soft delete: `is_active` + `deleted_at`. All queries filter `WHERE is_active = true`.
- Ownership through JOINs: `projects.account_id -> accounts.owner_id -> users.id`.
- Subscription columns on `accounts`, not `users`.

## Deployment

- Docker Compose: single app container + PostgreSQL + Redis.
- Coolify on Hetzner (CAX11 ARM64) or any VPS.
- Health check: `GET /api/v1/health`.

## Current Phase

[What phase. What's in scope.]

## Known API Limitations

[Document any third-party API constraints relevant to this project.]
