---
title: Performance tiers
description: useAdaptivePerformance four-tier controller: design, sampling, and capability flags.
---

# Performance tiers

`hooks/useAdaptivePerformance.ts` maintains a four-tier client-side `PerformanceTier`. Effects bind to capability flags rather than device checks. Components read flags, not `navigator.userAgent` or `window.innerWidth`.

## Four tiers and capabilities

| Tier | Logo motion | Ambient WebGL | Heavy CSS | Interactive WebGL | Custom cursor | Decorative motion |
|---|---:|---:|---:|---:|---:|---:|
| `full` | on | on | on | on | on | on |
| `balanced` | off | on | on | on | on | on |
| `reduced` | off | off | off | on | on | on |
| `minimal` | off | off | off | off | off | off |

The logo stays visible in every tier; `balanced` only removes the pointer listener, animation frame loop, and chromatic drop shadows. The mapping is centralized in `buildPerformanceState()`; components read its output instead of doing their own mapping.

## Heuristic ceiling

`resolveHeuristic()` derives a `maxTier` from environment signals after hydration. The runtime tier never exceeds it:

| Signal | maxTier | reason |
|---|---|---|
| `prefers-reduced-motion: reduce` | `minimal` | `'reduced-motion'` |
| `navigator.connection.saveData === true` | `reduced` | `'device-heuristic'` |
| `navigator.connection.effectiveType` ∈ `slow-2g` / `2g` / `3g` | `reduced` | `'device-heuristic'` |
| `navigator.deviceMemory <= 4` or `navigator.hardwareConcurrency <= 4` | `balanced` | `'device-heuristic'` |
| Otherwise | `full` | `null` |

SSR has no client-only signals; the initial value is `full`, then reconciled on hydration.

## Runtime sampling

After the opening animation completes (`animationsComplete`), a `requestAnimationFrame` sampling loop starts. Each sample window runs at most **120 frames or 2500 ms**, whichever comes first.

- Frame interval > **32 ms** counts as a "slow frame".
- Average FPS < **45** or slow-frame ratio ≥ **25%** → **poor window**
- Average FPS ≥ **55** and slow-frame ratio ≤ **10%** → **healthy window**

Tier transitions:

- **2 consecutive poor windows** → degrade one tier (**5 s cooldown**)
- **3 consecutive healthy windows** → recover one tier (**10 s cooldown**; never above `maxTier`)
- Otherwise → no change

`lastTierChangeRef` holds the cooldown timestamp. The `reason` becomes `'runtime-fps'` on runtime changes and returns to `null` when reaching `maxTier`.

The current tier is written to `<html data-performance-tier="...">`, so CSS can branch on the attribute.

## Constraints when adding new effects

- Do **not** read `navigator.userAgent` / `navigator.deviceMemory` / `matchMedia('(prefers-reduced-motion)')` inside components — always read `useAdaptivePerformance()` flags.
- Optional effects **must tolerate unmounting**: tier changes trigger effect cleanup.
- Module-load failures should be swallowed; do not pollute the upper layer.
