---
name: workflow-optimizer
description: Analyze and optimize developer workflows, CI/CD pipelines, and team processes. Triggers on "optimize workflow", "speed up build", "improve pipeline", "developer experience", "DX", "optimize process".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Workflow Optimizer — Process & DX Improvement

Analyze development workflows for bottlenecks, waste, and automation opportunities. Evidence-based recommendations.

## Step 1: Scope

What to optimize: build/dev server, CI/CD pipeline, development workflow, code review/PR process, deployment, or all?

## Step 2: Audit (parallel agents)

**Agent A — "Build & Tooling"**: package.json scripts (redundant/missing parallel?), bundle size (tree-shaking, code splitting), dev server (HMR, cold start), dependencies (unused, duplicates, lighter alternatives), TypeScript (strict, incremental, project refs), linting (Oxlint over ESLint).

**Agent B — "Pipeline & Deployment"**: CI (parallelizable steps sequential? caching?), Docker (build cache, multi-stage, layer order), tests (slow tests, parallelizable?), deployment (zero-downtime, rollback, health checks), git (branch strategy, PR merge queue, auto-merge deps).

## Step 3: Measure & Benchmark

For each bottleneck: current duration, proposed improvement, expected gain (% or time), implementation effort.

## Step 4: Recommendations

**Quick Wins** (<30 min): Parallel flags, build caching, remove unused deps, parallelize CI steps.

**Medium Effort** (1-4h): Faster tools (Oxlint, Bun test), Docker layer caching, incremental TS builds, code splitting.

**Significant** (1+ days): Monorepo restructure, build pipeline (Turborepo/Nx), test strategy migration, staging with preview deploys.

## Step 5: Implementation

For approved changes: before/after benchmark, rollback path, documentation of changes.

## Rules

- Every recommendation must have measurable before/after
- No premature optimization — focus on actual bottlenecks
- No tool changes without checking Bun/project compatibility
- Prefer built-in/native solutions over adding dependencies
