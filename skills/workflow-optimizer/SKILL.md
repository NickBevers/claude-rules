---
name: workflow-optimizer
description: Analyze and optimize developer workflows, CI/CD pipelines, and team processes. Triggers on "optimize workflow", "speed up build", "improve pipeline", "developer experience", "DX", "optimize process".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Workflow Optimizer — Process & DX Improvement

Analyze development workflows for bottlenecks, waste, and automation opportunities. Evidence-based recommendations.

## Step 1: Scope

What to optimize:
- Build/dev server performance?
- CI/CD pipeline speed?
- Development workflow (file structure, tooling, scripts)?
- Code review / PR process?
- Deployment process?
- All of the above?

## Step 2: Audit (parallel agents)

**Agent A — "Build & Tooling"**:
- `package.json` scripts: redundant steps? missing parallel execution?
- Bundle size: tree-shaking working? code splitting opportunities?
- Dev server: HMR working? cold start time? unnecessary watchers?
- Dependencies: unused deps? duplicates? lighter alternatives?
- TypeScript: strict mode? incremental compilation? project references?
- Linting: Oxlint over ESLint (10-100x faster)? parallel execution?

**Agent B — "Pipeline & Deployment"**:
- CI pipeline: parallelizable steps running sequentially? caching missing?
- Docker: build cache utilized? multi-stage optimized? layer ordering?
- Test suite: slow tests? parallelizable? unnecessary integration tests?
- Deployment: zero-downtime? automated rollback? health checks?
- Git: branch strategy efficient? PR merge queue? auto-merge for deps?

## Step 3: Measure & Benchmark

For each bottleneck:
- Current duration/cost
- Proposed improvement
- Expected improvement (percentage or absolute time)
- Implementation effort (quick win / medium / significant)

## Step 4: Recommendations

### Quick Wins (< 30 min to implement)
- Add `--parallel` flags to scripts
- Enable build caching (Bun/Turbo/CI cache)
- Remove unused dependencies
- Parallelize CI steps that don't depend on each other

### Medium Effort (1-4 hours)
- Switch to faster tools (Oxlint, Bun test)
- Optimize Docker layer caching
- Add incremental TypeScript builds
- Implement code splitting

### Significant Changes (1+ days)
- Restructure monorepo with project references
- Implement build pipeline (Turborepo/Nx)
- Migrate test strategy (fewer E2E, more unit)
- Set up staging environment with preview deploys

## Step 5: Implementation

For approved changes, implement with:
- Before/after benchmark
- Rollback path if performance regresses
- Documentation of what changed and why

## Rules

- Every recommendation must have a measurable before/after
- No premature optimization — focus on actual bottlenecks
- No tool changes without checking Bun/project compatibility
- Prefer built-in/native solutions over adding dependencies
- No icons or decorative elements in reports
