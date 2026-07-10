---
title: Adaptive performance
description: useAdaptivePerformance design, detection, sampling, and tier transitions.
---

# Adaptive performance

Realm maintains a **four-tier** client-side `PerformanceTier`. Effects bind to capability flags rather than device checks. The full implementation is in `hooks/useAdaptivePerformance.ts`.

## Why capability flags, not media queries

Direct `navigator.userAgent` or `window.innerWidth` checks couple effects to device models and break across device upgrades. Capability flags are an abstraction:

```ts
// Inside a component
const { allowAmbientWebGL, allowHeavyCssEffects } = useAdaptivePerformance();
// Read the allow* flags instead of checking the device
```

Effect modules mount and unmount based on capability flags; tier changes are coordinated by the hook.

## Four tiers

| Tier | Logo motion | Ambient WebGL | Heavy CSS | Interactive WebGL | Custom cursor | Decorative motion |
|---|---:|---:|---:|---:|---:|---:|
| `full` | on | on | on | on | on | on |
| `balanced` | off | on | on | on | on | on |
| `reduced` | off | off | off | on | on | on |
| `minimal` | off | off | off | off | off | off |

The logo is visible in every tier; `balanced` only removes the pointer listener, animation frame loop, and chromatic drop shadows. `buildPerformanceState(tier, reason)` is the single mapping function; all components read its output.

## Heuristic ceiling

`resolveHeuristic()` derives a `maxTier` from environment signals after hydration:

| Signal | maxTier | reason |
|---|---|---|
| `prefers-reduced-motion: reduce` | `minimal` | `'reduced-motion'` |
| `navigator.connection.saveData === true` | `reduced` | `'device-heuristic'` |
| `navigator.connection.effectiveType` ∈ `slow-2g` / `2g` / `3g` | `reduced` | `'device-heuristic'` |
| `navigator.deviceMemory <= 4` or `navigator.hardwareConcurrency <= 4` | `balanced` | `'device-heuristic'` |
| Otherwise | `full` | `null` |

SSR has no client signals; the initial value is `full` and reconciled after hydration.

The runtime tier **never** exceeds `maxTier`. If `maxTier = 'reduced'`, the runtime tier can recover to at most `reduced`, never to `full`.

## Runtime sampling

After the opening animation completes (`animationsComplete`), a `requestAnimationFrame` sampling loop starts. Each sample window runs at most **120 frames or 2500 ms**, whichever comes first.

Frame interval > 32 ms counts as a "slow frame". Window classification:

- Average FPS < 45 or slow-frame ratio ≥ 25% → poor window
- Average FPS ≥ 55 and slow-frame ratio ≤ 10% → healthy window
- Otherwise → neutral, no change

Tier transitions:

- **2 consecutive poor windows** → degrade one tier (**5 s cooldown**)
- **3 consecutive healthy windows** → recover one tier (**10 s cooldown**; never above `maxTier`)
- Otherwise → no change

`reason` becomes `'runtime-fps'` on runtime changes and returns to `null` when reaching `maxTier`. `lastTierChangeRef` holds the cooldown timestamp. The effect's cleanup calls `cancelAnimationFrame`, stopping the sampler on unmount.

The current tier is written to `<html data-performance-tier="...">`, so CSS can branch on the attribute.

## Constraints

- New effects **must not** read `navigator.userAgent` / `navigator.deviceMemory` / `matchMedia('(prefers-reduced-motion)')` — always read `useAdaptivePerformance()` flags
- Optional effects must **tolerate unmounting** since tier changes trigger effect cleanup
- Module load failures should be swallowed
- Do not hard-code tier numbers in components
