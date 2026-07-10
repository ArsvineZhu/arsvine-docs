---
title: Content sources
description: Typed data in data/ plus bundled fallback plus the external GitHub runtime layer.
---

# Content sources

Realm splits "content" into three layers, and **no single layer is the complete source of truth** — they complement each other and fall back to each other.

## 1. Bundled typed data (`data/`)

All structured content (works, experience, life, friend links, skills, site metadata) lives under `data/`, split by topic and locale:

```text
data/
├── site.ts                 # Site metadata (name, author, tagline, social, fonts, locale)
├── music.ts                # Music playlist (legacy; runtime reads from COS catalog)
├── projects/
│   ├── index.ts            # zh-CN fallback
│   ├── en.ts
│   └── zh-TW.ts
├── experience/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
├── life/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
├── skills/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
└── friendLinks/
    ├── index.ts
    ├── en.ts
    └── zh-TW.ts
```

### Static registry

`lib/i18n-data.ts` is the explicit static registry from locale to module, exposing:

| Function | Behavior |
|---|---|
| `loadProjects(locale)` | Returns `webProjects` / `gameProjects` / `earlyProjects` / `copyableTokens` |
| `loadLife(locale)` | Returns `gameData` / `travelData` / `otherData` / `alsoPlayGames` / `artPlaceholderText` |
| `loadExperience(locale)` | Returns `experienceData` |
| `loadFriendLinks(locale)` | Returns `friendLinksData` |
| `loadSkills(locale)` | Returns `skillCategories` / `skillsData` |
| `loadServices()` | Single locale (friend-page acknowledgements, from `data/site.ts` `pages.friends.services`) |
| `loadMessages(locale)` | Async; loads UI strings from `locales/<locale>.json` |

`resolveWebProject(id, locale)` and `resolveLifeItem(slug, locale)` provide per-item fallback chains:

```text
Active locale hits → 'source' (locale === origin) or 'translated'
Active locale misses, origin locale readable → use origin → 'fallback'
Otherwise → use defaultLocale → 'fallback'
```

The returned `TranslationStatus` (`'source' | 'translated' | 'fallback'`) lets detail pages render a LocaleFallbackBanner.

### Why a static registry

Do not replace the explicit registry with dynamic `require`. Pages Router reads data on the Node side; dynamic `require` triggers webpack's Critical dependency warnings and makes bundling less predictable. Both `GOTCHAS.md` and `CLAUDE.md` flag this rule.

## 2. Bundled fallback (`content/`)

Only one entry: `content/blog/init/`. It contains six locale variants of a built-in fallback post (`zh-CN.mdx` `zh-TW.mdx` `en.mdx` `ja.mdx` `ru.mdx` `fr.mdx`) used when the external content repo is not configured.

## 3. External GitHub content repository

When the following env vars are present, the site reads at runtime from a private GitHub repo:

```dotenv
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx
```

Expected repository shape:

```text
blog-index.json
blog/<slug>/
  zh-CN.mdx
  zh-TW.mdx
  en.mdx
  ja.mdx    # optional
  ru.mdx    # optional
  fr.mdx    # optional
tweets/
  index.json
  YYYY-MM.json
```

UI locales and content locales are **two sets**. UI locales are only `zh-CN` / `zh-TW` / `en`; content locales add optional `ja` / `ru` / `fr`. Extra content locales show up in the per-post language switcher on blog detail pages; they do not change the UI language.

When a requested UI locale lacks a post variant, the blog layer falls back to the post's default / source locale and marks the translation state so the detail page can show a fallback banner.

## 4. Tweet stress mode

In development, set `TWEETS_STRESS_TEST=1` to render synthetic data on the tweets page (no external repo needed). Knobs:

- `TWEETS_STRESS_YEARS`
- `TWEETS_STRESS_MONTHS_PER_YEAR`
- `TWEETS_STRESS_TWEETS_PER_MONTH`

Never enable this in production.

## Security constraint

`lib/content/github.ts` strictly normalizes content paths before calling the GitHub Contents API:

- Reject absolute URLs and protocol-relative URLs
- Reject leading `/`, backslashes, query strings, hash fragments, traversal, and encoded traversal
- Split the path into segments and encode each segment explicitly
- Build the final URL from a fixed trusted GitHub API base

`GOTCHAS.md` item 22 highlights this. Any change that lets user input flow into `lib/content/github.ts` must re-read that item first.
