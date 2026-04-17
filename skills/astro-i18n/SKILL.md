---
name: astro-i18n
description: Implement internationalization in Astro projects with locale routing, content translation, and RTL support. Triggers on "astro i18n", "internationalization", "multilingual", "translate astro", "locale routing", "multi-language site".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro i18n — Multilingual Sites

Astro has built-in i18n routing. Use it instead of third-party i18n libraries — it handles URL structure, locale detection, and redirects natively.

Astro's built-in i18n routing was added in Astro 4 and refined in Astro 5.

## Step 1: Configure i18n Routing

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'fr', 'de'],
    routing: {
      prefixDefaultLocale: false, // / = English, /nl/ = Dutch
      // prefixDefaultLocale: true, // /en/ = English, /nl/ = Dutch
    },
    fallback: {
      nl: 'en',  // Missing Dutch pages fall back to English
      fr: 'en',
      de: 'en',
    },
  },
})
```

### URL Structure

With `prefixDefaultLocale: false` (recommended for SEO):
```
/                     → English (default)
/about                → English about page
/nl/                  → Dutch home
/nl/about             → Dutch about page
/fr/about             → French about page
```

With `prefixDefaultLocale: true`:
```
/en/                  → English home
/en/about             → English about page
/nl/about             → Dutch about page
```

## Step 2: Page Structure

### File-Based Routing

```
src/pages/
  index.astro          → / (default locale)
  about.astro          → /about
  nl/
    index.astro        → /nl/
    about.astro        → /nl/about
  fr/
    index.astro        → /fr/
    about.astro        → /fr/about
```

### Shared Layouts with Locale

```astro
---
// src/layouts/Base.astro
import { getLocaleByPath } from 'astro:i18n'

interface Props {
  title: string
  description?: string
}

const locale = getLocaleByPath(Astro.url.pathname)
const { title, description } = Astro.props
---
<html lang={locale}>
<head>
  <meta charset="utf-8" />
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <link rel="alternate" hreflang="en" href={getAbsoluteUrl('en')} />
  <link rel="alternate" hreflang="nl" href={getAbsoluteUrl('nl')} />
  <link rel="alternate" hreflang="fr" href={getAbsoluteUrl('fr')} />
  <link rel="alternate" hreflang="x-default" href={getAbsoluteUrl('en')} />
</head>
<body>
  <slot />
</body>
</html>
```

## Step 3: Translation System

Astro doesn't include a translation runtime — you build a lightweight one.

### Simple Dictionary Pattern

```ts
// src/i18n/translations.ts
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'cta.getStarted': 'Get Started',
    'footer.copyright': '© {year} Company',
    'blog.readMore': 'Read more',
    'blog.minRead': '{min} min read',
  },
  nl: {
    'nav.home': 'Home',
    'nav.about': 'Over ons',
    'nav.blog': 'Blog',
    'cta.getStarted': 'Aan de slag',
    'footer.copyright': '© {year} Bedrijf',
    'blog.readMore': 'Lees meer',
    'blog.minRead': '{min} min lezen',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.blog': 'Blog',
    'cta.getStarted': 'Commencer',
    'footer.copyright': '© {year} Entreprise',
    'blog.readMore': 'Lire la suite',
    'blog.minRead': '{min} min de lecture',
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

export function getLocale(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  return (Object.keys(translations) as Locale[]).includes(segment as Locale)
    ? (segment as Locale)
    : 'en'
}
```

### Usage in Astro Components

```astro
---
import { t, getLocale } from '../i18n/translations'
const locale = getLocale(Astro.url.pathname)
---
<nav>
  <a href={locale === 'en' ? '/' : `/${locale}/`}>{t(locale, 'nav.home')}</a>
  <a href={locale === 'en' ? '/about' : `/${locale}/about`}>{t(locale, 'nav.about')}</a>
</nav>
```

### Usage in Preact Islands

```tsx
// Pass locale as prop from Astro
import { t } from '../i18n/translations'

interface Props {
  locale: 'en' | 'nl' | 'fr'
}

export function SearchBar({ locale }: Props) {
  return (
    <form>
      <input placeholder={t(locale, 'search.placeholder')} />
      <button type="submit">{t(locale, 'search.submit')}</button>
    </form>
  )
}
```

```astro
<SearchBar client:load locale={getLocale(Astro.url.pathname)} />
```

## Step 4: Content Collections per Locale

### Separate Collections

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blogSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  locale: z.enum(['en', 'nl', 'fr']),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogSchema,
})
```

```
src/content/blog/
  en/
    hello-world.md      # locale: en
    astro-guide.md
  nl/
    hello-world.md      # locale: nl (same slug, different locale)
    astro-gids.md
```

### Query by Locale

```astro
---
import { getCollection } from 'astro:content'
const locale = getLocale(Astro.url.pathname)
const posts = await getCollection('blog', ({ data }) => data.locale === locale)
---
```

## Step 5: Language Switcher Component

```astro
---
// src/components/LanguageSwitcher.astro
const currentPath = Astro.url.pathname
const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

function getLocalizedPath(locale: string): string {
  const segments = currentPath.split('/').filter(Boolean)
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
        <a
          href={getLocalizedPath(code)}
          hreflang={code}
          lang={code}
          aria-current={getLocale(currentPath) === code ? 'true' : undefined}
        >
          {label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

## Step 6: SEO for Multilingual

### Hreflang Tags (required)

```astro
<head>
  {locales.map(({ code }) => (
    <link
      rel="alternate"
      hreflang={code}
      href={new URL(getLocalizedPath(code), Astro.site).href}
    />
  ))}
  <link
    rel="alternate"
    hreflang="x-default"
    href={new URL(getLocalizedPath('en'), Astro.site).href}
  />
</head>
```

### Canonical URL
```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).href} />
```

### Sitemap per Locale

```ts
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', nl: 'nl', fr: 'fr' },
      },
    }),
  ],
})
```

## Step 7: RTL Support (if applicable)

```astro
---
const locale = getLocale(Astro.url.pathname)
const dir = ['ar', 'he', 'fa'].includes(locale) ? 'rtl' : 'ltr'
---
<html lang={locale} dir={dir}>
```

CSS:
```css
/* Use logical properties instead of physical */
.card {
  margin-inline-start: var(--space-4);  /* Not margin-left */
  padding-inline: var(--space-4);        /* Not padding-left/right */
  text-align: start;                     /* Not text-align: left */
  border-inline-end: 1px solid;          /* Not border-right */
}
```

## Self-Check

- [ ] i18n config in `astro.config.ts` with all supported locales
- [ ] `<html lang={locale}>` set on every page
- [ ] Hreflang tags present for all locale variants + `x-default`
- [ ] Language switcher preserves current page path
- [ ] Translations are type-safe (TypeScript catches missing keys)
- [ ] Content collections filtered by locale
- [ ] Canonical URL set per page
- [ ] Sitemap includes i18n config
- [ ] RTL: CSS uses logical properties (if RTL locales supported)
- [ ] Islands receive locale as a prop (not reading from URL client-side)
