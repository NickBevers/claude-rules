---
name: data-consolidation
description: Migrate, merge, and transform data across sources and formats. Triggers on "migrate data", "data migration", "consolidate data", "merge databases", "import data", "export data", "ETL", "data transform".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch
---

# Data Consolidation — Migration & Transformation

Safely migrate, merge, and transform data across sources. Zero data loss, full audit trail.

## Step 1: Map Source & Target

Source format (CSV, JSON, SQL, API, spreadsheet, DB), target destination, volume (script vs. streaming), relationships/foreign keys, duplicate merge strategy.

## Step 2: Schema Analysis (parallel agents)

**Agent A — "Source Analyzer"**: Map fields/types/constraints, identify data quality issues (nulls, inconsistent formats, orphans), flag encoding issues, count records per entity.

**Agent B — "Target Mapper"**: Map source to target schema, identify transformations (type conversions, renames, merges, splits), flag dropped fields with reasons, identify new fields needing defaults.

## Step 3: Transformation Plan

For each field: source, target, transform logic, edge cases. Document: 1:1 mappings, transformations with exact logic, dropped fields with justification, generated fields, relationship mapping (old IDs to new).

## Step 4: Build Migration Script

Key patterns: dry run mode (default, print what would change), transaction-wrapped (all-or-nothing), idempotent (upserts not inserts), ID mapping table (old to new), batch processing (chunks of 1000), progress logging.

## Step 5: Validation

Verify: record counts match, referential integrity preserved, spot checks (10 random records), edge cases (nulls, empty strings, max-length), encoding (non-ASCII), rollback tested.

## Step 6: Execute

Backup target, run dry run and review, run real migration in transaction, run validation, keep source data 30+ days.

## Rules

- ALWAYS dry run first — never write directly on first attempt
- ALWAYS backup before migrating
- ALWAYS use transactions — no partial migrations
- NEVER delete source data until migration is verified
- NEVER assume data is clean — validate everything with Zod
- Log every transformation decision for audit
