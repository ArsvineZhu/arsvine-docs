---
title: Three.js effects
description: Desktop-only WebGL effects, dynamic imports, performance linkage, mobile fallback.
---

# Three.js effects

Realm's Three.js effects are **desktop-only**, mounted dynamically according to the capability flags of `useAdaptivePerformance`. Mobile devices take a simplified fallback and never enter a GPU context.

## Three effects

### RainMorimeEffect

`components/effects/RainMorimeEffect.tsx`: post-apocalyptic ambient rain particles. Background layer, mounted under `MainLayout`.

- 10,000+ particles
- InstancedMesh
- Enabled on `full` and `balanced` tiers (`allowAmbientWebGL`)

### TesseractExperience

`components/effects/TesseractExperience.tsx`: interactive charging / physics effect, using `@react-three/cannon` and `cannon-es`.

- 4D hypercube rotating in 3D space
- Driven by user scroll / mouse movement through the physics engine
- Enabled on `full`, `balanced`, and `reduced` tiers (`allowInteractiveWebGL`)
- Mobile uses `useMobileTesseractCharge` (CSS animation) for a simplified version

### Tesseract

`components/effects/Tesseract.tsx`: a static tesseract SVG decoration, mounted on the loading screen.

- Pure SVG, no GPU
- Enabled on all performance tiers

## Dynamic imports and SSR off

```ts
const RainMorimeEffect = dynamic(() => import('@/components/effects/RainMorimeEffect'), { ssr: false });
const TesseractExperience = dynamic(() => import('@/components/effects/TesseractExperience'), { ssr: false });
```

SSR off avoids `window` / `WebGLRenderingContext` errors on the Node side.

## Do not churn GPU contexts

WebGL effects **should not** be repeatedly unmounted → mounted on route transitions. `components/layout/MainLayout.tsx` keeps a stable effect container; route transitions only swap the upper React tree, and effects stay mounted once they are ready.

Reason: every mount creates a new WebGL context (`canvas.getContext('webgl2')`); frequent creation and destruction pushes desktop GPU drivers into unstable states, increasing jank and crash probability. This is GOTCHAS item 20.

## Performance linkage

```ts
const { allowAmbientWebGL, allowInteractiveWebGL } = useAdaptivePerformance();

return (
  <>
    {allowAmbientWebGL && <RainMorimeEffect />}
    {allowInteractiveWebGL && <TesseractExperience />}
  </>
);
```

When `tier` changes React re-renders; flag changes drive effect mount / unmount. The effect modules themselves **do not** read `navigator` signals.

## Mobile fallback

When `tier === 'minimal'`, `allowInteractiveWebGL === false` and `<TesseractExperience />` unmounts. The pure-SVG `<Tesseract />` stays.

`useMobileTesseractCharge()` provides a simplified charge behavior (CSS transform + opacity animation) below the mobile breakpoint (via `useMediaQuery`) and never creates a GPU context.

## Debugging

- `localStorage.setItem('arsvine-tier', 'minimal')` force the lowest tier
- React DevTools Profiler: inspect effect mount frequency
- Browser DevTools → Performance → record a route transition; verify the GPU context count is stable

## Checklist for adding a WebGL effect

1. Use `dynamic(() => import(...), { ssr: false })`
2. Accept tier-change mount / unmount; do not self-manage
3. Do not read `navigator` inside `useEffect`
4. Handle module load failure (component should tolerate import failure)
5. Test three paths: tier change, route transition, mobile breakpoint
