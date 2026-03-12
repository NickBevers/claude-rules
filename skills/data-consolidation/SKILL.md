---
name: data-consolidation
description: Migrate, merge, and transform data across sources and formats. Triggers on "migrate data", "data migration", "consolidate data", "merge databases", "import data", "export data", "ETL", "data transform".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# Data Consolidation — Migration & Transformation

Safely migrate, merge, and transform data across sources. Zero data loss, full audit trail.

## Step 1: Map Source & Target

- **Source(s)**: What format? (CSV, JSON, SQL dump, API, spreadsheet, another database)
- **Target**: Where does it need to go? (PostgreSQL, JSON files, API, new schema)
- **Volume**: How many records? (determines approach: script vs. streaming)
- **Relationships**: Are there foreign keys / references to preserve?
- **Duplicates**: Merge strategy? (latest wins, manual review, dedup rules)

## Step 2: Schema Analysis (parallel agents for complex migrations)

**Agent A — "Source Analyzer"**:
- Map all fields, types, constraints
- Identify data quality issues (nulls, inconsistent formats, orphaned references)
- Flag encoding issues (UTF-8, special characters)
- Count records per entity, identify largest tables

**Agent B — "Target Mapper"**:
- Map source fields to target schema
- Identify transformations needed (type conversions, field renames, merges, splits)
- Flag fields with no target (document what's dropped and why)
- Identify new fields that need defaults or generation

## Step 3: Transformation Plan

For each field mapping:
```
Source: users.full_name (VARCHAR)
Target: users.first_name + users.last_name (TEXT)
Transform: Split on first space. If no space, all goes to first_name.
Edge cases: Multiple spaces, prefixes (Dr., Mr.), suffixes (Jr., III)
```

Document:
- Fields that map 1:1 (no transformation)
- Fields that need transformation (with exact logic)
- Fields being dropped (with justification)
- New fields being generated (with default/logic)
- Relationship mapping (old IDs → new IDs)

## Step 4: Build Migration Script

```typescript
// migration-[date]-[description].ts
// ALWAYS: Dry run first, transaction-wrapped, idempotent

const migrate = async (dryRun = true) => {
  const tx = await db.transaction();
  try {
    // 1. Read source
    // 2. Transform
    // 3. Validate (Zod schemas)
    // 4. Insert/upsert to target
    // 5. Verify counts match
    if (dryRun) {
      await tx.rollback();
      console.log('Dry run complete. No changes made.');
    } else {
      await tx.commit();
    }
  } catch (e) {
    await tx.rollback();
    throw e;
  }
};
```

Key patterns:
- **Dry run mode**: Always default. Print what would change without changing it.
- **Transaction-wrapped**: All-or-nothing. No partial migrations.
- **Idempotent**: Running twice produces same result (use upserts, not inserts).
- **ID mapping table**: Keep a `migration_id_map` table linking old→new IDs.
- **Batch processing**: For large datasets, process in chunks of 1000.
- **Progress logging**: Log every 1000 records with count/total.

## Step 5: Validation

Before running for real:
- [ ] Record counts match (source vs. target per entity)
- [ ] Referential integrity preserved (no orphaned foreign keys)
- [ ] Sample spot checks (10 random records compared field-by-field)
- [ ] Edge cases handled (nulls, empty strings, max-length values)
- [ ] Encoding correct (test with non-ASCII characters)
- [ ] Rollback tested (can we undo this migration?)

## Step 6: Execute

1. Backup target database before migration
2. Run dry run, review output
3. Run real migration in transaction
4. Run validation checks
5. Keep source data for 30+ days after successful migration

## Rules

- ALWAYS dry run first — never write directly on first attempt
- ALWAYS backup before migrating
- ALWAYS use transactions — no partial migrations
- NEVER delete source data until migration is verified
- NEVER assume data is clean — validate everything with Zod
- Log every transformation decision for audit
- No icons or decorative elements in reports
