---
name: threat-detection
description: Threat modeling and security hardening for web applications. Triggers on "threat model", "security review", "threat detection", "harden security", "security assessment", "attack surface".
allowed-tools: Agent, Read, Glob, Grep, WebSearch
---

# Threat Detection — Security Assessment & Hardening

Systematic threat modeling using STRIDE. Identify attack vectors, assess risk, recommend mitigations.

## Step 1: Map Attack Surface

Read codebase and identify: all entry points (API routes, forms, uploads, webhooks), auth/session management, data stores and sensitivity (PII, credentials, financial), third-party integrations and trust boundaries, admin interfaces, public vs. authenticated surfaces.

## Step 2: STRIDE Analysis (parallel agents)

**Agent A — "Attacker Mindset"**: Analyze each entry point for Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.

**Agent B — "Defense Auditor"**: Check existing defenses — Auth (Argon2id, session rotation, lockout), Input (Zod validation, file limits), Output (escaping, CSP, no stack traces), Network (HTTPS, security headers, rate limiting), Data (encryption at rest, PII minimization), Logging (auth events, request IDs, no sensitive data).

## Step 3: Risk Matrix

For each finding: Threat, Likelihood (1-5), Impact (1-5), Risk Score (L x I), Priority (Critical/High/Medium/Low).

## Step 4: Report

Structure: Attack Surface Summary, Critical Findings (immediate action), High Risk (fix before prod), Medium Risk (next sprint), Low Risk (track), Recommended Hardening Checklist with file references.

## Common Web App Threats

XSS (fix: CSP, output encoding), CSRF (fix: SameSite cookies, tokens), SQLi (fix: ORM/parameterized), IDOR (fix: auth on every query), Broken Auth (fix: Argon2id, rotation, rate limiting), SSRF (fix: allowlist), Path Traversal (fix: allowlist paths).

## Rules

- Every finding must reference specific code (file:line)
- No theoretical-only findings — must be exploitable in this codebase
- Prioritize by actual risk, not theoretical severity
- Never suggest security through obscurity
