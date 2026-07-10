---
title: Visual language
description: Color palette, spacing, grid, key component skeletons.
---

# Visual language

Realm's visual language is "post-apocalyptic HUD": low saturation, strong contrast, scan-line feel, decorative geometry. The design favors "a machine on the road" over refinement.

## Color palette

```scss
// styles/globals.scss (simplified)
--color-bg-primary: #0a0c10;     // main background
--color-bg-secondary: #10141b;   // secondary background (sidebar / overlay)
--color-fg-primary: #e2e6ec;     // primary text
--color-fg-secondary: #9aa1ad;   // secondary text
--color-fg-tertiary: #5b6371;    // tertiary text (labels / numbers)

--color-accent-amber: #ffb454;   // primary (amber)
--color-accent-blue: #5db9ff;    // secondary (blue-grey)
--color-accent-rose: #ff5b5b;    // warning
--color-accent-mint: #5eddc1;    // status indicator
--color-accent-violet: #b48bff;  // link / hover
```

Amber + blue-grey form the HUD's primary palette. Mint and violet are reserved for status indicators and links, so they never compete with amber.

## Spacing

8 pt base:

```scss
--space-1: 0.25rem;  //  4px
--space-2: 0.5rem;   //  8px
--space-3: 0.75rem;  // 12px
--space-4: 1rem;     // 16px
--space-6: 1.5rem;   // 24px
--space-8: 2rem;     // 32px
--space-12: 3rem;    // 48px
--space-16: 4rem;    // 64px
```

Common rhythm: 4 / 8 / 16 / 24 / 40 / 64.

## Grid

- Container max width 1200 px (`--container-max`)
- Reading max width 720 px (`--reading-max`)
- Mobile breakpoint 768 px; tablet 1024 px; desktop 1280 px+
- Desktop left HUD is fixed at 240 px

## Key components

### GlobalHud

`components/layout/GlobalHud.tsx`: a status bar pinned to the top of the viewport. Site name + live data on the left; timestamp + status indicators on the right. Always visible.

### LeftPanel

`components/layout/LeftPanel.tsx`: a fixed left panel split into three sections:

- `_left-panel-core.scss`: logo / status core
- `_left-panel-nav.scss`: primary navigation (five columns)
- `_left-panel-status.scss`: bottom status row (battery / signal / mode)

In drawer mode it collapses into a bottom sheet.

### NavigationColumns

`components/layout/NavigationColumns.tsx`: five primary navigation columns on the home page, with scan-line dividers between them; column retract / expand on hover.

### LoadingScreen

`components/shared/LoadingScreen/`:

- `IndustrialHud.tsx`: industrial HUD background
- `LogoTitle.tsx`: site name typing effect
- `TerminalConsole.tsx`: terminal-style loading log
- `SplitTransition.tsx`: left-right split transition

### CustomCursor

`components/interactive/CustomCursor.tsx`: custom cursor with hover labels (e.g. "BACK", "OPEN"). See GOTCHAS items 7 and 12.

## Decorative geometry

- Corner chunk: `::before` / `::after` draw L-shaped corner marks
- Scan lines: CSS `repeating-linear-gradient` simulates a CRT scan
- Noise: `components/effects/Noise.tsx` plus `styles/effects/Noise.module.scss`
- Tesseract: charging-state 4D hypercube (`components/effects/Tesseract.tsx`)
