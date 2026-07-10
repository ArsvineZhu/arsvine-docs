---
title: Gotchas
description: Historical regressions and fragile conventions. Read before editing related code.
---

# Gotchas

> The repo's `arsvine-realm/docs/GOTCHAS.md` lists 27 of the same gotchas. This page is a maintainer-priority subset, with a public-facing angle.

## Protected posts

1. **`useBlogPostState` auth-probe effect must depend on `state.authState`**. Otherwise switching protected posts within the same group keeps the effect from re-running, and the page hangs at auth checking. See `hooks/useBlogPostState.ts`.
2. **`authResolved` must clear `activeRequestKey` and `loadingLocale` in both branches** (granted and required). Clearing only the required branch leaves a stale key, and the next legitimate fetch gets incorrectly deduped. See `lib/blog-post-state.ts`.
3. **Protected posts' `mdxSource` is always `null` from SSG**. Do not place ciphertext or hidden MDX payloads in `_next/data/.../...json`. Direct `GET /api/post-variant?slug=<protected>&locale=zh-CN` without a cookie must return `403`.

## Route transitions and navigation

4. **Internal navigation goes through `useTransition().navigateTo(url)`**. `router.push()` skips the transition animation and breaks home / content / detail motion choreography.
5. **`useRouteLoadingKind` decides the loading variant from the leaving path, not the target**. Switching to target-based selection breaks either home → detail or detail → detail.
6. **The route loading overlay lives inside `TransitionContext`**. Putting it at the end of `document.body` would cover the HUD.

## Custom cursor and avatar

7. **CustomCursor hover state must go through the reset helper**. Direct manipulation of internal refs leaves residue after route changes, scrolling, blur, visibility changes, and DOM unmounts.
8. **Avatar parallax mousemove must use `style.setProperty('transform', value, 'important')`**. Direct `style.transform = ...` is silently overridden by the avatar entry keyframe's `forwards` final transform.

## MDX rendering

9. **`<Explain>` must not live inside an animation container**. The z-index and stacking context get covered and tooltips get trapped under following paragraphs.
10. **After the blog reveal animation ends, transform must be set to `'none'`**, not an empty string. Any non-`none` transform creates a stacking context that traps `<Explain>` tooltips.
11. **Pass `uppercase={false}` explicitly to `<AnimatedTitleChars>`**. The shared component defaults to uppercase, and re-applying `toUpperCase()` to CJK or already-uppercase strings produces unpredictable rendering.
12. **`<Term>` and `<Explain>` semantics**:
    - `<Term note="...">word</Term>` — rubification annotation, proper nouns / abbreviations / short glosses
    - `<Explain note="...">phrase</Explain>` — tooltip / mobile bottom sheet, longer sentence-level notes
    - `<Explain>` is a focusable span (not a button) to avoid inline wrapping and centering issues; on mobile it becomes a fixed bottom panel

## Typography

13. **`--font-display` is Latin-only (ZELDA Free)**. Do not use it for CJK, accented Latin, blog titles, translated strings, or user content. Use `--font-hud` for HUD-safe headings and `--font-reading` for long-form content.
14. **Google Fonts variable-font deduplication is intentional**. The same `.woff2` may be referenced by multiple `@font-face` blocks at different `font-weight` values. **Do not** rewrite `scripts/fetch-google-fonts.mjs` to force one file per weight.
15. **COS custom-header Value field is value-only**. Pasting `Cache-Control: public, ...` as the value produces a malformed header that Firefox rejects.

## Music player

16. **Track click is an explicit play intent**. Do not add a "only autoplay if already playing" guard. `useMusicPlayerState` uses a play-intent flag to chain `audio.load()` → `audio.play()`.
17. **The player must not auto-open on mobile**. The auto-open guard lives in `MusicPlayer`; removing it breaks the mobile entry experience.

## Media / assets

18. **The `cdn.arsvine.com` bucket only allows `arsvine.com` and `*.arsvine.com` Referer values**. Localhost and empty Referer are rejected. Local development must use `scripts/dev-host-setup.cmd`.
19. **COS traffic is billable**. Traffic packages are not a hard limit; after the package is exhausted traffic continues and is charged by usage. Enable budget alerts.
20. **Large assets** (high-res images, originals, audio) **must not** be committed to Git. `public/music/` still allows local test files, but production audio must come from `cdn.arsvine.com/realm/audio/...`.
21. **Do not assume `/[locale]/game` exists**. `useLayoutRouteMode` and prefetch matchers still include it as a legacy branch, but `pages/[locale]/game` is not in the file tree.
22. **GitHub content paths must be repo-relative only**. `lib/content/github.ts` already implements this: it rejects absolute URLs, protocol-relative URLs, leading `/`, backslashes, query strings, hash fragments, traversal, and encoded traversal. It splits the path into segments and encodes each one explicitly.
23. **External links must be parsed with `new URL()`**, not substring checks like `includes('github.com')`. `lib/safe-external-href.ts` is the shared helper.

## Locale and proxy

24. **Locale resolution is fixed at `NEXT_LOCALE cookie > Accept-Language > zh-CN`**. Do not infer language from IP or country. The `GEO_COUNTRY` cookie is for UI micro-tuning only.
25. **`proxy.ts` already handles "looks like a locale but unsupported" cases** (e.g. `/fr/web/1`). Do not add duplicate logic.

## Commits and dependencies

26. **pnpm workspace settings live in `pnpm-workspace.yaml`**, not in `package.json#pnpm`. pnpm 11 ignores the package-level key.
27. **New tests live under `tests/<area>/`**. Do not put `.test.ts` next to source files.

## Current test layout

```text
tests/
├── lib/           # Pure logic: blog-client, format-reading-time, i18n-data, etc.
├── components/    # Component snapshots / render assertions
├── hooks/         # useBlogPostState, useAdaptivePerformance, etc.
├── i18n/          # proxy helpers, locale helpers
├── pages/         # Page-level SSG / revalidate behavior
└── repo/          # Repo fixtures and content replays
```

Full coverage requires Node 24 and pnpm 11. CI runs `pnpm check`, which is `lint` + `typecheck` + `test` + `build` end to end.
