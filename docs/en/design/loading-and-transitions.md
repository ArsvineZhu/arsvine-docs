---
title: Loading & transitions
description: Opening screen, route transitions, and loading overlay triggers.
---

# Loading & transitions

Realm's loading / transition system is composed of three parts: an opening screen, route transitions, and a route-level loading overlay. Each has its own component and trigger condition.

## Opening screen (HomeLoadingScreen)

`components/shared/HomeLoadingScreen.tsx` plus `LoadingScreen/*`:

- Industrial HUD background
- Site name typing effect (`LogoTitle.tsx` + `lib/typing-effect.ts`)
- Terminal-style loading log (`TerminalConsole.tsx`)
- Left-right split transition (`SplitTransition.tsx`)

Trigger: after first-paint hydration, coordinated by `useLoadingSystem()`. The opening animation must complete (`animationsComplete`) before `useAdaptivePerformance` starts its runtime sampling.

## Route transitions

`contexts/TransitionContext.tsx` is the single source of truth:

- Exposes the `useTransition()` hook
- Internal navigation uses `useTransition().navigateTo(url)`
- Detail views / lightboxes can `setBackOverride()` to intercept BACK behavior

`useLayoutRouteMode(router)` decides the current route's layout mode (left-panel / drawer-mobile / standalone) and drives column retract / expand together with the transition animation.

## Route-level loading overlay

`components/layout/RouteLoadingOverlay.tsx` plus `hooks/useRouteLoadingKind(router)`:

- The loading variant is chosen based on the **leaving path**, not the target
- Leaving path is `home` or `content` → default right-side overlay (left HUD still visible)
- Leaving path is `blog detail` → standalone overlay (left HUD already hidden)

**Do not** switch to target-based selection; it breaks one of the two directions. This is GOTCHAS item 7.

## Route transitions must not be skipped

All internal navigation must use `useTransition().navigateTo(url)`. `router.push()` will:

- Skip home / content / detail motion choreography
- Desynchronize the left HUD and the right column
- Disable detail view entry animation
- Break BACK interception

This is GOTCHAS item 6.

## Protected-post transition

`hooks/useBlogPostState.ts` coordinates the "auth-checking loading shell" and the actual render. During the transition the loading shell takes over visually, then cross-fades once the body is in place. `BlogStateShell` is responsible for the shell shape.

## Custom cursor and transitions

`components/interactive/customCursorShared.ts` maintains hover state. After route changes, scrolling, blur, visibility changes, and DOM unmounts, **must** use the reset helper to clear state. Do not touch internal refs directly. This is GOTCHAS item 12.

## Performance linkage

Both the opening screen and route transitions use GSAP and the Web Animations API. They mount on the `allowDecorativeMotion` capability flag of `useAdaptivePerformance` — the `reduced` and `minimal` tiers skip decorative motion but keep functional transitions (such as fade-in).

## Debugging

In dev mode:

- `localStorage.setItem('arsvine-skip-loading', '1')` skips the opening screen (dev only)
- `useTransition()` exposes a `__debug` entry to force a specific variant
- React DevTools: select `TransitionContext.Provider` to see the current transition state
