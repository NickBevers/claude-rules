# DevOps Rules

## Deployment Architecture

- **Self-hosted preferred:** Docker Compose on VPS (single app container + PostgreSQL + Redis)
- **Hosted option:** Coolify on Hetzner VPS (CAX11 ARM64)
- Single container serves API + frontend (same-origin deployment)
- Both options use the same Docker image

## Docker

- Multi-stage builds: separate build and runtime stages
- Use slim/distroless base images for production
- Pin base image versions (don't use `latest`)
- `.dockerignore` must exclude: `node_modules`, `.env`, `.git`, test files
- Health check endpoint: `GET /api/v1/health`
- Non-root user in production containers

## Environment Configuration

- All configuration via environment variables
- `.env.example` documents every required variable with descriptions
- Secrets NEVER in Docker images, Dockerfiles, or docker-compose files
- Use Docker secrets or external secret management for sensitive values

## Database

- PostgreSQL 16 in a separate container (not in the app container)
- Persistent volume for PostgreSQL data
- Automated backups (pg_dump or WAL archiving)
- Migration strategy: Drizzle Kit migrations, run on startup or as a separate step
- Never run migrations automatically in production without review

## CI/CD

- Pipeline stages: lint -> test -> build -> deploy
- Linting and formatting checks run first (fast feedback)
- Tests run against a real PostgreSQL instance (not SQLite or mocks)
- Build produces a Docker image tagged with git SHA + `latest`
- Deploy only from main/production branch
- Rollback strategy: redeploy previous image tag

## Monitoring & Logging

- Structured JSON logging in production
- Log levels: error, warn, info, debug (debug disabled in production)
- Include request ID, user ID, and route in log context
- Health check endpoint for uptime monitoring
- Monitor: response times, error rates, database connection pool, disk usage

## Infrastructure

- **Hetzner** for VPS hosting (cost-effective ARM64 instances)
- **Coolify** for deployment management (self-hosted PaaS)
- PostgreSQL co-located on the same VPS for single-tenant deployments
- Separate database server for multi-tenant or high-traffic deployments

## Backup & Recovery

- Daily automated database backups
- Backup retention: 7 daily, 4 weekly, 3 monthly
- Test restore procedure periodically
- Document recovery steps in runbook

## SSL/TLS

- HTTPS everywhere — no exceptions
- Let's Encrypt for automatic certificate management (via Coolify or certbot)
- Redirect HTTP to HTTPS
- HSTS header with long max-age

## No Telemetry

- Self-hosted versions collect ZERO telemetry by default
- Any analytics must be opt-in and clearly documented
- Respect user privacy — don't phone home
