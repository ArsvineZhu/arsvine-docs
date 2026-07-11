---
title: Pages tree & dynamic routes
description: Every file under pages/[locale], dynamic route params, redirect aliases.
---

# Pages tree & dynamic routes

## Complete file list

`pages/[locale]/` contains 22 files, grouped by responsibility:

### Entry and aggregation

| File | URL | Description |
|---|---|---|
| `index.tsx` | `/{locale}` | HUD home with five primary navigation columns |
| `content.tsx` | `/{locale}/content` | Content aggregation with hash sections (`#works` `#experience` `#blog` `#life`) |

### Section pages

| File | URL | Description |
|---|---|---|
| `works.tsx` | `/{locale}/works` | Works list |
| `experience.tsx` | `/{locale}/experience` | Experience timeline |
| `life.tsx` | `/{locale}/life` | Life records (game / travel / other) |
| `friends.tsx` | `/{locale}/friends` | Friend links plus acknowledgements |
| `about.tsx` | `/{locale}/about` | About |
| `contact.tsx` | `/{locale}/contact` | Contact (social links and email) |
| `tweets.tsx` | `/{locale}/tweets` | Tweet archive with month pagination |
| `copyright.tsx` | `/{locale}/copyright` | License and copyright |

### Detail pages

| File | URL | Description |
|---|---|---|
| `web/[id].tsx` | `/{locale}/web/{id}` | Work detail; SSG with `getStaticPaths` covering `data/projects` |
| `life/[slug].tsx` | `/{locale}/life/{slug}` | Life detail; SSG covering `data/life` |
| `blog/[slug].tsx` | `/{locale}/blog/{slug}` | Blog detail; SSG with `fallback: 'blocking'` plus ISR |

### Redirects

| File | Behavior |
|---|---|
| `blog.tsx` | Temporary alias → `/{locale}/content#blog` |
| `posts.tsx` | Legacy redirect → `/{locale}/content#blog` |
| `posts/[slug].tsx` | Legacy redirect → `/{locale}/blog/{slug}` |
| `license.tsx` | Permanent redirect → `/{locale}/copyright` |

Note: `/[locale]/game` **does not exist**. `useLayoutRouteMode` and prefetch matchers still include it as a standalone-pattern branch, but there is no `pages/[locale]/game` file. This is the "legacy matcher" recorded as `GOTCHAS.md` item 21.

### Protected and feed

| File | URL | Description |
|---|---|---|
| `access/[group].tsx` | `/{locale}/access/{group}` | TOTP gate page |
| `rss.xml.tsx` | `/{locale}/rss.xml` | Per-locale RSS |

## `getStaticPaths` behavior

- `web/[id].tsx`: `paths` flattens the three groups (web / game / early) from `data/projects` for the active locale. `fallback: false`.
- `life/[slug].tsx`: `paths` flattens `data/life` (gameData / travelData / otherData) for the active locale. `fallback: false`.
- `blog/[slug].tsx`: `paths` pulls the slug list from `blog-index.json` (when the external content repo is configured) or falls back to the bundled `content/blog/init/` posts. `fallback: 'blocking'` allows new slugs to be rendered on demand and then cached via ISR.

## Route loading overlay

`useRouteLoadingKind(router)` decides the loading overlay variant from the **leaving path**, not the target:

- `home/content → blog detail`: default right-side overlay; left HUD stays visible
- `blog detail → blog detail`: standalone overlay; left HUD is already hidden

Do not flip this to target-based selection — it breaks one of the two directions. This is `GOTCHAS.md` item 7.

## See also

- Complete list of contexts and hooks: [`hooks-and-contexts`](/en/realm/hooks-and-contexts)
- Component hierarchy: [`component-architecture`](/en/realm/component-architecture)
