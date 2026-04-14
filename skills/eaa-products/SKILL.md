---
name: eaa-products
description: EAA product- and service-specific rules beyond WCAG. Ecommerce, consumer banking, passenger transport booking, e-readers/e-books, ticketing machines, emergency comms. Triggers on "checkout", "payment flow", "banking app", "e-commerce accessibility", "e-book accessibility", "ticketing", "travel booking", "self-service terminal", "EAA product", "EAA service".
allowed-tools: Read, Glob, Grep, Edit
---

# EAA Products & Services — Beyond WCAG

EAA Directive 2019/882 Article 2 + Annex I. For certain products and services, WCAG compliance alone is not enough — additional sector rules apply. Scope of this skill is the *service* side: websites, mobile apps, e-reader software, booking flows, self-service UIs.

Always load `rules/accessibility.md` + the relevant POUR skill(s) first (this is additive).

## Who is in scope (Article 2)

- Consumer **e-commerce** services (B2C product & service sales online).
- Consumer **banking** services (account, payment, card, loan interfaces).
- Passenger **transport** services (booking, ticketing, real-time info) for air, bus, rail, waterborne.
- **E-books** and dedicated e-reader software.
- **Electronic communications services** (voice, video, messaging) and access to **audiovisual media services** (player/EPG).
- Self-service **terminals** serving any of the above (ATMs, ticket machines, check-in kiosks) — rules apply to their software/UI.
- **Emergency communications** to the single European emergency number 112.

Micro-enterprises providing services are exempt; manufacturers are not.

## Ecommerce (Annex I §IV)

Beyond WCAG 2.2 AA:

- Information about the accessibility of **products on sale** must be provided (e.g. product page lists accessibility features of the physical product).
- **Identification methods** (login, payment confirmation) must be perceivable, operable, understandable, robust — see `eaa-understandable` SC 3.3.8 especially. No cognitive-test-only auth (no puzzle CAPTCHA without alt).
- **Security features** (SCA/3DS step-up, OTP): alt channels (SMS + app + fallback), timeouts extendable (≥20h or user-adjustable).
- Checkout flow: preserve data on browser back; allow review before purchase (SC 3.3.4).
- Receipts / order confirmations: in an accessible, reusable format (HTML or tagged PDF, not just an image).
- Cookie / consent banners must not trap focus or block core content; "reject all" parity with "accept all" (also a GDPR rule — see `rules/compliance.md`).

## Banking (Annex I §V)

- All methods of authentication + signing: WCAG-compliant alternatives. Typical = passkey, biometric, or hardware-token fallback to device PIN.
- Auto-generated transaction text/statements in an accessible format (HTML first, tagged PDF second).
- Time limits: user can extend or disable where not essential.
- Reading level: explained without jargon; glossary for defined terms (SC 3.1.5 AAA is not required, but banks typically aim for lower secondary education level).

## Passenger Transport Booking (Annex I §VI)

- **Real-time travel information** (delays, cancellations, platforms) must be perceivable in multiple modes — text + audio + visual.
- **Seat selection maps**: keyboard operable, each seat labelled (row + column + accessibility attributes), alternative list view.
- **Ticket purchase**: prices, conditions, change/refund rules available as text (not only in a PDF). Save ticket as accessible PDF or HTML, not image.
- **Journey steps** (check-in, boarding) — mobile flows for visually impaired users, SMS/email fallback.

## E-books / E-readers (Annex I §IV service + Annex II guidance)

- Content + software + metadata accessible together — the EPUB must use EPUB Accessibility 1.1 (or equivalent), with:
  - Semantic structure (proper headings, lists, tables).
  - Text-to-speech compatible: no DRM that blocks AT from reading text.
  - Image descriptions in alt / long-description.
  - Metadata declares accessibility features (`schema:accessibilityFeature`, `schema:accessibilityHazard`).
- Reading app UI itself: WCAG 2.2 AA, plus user-adjustable font size, font family, spacing, brightness, reading mode.
- No reflow lock to page-image layout when text is available.

## Self-service Terminals (for reference — physical, but the UI counts)

If your project includes a kiosk/ATM UI, extra rules apply:
- Multi-modal: audio + visual + tactile output.
- Personal headphone jack / private audio for any spoken output.
- Reachable controls; no touch-only — physical keys + screen-reader mode toggle.
- Timeout warnings with extend.

## Emergency Communications (112)

- Real-time text (RTT) alongside voice where the service supports voice.
- Total conversation (voice + video + text simultaneous) where video supported.
- Priority routing preserves the accessibility metadata.

## Common Problems specific to these products

- "Add to basket" icon-only button with no accessible name (ecommerce).
- 3DS OTP field with 30s timeout, no extend.
- Seat map rendered as an SVG with no text list alternative.
- Train delay announcement shown visually only — no polite live region or SMS fallback.
- E-book sold as DRM'd PDF image scan — no text layer, screen reader reads nothing.
- Checkout returns to cart on validation error and loses entered address.
- Consent banner sticky over focused field (also a 2.4.11 violation).

## Detection Patterns

```bash
# OTP / 2FA components — audit each
rg -li 'otp|2fa|mfa|stepup|3ds|challenge' -g 'src/**/*'
# Seat maps / interactive SVG maps
rg -li 'seat|aisle|coach|carriage' -g 'src/**/*'
# Checkout / basket flows
rg -li 'checkout|basket|cart|payment' -g 'src/**/*'
# Downloads that should be accessible (receipts, tickets, statements)
rg -i 'application/pdf|download=".*\.pdf' -g 'src/**/*'
```

## Fix Patterns

**Checkout preserves data on validation error:**
```tsx
{/* a11y [EAA Annex I §IV + WCAG 3.3.4]: preserve user input across validation server round-trip */}
<form method="post" action="/checkout" onSubmit={onSubmit}>
  <input name="address1" defaultValue={serverState?.address1 ?? ""} />
  {/* ... */}
</form>
```

**OTP with extendable timer:**
```tsx
{/* a11y [EAA Annex I §V + WCAG 2.2.1]: user can request a new code without losing context */}
<p role="status" aria-live="polite">
  Code expires in <time dateTime={`PT${secs}S`}>{secs}s</time>
</p>
<button type="button" onClick={resend} disabled={secs > 30}>Send a new code</button>
```

**Seat map with list alternative:**
```tsx
{/* a11y [EAA Annex I §VI + WCAG 1.1.1]: provide text list equivalent to the visual map */}
<section aria-labelledby="seat-map-h">
  <h2 id="seat-map-h">Choose a seat</h2>
  <svg role="img" aria-describedby="seat-list-h">{/* visual */}</svg>
  <details>
    <summary id="seat-list-h">List view of available seats</summary>
    <ul>
      {seats.map((s) => (
        <li key={s.id}>
          <button type="button" aria-pressed={selected === s.id} onClick={() => pick(s.id)}>
            Row {s.row} seat {s.col}{s.accessible ? " (accessible)" : ""}
          </button>
        </li>
      ))}
    </ul>
  </details>
</section>
```

**Real-time transport info:**
```tsx
{/* a11y [EAA Annex I §VI + WCAG 4.1.3]: delay announcements reach screen readers */}
<p role="status" aria-live="polite">
  Train to {dest}: {delayMin > 0 ? `delayed by ${delayMin} minutes` : "on time"}. Platform {platform}.
</p>
```

**Accessible receipt / statement:**
```tsx
{/* a11y [EAA Annex I §IV + §V]: HTML receipt first, tagged PDF as alternative format */}
<a href={`/orders/${id}/receipt.html`}>View receipt (web)</a>
<a href={`/orders/${id}/receipt.pdf`} type="application/pdf">Download receipt (tagged PDF)</a>
```

## Reporting

```
## EAA product-specific fixes
- src/pages/checkout.astro:40 — EAA §IV / WCAG 3.3.4 — error state preserves address fields
- src/components/OtpInput.tsx:18 — EAA §V / WCAG 2.2.1 — resend code + live countdown announced
- src/pages/train-select.astro:62 — EAA §VI — added list-view alternative to seat-map SVG
- content/receipts/*.pdf — flagged: need structure tags (PDF/UA) before shipping
```

Note upstream-only items (DRM, third-party banking widgets, airline booking engines) as compliance risks the user's team must escalate — this skill can't fix them from the client code alone.
