---
title: Component architecture
description: Classification and responsibilities of 50+ components across 10 subdirectories.
---

# Component Architecture

Realm's components live under `components/` across 10 subdirectories, totaling roughly 50 files. This page lists every component and its actual purpose.

## layout/ — Layout shell

| Component | File | Responsibility |
|---|---|---|
| `MainLayout` | `MainLayout.tsx` | Root layout. Composes `LeftPanel`, `GlobalHud`, dynamically imports `TesseractExperience` / `RainMorimeEffect` / `CustomCursor` (all `ssr: false`), mounts `HomeLoadingScreen`, `RouteLoadingOverlay`, `MusicPlayer`, registers scroll anchors, handles content hash navigation |
| `GlobalHud` | `GlobalHud.tsx` | Top HUD chrome (clock, etc.) |
| `LeftPanel` | `LeftPanel.tsx` | Left navigation panel |
| `NavigationColumns` | `NavigationColumns.tsx` | 5 primary navigation columns on the home page |
| `RouteLoadingOverlay` | `RouteLoadingOverlay.tsx` | Route transition loading overlay |
| `SectionPageLayout` | `SectionPageLayout.tsx` | Generic layout container for section pages |

## effects/ — WebGL and visual effects

| Component | File | Responsibility |
|---|---|---|
| `Tesseract` | `Tesseract.tsx` | SVG fallback tesseract (desktop) |
| `TesseractExperience` | `TesseractExperience.tsx` | Interactive 3D tesseract with `@react-three/cannon` physics (desktop only) |
| `RainMorimeEffect` | `RainMorimeEffect.tsx` | Atmospheric rain particle effect (10000+ particles) |
| `Noise` | `Noise.tsx` | Noise overlay |

## interactive/ — Interactive widgets

| Component | File | Responsibility |
|---|---|---|
| `MusicPlayer` | `MusicPlayer.tsx` + `music-player/` subdir + `.module.scss` | Full music player |
| `CustomCursor` | `CustomCursor.tsx` + `customCursorShared.ts` | Custom cursor with contextual labels (e.g. BACK) |
| `Lightbox` | `Lightbox.tsx` | Image lightbox |
| `ActivationLever` | `ActivationLever.tsx` + `.module.scss` | Pull-lever button; must be a semantic `<button>` |

## sections/ — Content section components

| Component | File |
|---|---|
| `AboutSection` | `sections/AboutSection.tsx` |
| `BlogSection` | `sections/BlogSection.tsx` |
| `ContactSection` | `sections/ContactSection.tsx` |
| `ExperienceSection` | `sections/ExperienceSection.tsx` |
| `LifeSection` | `sections/LifeSection.tsx` |
| `TweetsSection` | `sections/TweetsSection.tsx` |
| `WorksSection` | `sections/WorksSection.tsx` |

## detail/ — Detail page views

| Component | File |
|---|---|
| `WorkDetailView` | `detail/WorkDetailView.tsx` |
| `ExperienceDetailView` | `detail/ExperienceDetailView.tsx` |
| `LifeDetailView` | `detail/LifeDetailView.tsx` |
| `StandalonePanelState` | `detail/standalone/` subdirectory |

## blog/ — Blog system

| Component | File | Responsibility |
|---|---|---|
| `BlogDetailScaffold` | `blog/BlogDetailScaffold.tsx` | Blog detail page scaffold |
| `BlogStateShell` | `blog/BlogStateShell.tsx` | Blog state machine shell |
| `ProtectedPostGate` | `blog/ProtectedPostGate.tsx` | TOTP gate for protected posts |

## cards/ — Cards

| Component | File |
|---|---|
| `ProjectCard` | `cards/ProjectCard.tsx` |
| `SimpleImageCard` | `cards/SimpleImageCard.tsx` |

## mdx/ — MDX rendering components

| Component | File | Responsibility |
|---|---|---|
| `MDXComponents` | `mdx/MDXComponents.tsx` | Custom MDX component mapping |
| `Term` | `mdx/Term.tsx` | Ruby annotation (proper noun / abbreviation / short note) |
| `Explain` | `mdx/Explain.tsx` | Tooltip / mobile bottom sheet for long annotations |

## shared/ — Shared UI components

| Component | File | Responsibility |
|---|---|---|
| `AnimatedTitleChars` | `shared/AnimatedTitleChars.tsx` | Animated title characters (defaults to uppercase; blog titles must pass `uppercase={false}`) |
| `HomeLoadingScreen` | `shared/HomeLoadingScreen.tsx` | Home page loading sequence |
| `LoadingScreen` | `shared/LoadingScreen/` subdir | Loading screen |
| `HreflangLinks` | `shared/HreflangLinks.tsx` | SEO hreflang tags |
| `LanguageSwitcher` | `shared/LanguageSwitcher.tsx` | Language switcher |
| `LazyImage` | `shared/LazyImage.tsx` | Lazy-loaded image |
| `LocaleFallbackBanner` | `shared/LocaleFallbackBanner.tsx` | Missing translation banner |
| `NotFoundView` | `shared/NotFoundView.tsx` | 404 view |
| `ShinyText` | `shared/ShinyText.tsx` | Shiny text effect |
| `VerticalShinyText` | `shared/VerticalShinyText.tsx` | Vertical shiny text |
| `SkillTree` | `shared/SkillTree.tsx` | Skill tree visualization |
| `Timeline` | `shared/Timeline.tsx` | Timeline component |

## telemetry/ — Telemetry

| Component | File | Responsibility |
|---|---|---|
| `TelemetryRoot` | `telemetry/TelemetryRoot.tsx` | Telemetry root; mounts provider only when env-enabled |
| `VercelTelemetry` | `telemetry/VercelTelemetry.tsx` | `@vercel/analytics` + `@vercel/speed-insights` integration |

## Component hierarchy

```
_app.tsx
  └─ NextIntlClientProvider
       └─ SiteAssetsProvider
            └─ AppProvider
                 └─ TransitionProvider
                      └─ MainLayout
                           ├─ LeftPanel
                           ├─ GlobalHud
                           ├─ [dynamic] TesseractExperience / RainMorimeEffect / CustomCursor
                           ├─ HomeLoadingScreen
                           ├─ RouteLoadingOverlay
                           └─ [page content]
                                ├─ NavigationColumns (home)
                                ├─ SectionPageLayout (section pages)
                                │   └─ AboutSection / BlogSection / ...
                                └─ DetailView (detail pages)
                                     └─ BlogDetailScaffold
                                          ├─ BlogStateShell
                                          └─ ProtectedPostGate
```

## Key constraints

- Three.js components (`TesseractExperience`, `RainMorimeEffect`) are all dynamically imported with `ssr: false`; once `webglReady`, they never unmount to avoid GPU context churn (GOTCHAS #20)
- `CustomCursor` hover state must go through the reset helper, never directly mutate internal refs (GOTCHAS #12)
- `ActivationLever` must be a semantic `<button>`, not a `<div>` (GOTCHAS #15)
- `AnimatedTitleChars` defaults to uppercase; blog titles must pass `uppercase={false}` (GOTCHAS #17)
- `navigateTo()` is the only supported internal navigation method; `router.push()` skips transition animations (GOTCHAS #6)
