# Research Rules

## Evaluating Libraries & Tools

When evaluating a new dependency, always check:

1. **Compatibility** — Does it work with our runtime (Bun), framework (Hono/Astro/Preact), and deployment targets?
2. **Maintenance** — Last commit date, open issues, release frequency, bus factor
3. **Bundle size** — Frontend: check bundlephobia. Backend: less critical but still consider
4. **License** — Must be MIT, Apache 2.0, BSD, or similarly permissive. No GPL for SaaS.
5. **Alternatives** — Always evaluate at least 2-3 options before choosing
6. **Native alternative** — Can this be done with built-in APIs (Web APIs, Bun APIs) instead?

## Evaluating APIs

1. **Official documentation only** — Never rely on unofficial docs or community speculation
2. **Authentication method** — OAuth 2.0, API keys, or both? What scopes needed?
3. **Rate limits** — Document exact limits and design around them
4. **Data freshness** — How stale can the data be? (e.g., GSC has 1-3 day delay)
5. **Deprecation status** — Check if the API or specific endpoints are deprecated
6. **Quotas and pricing** — Free tier limits, per-request costs, daily caps
7. **Known limitations** — What CAN'T the API do? Document this prominently.

## Research Documentation

- Store research documents in `.claude/research/`
- Each research document covers one topic or decision area
- Include: context, options evaluated, pros/cons, recommendation, decision
- Cross-reference with the decisions log
- Update or mark as superseded when decisions change

## Spike / Proof of Concept Rules

- Time-box spikes (2-4 hours max for most questions)
- Define the specific question the spike must answer before starting
- Spikes produce: a finding (yes/no/it depends) + evidence (code, benchmarks, screenshots)
- Spike code is throwaway — never ship spike code directly into production

## When to Research vs. When to Decide

- **Research** when: multiple viable options exist, the choice is hard to reverse, or the team lacks experience with the technology
- **Just decide** when: options are roughly equivalent, the choice is easily reversible, or there's an obvious standard choice
- Don't research for the sake of research — if one option is clearly dominant, pick it and move on

## Documenting Findings

- Lead with the recommendation, then supporting evidence
- Include what was rejected and why
- Note any caveats or conditions under which the decision should be revisited
- Link to primary sources (official docs, GitHub repos, benchmarks)
