---
title: Typography & font variables
description: Four CSS variables, families, unicode ranges, Latin-only restrictions.
---

# Typography & font variables

`styles/globals.scss` exposes four CSS variables, one per use case. **Never** attach the wrong variable to a string.

## Four variables

| Variable | Family | Use |
|---|---|---|
| `--font-display` | ZELDA Free (Latin-only) | HUD decorative text (short slogans, version numbers) |
| `--font-hud` | Dosis + Noto Sans SC | HUD labels, numbers, blog titles, safe Latin |
| `--font-reading` | Noto Serif SC | MDX body, long-form reading |
| `--font-typewriter` | System monospace + Noto Sans SC Mono | Typing effects, code blocks, terminal-style UI |

## Hard limit on `--font-display` (GOTCHAS item 2)

ZELDA Free is a decorative font that **only contains basic Latin**. Using it for these scenarios breaks:

- Any CJK character → missing glyphs
- Accented Latin (é, ñ, ü, etc.) → occasional missing glyphs
- Translated strings (locale switching can introduce arbitrary Unicode)
- Blog titles
- User-submitted content

Safe uses: `> LOADING`, `> READY`, `v1.2.0`, other pure ASCII / Latin short strings.

## Families and weights

| Family | Weights | Use |
|---|---|---|
| Dosis | 300 / 400 / 500 | HUD Latin |
| Noto Sans SC | 300 / 400 / 500 / 700 | CJK body plus some bold |
| Noto Serif SC | 400 / 700 | MDX reading body |
| Noto Sans SC Mono | 400 | Monospace effects |

Noto Serif SC 500 is unused in practice; `data/site.ts.fonts.googleStylesheet` no longer includes it.

## Sizes, line-height, tracking

`styles/globals.scss` exposes a type scale (simplified):

```scss
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

Large HUD numbers use elastic rules like `clamp(2.4rem, 4vw, 3.2rem)` so they look reasonable on both large desktop and mobile.

## Checklist for changing fonts

1. Change `data/site.ts.fonts.googleStylesheet` and `cdnStylesheet`
2. Run `node scripts/fetch-google-fonts.mjs` to pull the new woff2
3. Upload via coscli to `cos://shared/fonts/`, setting `Content-Type` and `Cache-Control` per `website/font-hosting`
4. Verify with `curl -I`
5. Open `http://dev.arsvine.com` (with `scripts/dev-host-setup.cmd`) and visually check CJK / accented characters do not render as tofu
