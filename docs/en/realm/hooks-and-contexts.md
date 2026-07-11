---
title: Hooks & Contexts
description: The 22 custom hooks and 4 contexts and their relationships.
---

# Hooks & Contexts

## 4 Contexts

### AppContext (`contexts/AppContext.tsx`)

Site-wide interactive state and effects. Provides:

- loading sequence state
- power / battery / inversion state
- real-time stats (FPS, etc.)
- home page typing effect control
- column hover state

Consumed via `useAppContext()`.

### TransitionContext (`contexts/TransitionContext.tsx`)

Controls route transition animations. Provides:

- `navigateTo(url)` — **all internal navigation must use this**, never `router.push()` (GOTCHAS #6)
- `setBackOverride()` — lets detail views and lightbox intercept BACK behavior

Consumed via `useTransition()`.

### LayoutAnchorsContext (`contexts/LayoutAnchorsContext.tsx`)

Registers active scroll containers. Since the layout uses fixed-height content containers, deep-link scrolling must target the container, not the document viewport.

### SiteAssetsContext (`contexts/SiteAssetsContext.tsx`)

Provides catalog-resolved site-shell resources (`favicon`, `og:image`, `avatar`). Consumes data from `/api/assets/home`.

## 22 Hooks

### Performance & device

| Hook | File | Responsibility |
|---|---|---|
| `useAdaptivePerformance` | `hooks/useAdaptivePerformance.ts` | Four-tier adaptive performance control (full / balanced / reduced / minimal) with runtime FPS sampling |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | CSS media query listener |
| `useMobileTesseractCharge` | `hooks/useMobileTesseractCharge.ts` | Mobile tesseract charge logic |

### Blog system

| Hook | File | Responsibility |
|---|---|---|
| `useBlogPostState` | `hooks/useBlogPostState.ts` | Blog post state machine (idle → checking → granted/required → loading → ready/error) |

### Routing & navigation

| Hook | File | Responsibility |
|---|---|---|
| `useLayoutRouteMode` | `hooks/useLayoutRouteMode.ts` | Layout route mode determination |
| `useRouteLoadingKind` | `hooks/useRouteLoadingKind.ts` | Determines loading overlay variant by source path (not target path) |
| `useDrawerNavigation` | `hooks/useDrawerNavigation.ts` | Drawer navigation control |

### Detail page

| Hook | File | Responsibility |
|---|---|---|
| `useDetailHeroParallax` | `hooks/useDetailHeroParallax.ts` | Detail hero parallax |
| `useDetailScrollReveal` | `hooks/useDetailScrollReveal.ts` | Detail scroll reveal animation |
| `useDetailSectionNav` | `hooks/useDetailSectionNav.ts` | Detail section navigation |
| `useDetailTitleReveal` | `hooks/useDetailTitleReveal.ts` | Detail title reveal animation |

### Typing effect

| Hook | File | Responsibility |
|---|---|---|
| `useTypingEffect` | `hooks/useTypingEffect.ts` | Base typing effect (Unicode script classification: Latin vs CJK paths, GOTCHAS #26) |
| `useTypingSubtitle` | `hooks/useTypingSubtitle.ts` | Home subtitle typing effect |

### Interaction & UI

| Hook | File | Responsibility |
|---|---|---|
| `useCursorTargetRegistry` | `hooks/useCursorTargetRegistry.ts` | Custom cursor target registration |
| `useGalleryLightbox` | `hooks/useGalleryLightbox.ts` | Gallery lightbox control |
| `usePowerSystem` | `hooks/usePowerSystem.ts` | Power system |
| `useRealtimeStats` | `hooks/useRealtimeStats.ts` | Real-time stats (FPS, memory, etc.) |
| `useLoadingSystem` | `hooks/useLoadingSystem.ts` | Loading system |
| `useStandalonePanelState` | `hooks/useStandalonePanelState.ts` | Standalone panel state |
| `useAnimationSequence` | `hooks/useAnimationSequence.ts` | Animation sequence orchestration |
| `useColumnHover` | `hooks/useColumnHover.ts` | Home column hover state |
| `useVisitorLanguageCode` | `hooks/useVisitorLanguageCode.ts` | Visitor language code detection |

### Utilities

| Hook | File | Responsibility |
|---|---|---|
| `useSafeTimeouts` | `hooks/use-safe-timeouts.ts` | Safe setTimeout wrapper that auto-cleans up on unmount |

## Context-to-Hook relationships

```
AppContext
  └─ usePowerSystem
  └─ useRealtimeStats
  └─ useTypingEffect / useTypingSubtitle
  └─ useColumnHover
  └─ useLoadingSystem
  └─ useMediaQuery

TransitionContext
  └─ useRouteLoadingKind
  └─ useLayoutRouteMode
  └─ useDrawerNavigation

LayoutAnchorsContext
  └─ (scroll containers)

Standalone (no context dependency)
  ├─ useAdaptivePerformance
  ├─ useBlogPostState
  ├─ useDetailHeroParallax / useDetailScrollReveal / useDetailSectionNav / useDetailTitleReveal
  ├─ useCursorTargetRegistry
  ├─ useGalleryLightbox
  ├─ useMobileTesseractCharge
  ├─ useAnimationSequence
  ├─ useStandalonePanelState
  ├─ useSafeTimeouts
  └─ useVisitorLanguageCode
```
