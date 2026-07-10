---
title: Environment variables
description: Every .env.example field, purpose, security tier, and required vs optional.
---

# Environment variables

The repo-root `.env.example` lists every env var with a comment explaining its purpose and whether it is server-only. This page groups them by domain.

## Security tiers

| Tier | Meaning | Example |
|---|---|---|
| public | Appears in the browser bundle; never put secrets here | `NEXT_PUBLIC_SITE_URL` |
| server-only | Visible only on the server | `GITHUB_READ_TOKEN`, `ACCESS_GRANT_SECRET` |
| dev-only | Local / dev only; must stay off in production | `TWEETS_STRESS_TEST=1` |

The `NEXT_PUBLIC_*` prefix means the value is injected into the client bundle. **Never** put a secret in a public variable.

## Core

```dotenv
PORT=3000                                        # server.js listen port
NEXT_PUBLIC_SITE_URL=https://arsvine.com          # sitemap / RSS / robots / og:url / canonical
```

`NEXT_PUBLIC_SITE_URL` is the canonical URL; `data/site.ts` falls back to `https://arsvine.com` if unset.

## Public

```dotenv
# NEXT_PUBLIC_TELEMETRY_PROVIDER=vercel            # empty = telemetry off; set to vercel to enable
NEXT_PUBLIC_CDN_BASE=https://cdn.arsvine.com      # CDN base for realm/... and shared/...
```

## Content (external GitHub repo)

```dotenv
# GITHUB_OWNER=ArsvineZhu
# GITHUB_REPO=arsvine-content
# GITHUB_BRANCH=main
# GITHUB_READ_TOKEN=github_pat_xxx
```

When all four are unset:

- Blog posts fall back to `content/blog/init/` (built-in 6-locale fallback)
- Tweets fall back to an empty state (unless dev `TWEETS_STRESS_TEST=1`)
- Protected posts are naturally unavailable

## Security

```dotenv
# ACCESS_GRANT_SECRET=replace-with-a-random-long-string
# TOTP_GROUPS_JSON={"friends-a":{"current":"JBSWY3DPEHPK3PXP","period":30,"digits":6,"window":1}}
# REVALIDATE_SECRET=replace-with-a-random-long-string
# TRUST_PROXY=1
```

`ACCESS_GRANT_SECRET` signs the HttpOnly access-grant cookie. `TOTP_GROUPS_JSON` is a group → TOTP secret map. `REVALIDATE_SECRET` guards `/api/revalidate*`. `TRUST_PROXY=1|true|yes` lets a trusted proxy pass `X-Forwarded-For`; otherwise rate limits use `req.socket.remoteAddress`.

## Infra

```dotenv
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
# COS_PRIVATE_BUCKET=your-private-bucket
# COS_PRIVATE_REGION=ap-hongkong
# COS_SECRET_ID=AKIDxxx
# COS_SECRET_KEY=xxxx
# COS_PRIVATE_CATALOG_PREFIX=
```

`UPSTASH_*` is auto-injected when Upstash is provisioned through the Vercel Marketplace. When configured, `lib/content/rate-limit.ts` uses Redis for cross-instance rate limiting; otherwise it falls back to a process-local `Map`.

`COS_*` is only used by `scripts/assets-publish.mjs`; dev does not need it. Credentials are injected at runtime through `node --env-file=.env.local`. **Never** write them into a coscli config file.

## Tweets Dev (dev only)

```dotenv
# TWEETS_STRESS_TEST=1
# TWEETS_STRESS_YEARS=6
# TWEETS_STRESS_MONTHS_PER_YEAR=12
# TWEETS_STRESS_TWEETS_PER_MONTH=24
```

Synthetic data lets the tweets page show pagination and components even without the external repo. Never enable in production.

## Advanced

```dotenv
# ANALYZE=true                # enable @next/bundle-analyzer
# NEXT_BUILD_DIR=.next        # deployment wrappers may change the .next output directory
```

## Checklist for adding a new env var

1. Add a fully commented line to `.env.example`
2. Run `pnpm env:sync` if you let the sync script manage that file
3. Any server-only env must be read via `process.env.<NAME>`; public envs require the `NEXT_PUBLIC_` prefix
4. Any dev-only env must have a `process.env.NODE_ENV !== 'production'` guard in production code
5. In docs, write the **variable name** and **purpose** only; never the real value
