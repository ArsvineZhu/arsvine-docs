---
title: Overview
description: "Realm visual system: typography, loading, transitions, Three.js effects, and relation to other design languages."
---

# Design System overview

Realm's visual language is "post-apocalyptic HUD": low saturation, scan-line feel, strong contrast, decorative geometry. This is not a brand book; it is the maintainer / coder view of "where to change, how to change, and what not to touch".

## Where to look

- Typography and font variables: CSS variables in `styles/globals.scss` (`--font-display` / `--font-hud` / `--font-reading` / `--font-typewriter`)
- Color palette and tokens: same file, `styles/globals.scss`
- Animation keyframes: `styles/_animations.scss` plus `styles/detail-standalone/_keyframes.scss`
- 3D effects: `components/effects/RainMorimeEffect.tsx`, `Tesseract.tsx`, `TesseractExperience.tsx`
- Loading and transitions: `components/shared/LoadingScreen/*`, `components/layout/RouteLoadingOverlay.tsx`, `contexts/TransitionContext.tsx`
- HUD and left panel: `components/layout/GlobalHud.tsx`, `LeftPanel.tsx`
- Typing and signature: `hooks/useTypingEffect.ts`, `useTypingSubtitle.ts`, `lib/typing-effect.ts`, `lib/hud-typing-visibility.ts`

## Reading order

1. `typography-and-fonts` — font variables and their use
2. `visual-language` — color palette, spacing, grid, key components
3. `loading-and-transitions` — opening screen, route transitions, loading overlay
4. `three-effects` — Three.js effects and their link to adaptive performance

## What is not in this doc

- Private design source files (Figma / Sketch) are not in version control
- Concrete UI copy lives in `locales/<locale>.json` and `data/site.ts`
- Friend links and third-party images are in `data/friendLinks/` and `data/site.ts.pages.friends.services`
