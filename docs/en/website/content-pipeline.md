---
title: External content repository
description: GitHub Contents API, private repo structure, UI locale vs content locale, fallback chain.
---

# External content repository

In production, Realm pulls blog posts and tweets from a private GitHub repository named `arsvine-content`. When the repo is not configured, Realm falls back to bundled posts.

## Enabling

Full `.env.local` configuration:

```dotenv
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx
```

`GITHUB_READ_TOKEN` must be able to read a private repo. `GITHUB_BRANCH` defaults to `main`; change it when switching between preview and production.

When the repo is not configured:

- Blog posts fall back to `content/blog/init/` (bundled 6-locale fallback)
- Tweets fall back to an empty state
- Protected posts are naturally unavailable

## Expected repository layout

```text
arsvine-content/
├── blog-index.json
├── blog/
│   └── <slug>/
│       ├── zh-CN.mdx
│       ├── zh-TW.mdx
│       ├── en.mdx
│       ├── ja.mdx        # optional content locale
│       ├── ru.mdx        # optional content locale
│       └── fr.mdx        # optional content locale
└── tweets/
    ├── index.json
    └── YYYY-MM.json
```

`blog-index.json` is the slug → metadata + access info index. `<locale>.mdx` is the per-locale body, with frontmatter (`title`, `date`, `tags`, optional `access`).

`tweets/index.json` is the descending month index; each month is a `YYYY-MM.json` array.

## UI locale vs content locale

- **UI locales**: `zh-CN` / `zh-TW` / `en` (from `i18n/config.ts`)
- **Content locales**: UI locales plus optional `ja` / `ru` / `fr`

Optional content locales are exposed in the per-post language switcher on the blog detail page; they do **not** change the UI language. That is, `/zh-CN/blog/<slug>` can show the `ja.mdx` body while the UI remains Simplified Chinese.

## GitHub API path safety

`lib/content/github.ts` strictly normalizes content paths before calling the Contents API:

- Reject absolute URLs (`http://`, `https://`, `//`)
- Reject leading `/` and backslashes `\`
- Reject query strings and hash fragments
- Reject traversal (`..` and encoded forms like `%2e%2e`)
- Split the path into segments and URL-encode each one
- Build the URL from a fixed trusted GitHub API base: `https://api.github.com/repos/{owner}/{repo}/contents/...`

Any change that lets user input flow into `lib/content/github.ts` must first re-read `GOTCHAS.md` item 22.

## Fallback chain

`resolveWebProject` / `resolveLifeItem` in `lib/i18n-data.ts` provide the fallback chain:

```text
Request (id, locale)
  → active locale hits → 'source' (locale === origin) or 'translated'
  → active locale misses, origin locale readable → use origin → 'fallback'
  → otherwise → use defaultLocale (zh-CN) → 'fallback'
```

The returned `TranslationStatus` lets the detail page render a LocaleFallbackBanner (`components/shared/LocaleFallbackBanner.tsx`) telling the user "this locale is not translated; you are seeing the source language."

## Triggering ISR

After updating the external repo, **always** call:

```bash
curl -X POST https://arsvine.com/api/revalidate-content \
  -H 'content-type: application/json' \
  -d '{"secret":"<REVALIDATE_SECRET>","slug":"<blog-slug>"}'
```

Without `slug`, only `/{locale}/content` is rebuilt. With `slug`, `/<locale>/blog/<slug>` is also rebuilt for all locales. This endpoint is rate-limited at 30/min per client.

When the tweet repo is updated:

```bash
curl -X POST https://arsvine.com/api/revalidate \
  -H 'content-type: application/json' \
  -d '{"secret":"<REVALIDATE_SECRET>"}'
```

## Bundled fallback

`content/blog/init/` contains six locale files used when the external repo is not configured or its fetch fails:

- `zh-CN.mdx` is the source
- The other locales are short or translated variants, maintained by the team

Fallback posts do not participate in ISR triggers; they are produced directly by SSG `getStaticProps`.
