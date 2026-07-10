---
title: Agent workflow
description: Maintainer / AI coding agent collaboration: input conventions, decision boundaries, PR template, CI gates.
---

# Agent workflow

Realm is an "AI coding agent friendly" project. Maintainers (humans) and coding agents follow the role split below.

## Documentation split

| File | Role | Who can change it |
|---|---|---|
| `CLAUDE.md` | Entry index; must stay short | Maintainers only |
| `AGENTS.md` | Hard rules and "common danger zones" | Maintainers only |
| `docs/DEVELOPMENT.md` | Local commands, COS Referer, fonts, media | Maintainer / agent collaboration |
| `docs/ARCHITECTURE.md` | Routes / content / protected posts / API / transitions / styling / 3D | Maintainer / agent collaboration |
| `docs/OPERATIONS.md` | Deploy / env / CDN / COS / ISR / Upstash / SEO | Maintainer / agent collaboration |
| `docs/PERFORMANCE.md` | Adaptive performance tiers | Maintainer / agent collaboration |
| `docs/ASSETS.md` | COS publishing pipeline | Maintainer / agent collaboration |
| `docs/GOTCHAS.md` | 27 historical regressions | Maintainer / agent collaboration |
| `docs/superpowers/specs/...` | Design specs (output during design phase) | Agents can write during spec phase |
| `tests/<area>/` | Test code | Agents can write |

## Hard rules (agents must obey)

1. Pages Router; **do not** switch to App Router
2. **Do not** replace `server.js`
3. Internal navigation uses `useTransition().navigateTo()`
4. **Do not** infer language from IP / country
5. **Do not** dynamically `require` locale data
6. **Do not** reintroduce `reading-time`
7. **Do not** attach `--font-display` to translated / user content
8. `coscli` uses only temporary env-injected credentials
9. Protected MDX **does not** enter static products
10. Preserve the reducer / effect race fixes in `useBlogPostState.ts` / `lib/blog-post-state.ts`

Read the corresponding `docs/GOTCHAS.md` entry before changing related code.

## Decision boundaries

Agents **can** do these directly:

- Edit `data/<topic>/<locale>.ts` content
- Edit `locales/<locale>.json` copy
- Edit `data/site.ts` SEO / fonts / social
- Add `tests/<area>/<name>.test.ts`
- Modify `components/...` internals (without changing external interfaces)
- Modify `scripts/...` internals
- Modify `docs/...` content (without restructuring)

Agents **must report first** before:

- Adding / removing env vars
- Changing `package.json` dependencies / devDependencies
- Changing `next.config.js` / `server.js` / `proxy.ts` / `i18n/config.ts`
- Changing `pages/[locale]/_app.tsx` / `_document.tsx`
- Changing `hooks/useBlogPostState.ts` / `lib/blog-post-state.ts` (protected-post state machine)
- Changing `scripts/assets-publish.mjs` (involves coscli credentials and pointer flip)
- Changing `data/site.ts` `fonts.googleStylesheet` (requires re-fetch and upload)

Agents **must never** do these:

- Commit COS secrets, GitHub PATs, TOTP secrets, or access-grant secrets anywhere
- Remove the corresponding fixes for fragile conventions recorded in GOTCHAS.md
- Change the locale resolution order
- Bypass `enforceRateLimit()` to expose revalidate / protected-verify as unlimited endpoints
- Place protected post bodies in `_next/data/...` JSON (even encrypted)

## PR template

Every change PR must describe:

1. **Intent** (one sentence)
2. **Impact** (which files / routes / locales)
3. **Manual verification** (dev side + desktop / mobile)
4. **Related issue** (if any)
5. **CI pass proof** (`pnpm check` output + four SSR paths returning 200)
6. **Rollback steps** (in case a post-release revert is needed)

## CI gates

```bash
pnpm check
```

= `pnpm lint` + `pnpm typecheck` + `pnpm test` + `pnpm build`. All four must pass before merging.

Vercel deployment auto-runs SSG pre-rendering; any SSG error (missing `getStaticPaths`, locale mismatch, circular import) fails at the build step.

## Design specs

Complex changes (multi-file / multi-day / multi-locale impact) must first produce `docs/superpowers/specs/<date>-<topic>-design.md`. A spec includes:

- Current state (reference current implementation plus existing docs)
- Goal (the user-visible or maintenance-visible problem being solved)
- Design (API shape, data flow, key decisions)
- Verification (dev side, prod side, rollback)

Agents may draft specs, but final sign-off is the maintainer's call.
