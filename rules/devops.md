---
paths:
  - "**/Dockerfile*"
  - "**/docker-compose*"
  - "**/.github/**"
  - "**/*.yml"
  - "**/*.yaml"
  - "**/deploy*"
  - "**/coolify*"
---

# DevOps Rules

## Deployment

- Coolify on Hetzner VPS (CAX11 ARM64) or Docker Compose on any VPS
- Single container: API + frontend (same-origin)
- Health check: `GET /api/v1/health`

## Docker

- Multi-stage builds. Slim/distroless base. Pin versions (no `latest`).
- `.dockerignore`: node_modules, .env, .git, test files
- Non-root user in production
- Secrets via env vars or Docker secrets — never in image/Dockerfile

## CI/CD

- Pipeline: lint -> test -> build -> deploy
- Tests against real PostgreSQL (not SQLite/mocks)
- Image tagged: git SHA + `latest`. Deploy from main only.
- Rollback: redeploy previous tag

## Database Ops

- PostgreSQL in separate container. Persistent volume.
- Drizzle Kit migrations. Never auto-migrate in production without review.
- Backups: 7 daily, 4 weekly, 3 monthly. Test restores periodically.

## Logging

- Structured JSON. Levels: error, warn, info, debug (debug off in prod).
- Include: request ID, user ID, route in context.
