---
paths:
  - "**/drizzle/**"
  - "**/*schema*"
  - "**/*migration*"
  - "**/*.sql"
  - "**/db/**"
  - "**/database/**"
---

# Database Rules

## Core

- PostgreSQL 16 + Drizzle ORM. No raw SQL unless perf-critical and measured.
- Define full schema upfront, even if tables populate later.

## TEXT + md5() Hash Indexes

- NEVER use VARCHAR for unbounded data (queries, URLs, user input)
- TEXT + `md5()` hash column for uniqueness:
  ```sql
  column_hash TEXT GENERATED ALWAYS AS (md5(column_name)) STORED
  ```
- UNIQUE index on hash, not raw text (btree 2704-byte limit)

## Soft Delete

- User-facing entities: `is_active = false` + `deleted_at = now()`
- ALL queries MUST filter `WHERE is_active = true` by default
- Background job handles actual deletion

## Schema Conventions

- Normalize by default — denormalize only with measured justification
- Separate tables per dimension/concern (don't overload)
- Include `created_at`, `updated_at` on all tables
- Subscription/billing columns on accounts table, not users
