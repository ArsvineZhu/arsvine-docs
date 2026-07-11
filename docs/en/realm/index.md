---
title: Overview
description: What Arsvine Realm is, its technical profile, and how to read this section.
---

# Arsvine Realm Overview

**Arsvine Realm** is Arsvine Zhu's personal portfolio and blog. Visually it presents a post-apocalyptic HUD aesthetic. Technically it is a self-hosted, multilingual Next.js site. Media lives on Tencent Cloud COS. Blog posts and tweets come from an external private GitHub content repo. Protected blog posts go through a TOTP gate backed by a signed HttpOnly access-grant cookie.

This section is the engineering-side manual for Realm. It is meant for maintainers and coding agents, not visitors.

## Where things live

- Repository: `https://github.com/Arsvine-Realm-Dev-Team/arsvine-realm`
- Live site: `https://arsvine.com`
- Documentation site: `https://docs.arsvine.com` (the `Realm` section you are reading)
- Documentation source: [`arsvine-realm/docs/`](https://github.com/Arsvine-Realm-Dev-Team/arsvine-realm/tree/master/docs) — the shorter maintenance doc set inside the same repo

## Technical profile

| Dimension | Stack |
|---|---|
| Framework | Next.js 16 with Pages Router (not App Router) |
| UI | React 19, TypeScript, SCSS Modules plus shared SCSS partials |
| 3D / motion | Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/cannon`, `cannon-es`, GSAP, Web Animations API |
| Content | `next-mdx-remote` for MDX; external content via GitHub Contents API |
| i18n | `next-intl` 4; UI locales `zh-CN` / `zh-TW` / `en`; optional content locales `ja` / `ru` / `fr` |
| Components | ~50 component files across 10 subdirectories: layout, effects, interactive, sections, detail, blog, cards, mdx, shared, telemetry |
| Hooks | 22 custom hooks |
| Contexts | 4 (App, Transition, LayoutAnchors, SiteAssets) |
| Testing | Vitest with `jsdom`; tests grouped by `tests/lib`, `tests/components`, `tests/hooks`, `tests/i18n`, `tests/pages`, `tests/repo` |
| Server | Custom Node.js server `server.js` (not `next start`) |
| Runtime | Node.js 24.x (`engines.node` in `package.json`) |
| Package manager | pnpm 11.7.0 |

## How to read this section

Pages are grouped by topic, not by audience:

1. `routes-and-proxy` — route model and the `proxy.ts` middleware responsibilities
2. `pages-tree` — every page under `pages/[locale]/...` and the dynamic routes
3. `content-sources` — bundled `data/` plus the external GitHub content repo
4. `protected-posts` — TOTP flow, signed cookies, and the static-prod invariant
5. `api-endpoints` — the 13 `pages/api/*` routes and their boundaries
6. `performance-tiers` — the four-tier adaptive controller in `useAdaptivePerformance`
7. `component-architecture` — component classification and responsibilities
8. `hooks-and-contexts` — 22 hooks and 4 contexts and their purposes
9. `custom-server` — `server.js` implementation details
10. `development` — local commands, COS Referer workflow, fonts, media
11. `gotchas` — historical regressions and fragile conventions

Suggested reading order: `routes-and-proxy` and `pages-tree` first to build a physical map; then `content-sources` and `protected-posts` for the content flow; consult `api-endpoints` and `performance-tiers` as needed; read `gotchas` before any change.
