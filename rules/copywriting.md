---
paths:
  - "**/components/**"
  - "**/pages/**"
  - "**/layouts/**"
  - "**/content/**"
  - "**/copy*"
  - "**/text*"
  - "**/*.astro"
---

# UX Writing & Content Rules

## Labels & Buttons

- Specific verb+object: "Save draft", "Send invoice", "Delete account" — never "OK", "Submit", "Click here"
- Sentence case, not Title Case (except proper nouns)
- Keep labels under 3 words when possible

## Error Messages

Formula: What happened + Why + How to fix
- Good: "Email already registered. Try signing in or use a different email."
- Bad: "Error occurred. Please try again."

## Empty States

- Empty states are onboarding opportunities — guide user to first action
- Include: what this area will contain, one clear CTA

## Microcopy

- Placeholders are hints, not labels. Always use a visible `<label>`.
- Confirmation dialogs: describe the consequence, not the action
- Prefer undo over confirmation when possible
- Loading: describe what's happening ("Saving your changes..."), not "Loading..."

## No Decorative Text

- No emojis in UI copy
- Icons (Tabler by default) are fine where they aid comprehension — no purely decorative icons
- Use realistic content lengths in prototypes — not "Lorem ipsum"
