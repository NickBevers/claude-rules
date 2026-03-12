---
name: threat-detection
description: Threat modeling and security hardening for web applications. Triggers on "threat model", "security review", "threat detection", "harden security", "security assessment", "attack surface".
allowed-tools: Agent, Read, Glob, Grep, WebSearch
---

# Threat Detection — Security Assessment & Hardening

Systematic threat modeling using STRIDE methodology. Identify attack vectors, assess risk, recommend mitigations.

## Step 1: Map Attack Surface

Read the codebase and identify:
- All entry points (API routes, form handlers, file uploads, webhooks)
- Authentication and session management
- Data stores and what's in them (PII, credentials, financial)
- Third-party integrations and their trust boundaries
- Admin/privileged interfaces
- Public vs. authenticated surfaces

## Step 2: STRIDE Analysis (parallel agents)

**Agent A — "Attacker Mindset"**:
Analyze each entry point for:
- **S**poofing: Can someone impersonate a user/service?
- **T**ampering: Can data be modified in transit/storage?
- **R**epudiation: Can actions be performed without audit trail?
- **I**nformation Disclosure: Can sensitive data leak?
- **D**enial of Service: Can the service be overwhelmed?
- **E**levation of Privilege: Can a user gain unauthorized access?

**Agent B — "Defense Auditor"**:
Check existing defenses:
- Auth: Argon2id? Session rotation? Account lockout?
- Input: Zod validation on all endpoints? File type/size limits?
- Output: Escaping in templates? CSP headers? No stack traces?
- Network: HTTPS only? Security headers? Rate limiting?
- Data: Encryption at rest? Backup encryption? PII minimization?
- Logging: Auth events logged? Request IDs? No sensitive data in logs?

## Step 3: Risk Matrix

For each finding:

| Threat | Likelihood (1-5) | Impact (1-5) | Risk Score | Priority |
|---|---|---|---|---|
| [description] | [score] | [score] | [L×I] | Critical/High/Medium/Low |

## Step 4: Report

```
# Threat Assessment Report

## Attack Surface Summary
[Entry points, trust boundaries, data classification]

## Critical Findings
[Immediate action required — active vulnerabilities]

## High Risk
[Should fix before production — exploitable with effort]

## Medium Risk
[Fix in next sprint — defense in depth gaps]

## Low Risk
[Track and address — theoretical or low-impact]

## Recommended Security Hardening
[ ] Actionable checklist with file references
```

## Common Web App Threats (quick reference)

- **XSS**: Unescaped user content in HTML. Fix: CSP, output encoding.
- **CSRF**: State-changing requests without token. Fix: SameSite cookies, CSRF tokens.
- **SQLi**: Raw queries with user input. Fix: ORM/parameterized queries.
- **IDOR**: Direct object references without ownership check. Fix: Authorization on every query.
- **Broken Auth**: Weak passwords, no lockout, session fixation. Fix: Argon2id, rotation, rate limiting.
- **SSRF**: Server making requests to user-controlled URLs. Fix: Allowlist, no internal network access.
- **Path Traversal**: File operations with user input. Fix: Allowlist paths, no `..` in paths.

## Rules

- Every finding must reference specific code (file:line)
- No theoretical-only findings — must be exploitable in this codebase
- Prioritize by actual risk, not theoretical severity
- Never suggest security through obscurity
- No icons or decorative elements in reports
