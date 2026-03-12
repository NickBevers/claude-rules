# Legal & Compliance Rules

## Cookie Consent

- Cookie banner required for EU visitors (ePrivacy Directive + GDPR)
- Must be opt-in (not pre-checked). No tracking before consent.
- Categories: Necessary (no consent needed), Analytics, Marketing, Preferences
- Store consent proof (timestamp, categories, version)
- Respect `Do Not Track` header as signal (not legally binding but good practice)

## GDPR Basics

- Privacy policy page required. Must state: what data, why, how long, who processes it.
- Right to access, correct, delete — implement data export and account deletion
- Email collection: double opt-in for newsletters
- Data minimization: only collect what you actually use
- Cookie policy must list every cookie, its purpose, and duration

## Accessibility Legal

- WCAG 2.1 AA is the practical standard (ADA in US, EAA in EU from 2025)
- Focus: keyboard navigation, screen reader support, color contrast, alt text
- See `testing.md` accessibility checklist for implementation details

## Open Source Compliance

- MIT, Apache 2.0, BSD: safe for any use
- GPL/LGPL: copyleft — cannot use in proprietary SaaS without releasing source
- AGPL: network copyleft — even server-side use triggers disclosure
- Always check transitive dependencies: `bun pm ls` or license-checker tools
