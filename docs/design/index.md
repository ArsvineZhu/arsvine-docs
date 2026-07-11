---
title: 概览
description: Realm 视觉系统、字阶、加载过渡、Three.js 效果、与其他设计语言的关系。
---

# Design System 概览

Realm 的视觉系统是「post-apocalyptic HUD」：低饱和、扫描式、强对比、装饰几何感。本节不是品牌手册，而是给编码者看的「在哪改、怎么改、不要动什么」。

## 哪里看

- 字阶与字体变量：`styles/globals.scss` 的 CSS variables（`--font-display` / `--font-hud` / `--font-reading` / `--font-typewriter`）
- 色板与令牌：同一文件 `styles/globals.scss`
- 动画 keyframes：`styles/_animations.scss` + `styles/detail-standalone/_keyframes.scss`
- 3D 效果：`components/effects/` 下 `RainMorimeEffect.tsx` / `Tesseract.tsx` / `TesseractExperience.tsx`
- 加载与过渡：`components/shared/LoadingScreen/*` + `components/layout/RouteLoadingOverlay.tsx` + `contexts/TransitionContext.tsx`
- HUD 与左面板：`components/layout/GlobalHud.tsx` + `LeftPanel.tsx`
- 打字机与签名：`hooks/useTypingEffect.ts` + `useTypingSubtitle.ts` + `lib/typing-effect.ts` + `lib/hud-typing-visibility.ts`

## 阅读顺序

1. `typography-and-fonts` — 字体变量与用法
2. `visual-language` — 色板、间距、栅格、关键组件
3. `loading-and-transitions` — 启动页、路由过渡、loading overlay
4. `three-effects` — Three.js 效果与自适应性能联动

## 不在本文档里

- 私有设计稿（Figma / Sketch）不入版本控制
- 具体 UI 文案走 `locales/<locale>.json` 与 `data/site.ts`
- 友链与第三方图像在 `data/friendLinks/` 与 `data/site.ts.pages.friends.services`
