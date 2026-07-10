---
title: Hitokoto & Tweets
description: One-liner proxy, tweet month archive, stress mode, synthetic data generation.
---

# Hitokoto & Tweets

Realm integrates two third-party content sources on the "content acquisition" side: Hitokoto one-liners (used by the home-page typing signature) and a tweet month archive (tweets page). Both go through Pages Router API endpoints to avoid CORS and add timeout protection.

## `/api/hitokoto`

Server-side proxy for `v1.hitokoto.cn`. The home-page typing signature has two fixed lines (Russian and Chinese, from Zamyatin's "We"). `/api/hitokoto` is an **additional** rotating one-liner source; whether it is wired up is a design decision.

Handler behavior:

- GET only
- `AbortController` with 5 s timeout
- In-memory LRU cache, 60 s TTL
- On error (network / timeout / 5xx) → return empty body; never let upstream timeout stall SSR

The page side renders only when there is content; an empty body falls back silently.

## Tweet archive

### Data source

`/api/tweet-months` reads the month index from the external repo's `tweets/index.json` and returns paginated slices. When the repo is not configured, returns `[]`.

`tweets/index.json` shape:

```json
[
  { "year": 2025, "month": 12, "tweetCount": 24 },
  { "year": 2025, "month": 11, "tweetCount": 18 }
]
```

`tweets/YYYY-MM.json` is that month's tweet array; the schema is in `lib/tweets/types.ts`.

### Client rendering

`pages/[locale]/tweets.tsx` SSG-generates the initial month list for the active locale. Subsequent months are loaded with an `useSWRInfinite`-style incremental fetch (`/api/tweet-months?offset=N&limit=12`).

### Stress mode (dev only)

Never enable in production. `TWEETS_STRESS_TEST=1` enables:

```dotenv
TWEETS_STRESS_TEST=1
TWEETS_STRESS_YEARS=6
TWEETS_STRESS_MONTHS_PER_YEAR=12
TWEETS_STRESS_TWEETS_PER_MONTH=24
```

Synthetic data is generated from fixed templates via helpers in `lib/tweets/parse-explain.tsx` and `lib/tweets/resolve.ts`, used only locally to exercise pagination, scrolling, and empty state.

## Safety and boundaries

- Third-party tweet content is **read-only**: users cannot post tweets from within Realm
- Tweet content may include external links. `lib/safe-external-href.ts` parses external links and enforces an `https` / `http` protocol whitelist, dropping other protocols (e.g. `javascript:`)
- `@user` and `#tag` mentions in tweet rich text go through `lib/tweets/parse-explain.tsx`; raw HTML is not rendered

## Offline / empty repo

External repo not configured and stress mode off:

- The tweets page renders the empty state (the empty branch in `components/sections/TweetsSection.tsx`)
- `/api/tweet-months` returns `{ months: [], total: 0 }`

This is not treated as an error; it is the normal fallback.

## Monitoring

- Tweet fetch failures are written to `console.error` with URL and status code
- `/api/tweet-months` is rate-limited by `enforceRateLimit()` (default 30/min per client key)
- The client "load more" button has a retry entry on failure; failures are not silently swallowed
