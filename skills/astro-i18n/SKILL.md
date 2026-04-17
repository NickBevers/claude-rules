---
name: astro-i18n
description: Implement internationalization in Astro projects with locale routing, content translation, and RTL support. Triggers on "astro i18n", "internationalization", "multilingual", "translate astro", "locale routing", "multi-language site".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro i18n — Multilingual Sites

Astro has built-in i18n routing (Astro 4+). Use it instead of third-party i18n libraries.

## Step 1: Configure Routing

```ts
// astro.config.ts
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'fr', 'de'],
    routing: {
      prefixDefaultLocale: false, // / = English, /nl/ = Dutch
    },
    fallback: { nl: 'en', fr: 'en', de: 'en' },
  },
})
```

With `prefixDefaultLocale: false`: `/about` = English, `/nl/about` = Dutch.

## Step 2: Page Structure

```
src/pages/
  index.astro          → /
  about.astro          → /about
  nl/
    index.astro        → /nl/
    about.astro        → /nl/about
```

### Layout with Locale

```astro
---
import { getLocaleByPath } from 'astro:i18n'
const locale = getLocaleByPath(Astro.url.pathname)
const { title, description } = Astro.props
---
<html lang={locale}>
<head>
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <link rel="alternate" hreflang="en" href={getAbsoluteUrl('en')} />
  <link rel="alternate" hreflang="nl" href={getAbsoluteUrl('nl')} />
  <link rel="alternate" hreflang="x-default" href={getAbsoluteUrl('en')} />
</head>
<body><slot /></body>
</html>
```

## Step 3: Translation System

Astro has no built-in translation runtime — build a lightweight one:

```ts
// src/i18n/translations.ts
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'cta.getStarted': 'Get Started',
    'footer.copyright': '© {year} Company',
  },
  nl: {
    'nav.home': 'Home',
    'nav.about': 'Over ons',
    'cta.getStarted': 'Aan de slag',
    'footer.copyright': '© {year} Bedrijf',
  },
} as const

type Locale = keyof typeof translations
type TranslationKey = keyof typeof translations['en']

export function t(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? translations['en'][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}
```

### In Islands

Pass locale as prop from Astro — don't read URL client-side:

```astro
<SearchBar client:load locale={getLocale(Astro.url.pathname)} />
```

## Step 4: Content Collections per Locale

```ts
// src/content.config.ts
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    locale: z.enum(['en', 'nl', 'fr']),
  }),
})
```

```
src/content/blog/
  en/hello-world.md     # locale: en
  nl/hello-world.md     # locale: nl (same slug, different locale)
```

Query: `await getCollection('blog', ({ data }) => data.locale === locale)`

## Step 5: Language Switcher

```astro
---
const locales = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
]

function getLocalizedPath(locale: string): string {
  const segments = Astro.url.pathname.split('/').filter(Boolean)
  const currentLocale = locales.find(l => l.code === segments[0])
  if (currentLocale) segments.shift()
  if (locale === 'en') return `/${segments.join('/')}` || '/'
  return `/${locale}/${segments.join('/')}`
}
---
<nav aria-label="Language">
  <ul role="list">
    {locales.map(({ code, label }) => (
      <li>
        <a href={getLocalizedPath(code)} hreflang={code} lang={code}
          aria-current={getLocale(Astro.url.pathname) === code ? 'true' : undefined}>
          {label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

## Step 6: SEO

```astro
<head>
  {locales.map(({ code }) => (
    <link rel="alternate" hreflang={code}
      href={new URL(getLocalizedPath(code), Astro.site).href} />
  ))}
  <link rel="alternate" hreflang="x-default"
    href={new URL(getLocalizedPath('en'), Astro.site).href} />
  <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).href} />
</head>
```

Sitemap: `sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', nl: 'nl' } } })`

## Step 7: RTL (if applicable)

```astro
---
const dir = ['ar', 'he', 'fa'].includes(locale) ? 'rtl' : 'ltr'
---
<html lang={locale} dir={dir}>
```

Use logical CSS properties: `margin-inline-start`, `padding-inline`, `text-align: start`, `border-inline-end`.

## Self-Check

- [ ] `<html lang={locale}>` on every page
- [ ] Hreflang tags for all variants + `x-default`
- [ ] Language switcher preserves current path
- [ ] Translations are type-safe
- [ ] Content collections filtered by locale
- [ ] Canonical URL per page
- [ ] Sitemap includes i18n config
- [ ] Islands receive locale as prop
