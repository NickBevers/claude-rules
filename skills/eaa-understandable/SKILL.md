---
name: eaa-understandable
description: EAA / EN 301 549 / WCAG 2.2 AA — Understandable (POUR axis 3). Language, readable copy, predictable UI, input assistance, error identification. Triggers on "lang attribute", "error message", "form validation", "input assistance", "autocomplete", "consistent nav", "predictable", "WCAG 3.", "EAA understandable", "accessible authentication".
allowed-tools: Read, Glob, Grep, Edit
---

# EAA Understandable — POUR Axis 3

Covers **WCAG Principle 3 / EN 301 549 §9.3**. Content readable, UI predictable, input errors recoverable.

Always load `rules/accessibility.md` first.

## Success Criteria Checklist (AA)

| SC | Name | What must be true |
|---|---|---|
| 3.1.1 (A) | Language of page | `<html lang="en">` (or whatever). Correct BCP-47 code. |
| 3.1.2 (AA) | Language of parts | Foreign-language phrases wrapped `<span lang="fr">bonjour</span>`. |
| 3.2.1 (A) | On focus | Focus alone never triggers context change (navigation, form submit, new window). |
| 3.2.2 (A) | On input | Changing a select/checkbox doesn't auto-submit or navigate unless warned. |
| 3.2.3 (AA) | Consistent navigation | Main nav in the same relative order across pages. |
| 3.2.4 (AA) | Consistent identification | Same icon / label for the same function everywhere. |
| 3.2.6 (A, 2.2) | Consistent help | Help link (contact, chat, FAQ) in the same relative location across pages where it appears. |
| 3.3.1 (A) | Error identification | Errors identified in text — not just a red border. |
| 3.3.2 (A) | Labels or instructions | Every input has a label or instruction, visible by default. |
| 3.3.3 (AA) | Error suggestion | Suggest a fix when possible ("Did you mean @gmail.com?"). |
| 3.3.4 (AA) | Error prevention (legal/financial/data) | Reversible, checkable, or confirmable submissions for legal/finance/data actions. |
| 3.3.7 (A, 2.2) | Redundant entry | Don't force re-entry of info already provided in the same session (use `autocomplete`, prefill). |
| 3.3.8 (AA, 2.2) | Accessible authentication (minimum) | Auth steps must not require a cognitive function test (remembering chars, puzzle CAPTCHA) without an alternative. |

## Common Problems

- `<html>` with no `lang` (or worse, `lang=""`).
- Quotes in French / Spanish inline with no `lang` wrapper — screen reader reads in wrong accent.
- `<select>` with `onChange={() => location.href = v}` — focus-change submits form.
- Error message in `aria-live="polite"` but the field's `aria-invalid="true"` never set, and no `aria-describedby` linking the message.
- Placeholder-only labels. They vanish on focus and fail contrast.
- Login form requires solving a visual puzzle, no alternative (fails 3.3.8).
- Stripe-style card forms that require exactly matching the same data across steps with no prefill.
- Billing vs. shipping address — no "same as billing" checkbox.
- Password rules hidden until after you submit.

## Pitfalls

- Language codes are BCP-47, not ISO-639 alone: `pt-BR` not just `pt`. Script subtags matter (`zh-Hant`).
- `aria-live="assertive"` interrupts — only use for truly urgent alerts (auth failure, session lost). Errors on individual fields → `aria-live="polite"` or associate via `aria-describedby` on the input.
- `<fieldset>` + `<legend>` is the only accessible way to group radio buttons. Not a `<div>` with a label above.
- Disabling the submit button until the form is valid fails if you never tell AT why (use `aria-describedby` pointing to the rules).
- `inputmode` helps mobile keyboards but does NOT replace `type`. Use both (`type="email" inputmode="email"`).
- Auto-capitalize / auto-correct on email / username fields → `autocapitalize="off"` + `autocorrect="off"`.
- Magic links, passkeys (WebAuthn), OAuth, and copy-paste friendly fields all satisfy SC 3.3.8 as alternatives to memorize-and-type authentication — passkeys are the cleanest.

## Detection Patterns

```bash
# Missing lang on html
rg -l '<html' -g '*.{astro,html}' | xargs rg -L 'lang='
# Placeholder used as label
rg '<input(?![^>]*id=)[^>]*placeholder=' --pcre2 -g '*.{astro,tsx,jsx,html}'
# Select that navigates on change
rg 'onChange.*location' -g '*.{tsx,jsx,astro}'
# Missing autocomplete on name/email/password inputs
rg '<input[^>]*type="(email|password|tel)"(?![^>]*autocomplete)' --pcre2 -g '*.{astro,tsx,jsx,html}'
# CAPTCHA without alternative
rg -i 'captcha|recaptcha|hcaptcha' -g 'src/**/*'
# Billing/shipping without "same as" option
rg -i 'billing|shipping' -g 'src/**/*.astro' -A5 | rg -i 'same as' -c
```

## Fix Patterns

**Page language:**
```astro
---
// a11y [WCAG 3.1.1]: BCP-47 tag for screen-reader pronunciation
---
<html lang="en-GB">
```

**Inline foreign phrase:**
```html
<!-- a11y [WCAG 3.1.2]: switch pronunciation for this phrase only -->
<p>The French term is <span lang="fr">pâte à choux</span>.</p>
```

**Label + input + error wiring:**
```tsx
{/* a11y [WCAG 3.3.1 + 3.3.2 + 1.3.1]: label associated; error text programmatic */}
<label htmlFor="email">Email address</label>
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  inputMode="email"
  autoCapitalize="off"
  required
  aria-invalid={!!error || undefined}
  aria-describedby={error ? "email-err" : "email-hint"}
/>
<p id="email-hint">We'll never share your address.</p>
{error && (
  <p id="email-err" role="alert">
    <IconAlertCircle aria-hidden="true" /> {error}
  </p>
)}
```

**Radio group:**
```tsx
{/* a11y [WCAG 1.3.1 / 3.3.2]: <fieldset>/<legend> names the whole group */}
<fieldset>
  <legend>Delivery speed</legend>
  <label><input type="radio" name="speed" value="std" /> Standard (3–5 days)</label>
  <label><input type="radio" name="speed" value="exp" /> Express (1 day)</label>
</fieldset>
```

**Accessible authentication (passkey first, no cognitive test):**
```tsx
{/* a11y [WCAG 3.3.8 / EAA §9.3.3.8]: passkey + magic-link avoid cognitive function test */}
<button type="button" onClick={startPasskey}>Sign in with a passkey</button>
<button type="button" onClick={emailLink}>Email me a sign-in link</button>
```

**No focus-triggered navigation:**
```tsx
{/* a11y [WCAG 3.2.1]: navigation requires explicit Enter / click, not focus */}
<select onChange={setValue}>
  {/* user chooses then submits via a button */}
</select>
<button type="submit">Go</button>
```

**Redundant entry avoidance:**
```tsx
{/* a11y [WCAG 3.3.7]: prefill shipping with billing unless user opts out */}
<label>
  <input type="checkbox" checked={same} onChange={(e) => setSame(e.currentTarget.checked)} />
  Shipping address is the same as billing
</label>
```

## Reporting

```
## Understandable fixes
- src/layouts/Base.astro:1 — WCAG 3.1.1 — added lang="en-GB" to <html>
- src/components/LoginForm.tsx:22 — WCAG 3.3.8 — added passkey option; puzzle CAPTCHA now optional fallback
- src/components/Checkout.tsx:88 — WCAG 3.3.7 — "same as billing" checkbox prefills shipping fields
```
