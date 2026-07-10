---
title: 加载与过渡
description: 启动页、路由过渡、loading overlay 的触发与变体。
---

# 加载与过渡

Realm 的加载 / 过渡系统由「启动页 + 路由过渡 + 路由级 loading overlay」三段组成。每一段都有独立组件与触发条件。

## 启动页（HomeLoadingScreen）

`components/shared/HomeLoadingScreen.tsx` + `LoadingScreen/*`：

- 工业 HUD 背景
- 站名打字效果（`LogoTitle.tsx` + `lib/typing-effect.ts`）
- 终端式加载日志（`TerminalConsole.tsx`）
- 左右分割过渡（`SplitTransition.tsx`）

触发：站点首屏 hydration 之后，由 `useLoadingSystem()` 协调；动画序列结束（`animationsComplete`）后才允许 `useAdaptivePerformance` 启动运行时采样。

## 路由过渡

`contexts/TransitionContext.tsx` 是单一信息源：

- 提供 `useTransition()` hook
- 内部跳转用 `useTransition().navigateTo(url)`
- 详情 view / lightbox 可以 `setBackOverride()` 拦截 BACK 行为

`useLayoutRouteMode(router)` 决定当前路由的 layout 模式（left-panel / drawer-mobile / standalone），与路由过渡动画一起驱动 column retract/expand。

## 路由级 loading overlay

`components/layout/RouteLoadingOverlay.tsx` + `hooks/useRouteLoadingKind(router)`：

- 选择 loading 变体时按「**离开的路径**」决定，不是「目标路径」
- 离开的路径是 `home` 或 `content` → 默认右侧 overlay（左 HUD 仍可见）
- 离开的路径是 `blog detail` → standalone overlay（左 HUD 已隐藏）

**不能**改成「按目标路径」——会破坏 home→detail 或 detail→detail 中的一种方向。GOTCHAS 第 7 条。

## 路由过渡不能跳过

任何内部跳转必须 `useTransition().navigateTo(url)`。`router.push()` 会：

- 跳过 home / content / detail 的运动编排
- 让左 HUD 与右 column 不同步
- 让 detail view 的入场动画失效
- 破坏 BACK 拦截

GOTCHAS 第 6 条。

## 受保护博文的过渡

`hooks/useBlogPostState.ts` 协调「auth-checking loading shell」与「实际渲染」。过渡期间，loading shell 接管视觉，正文到位后再 cross-fade。`BlogStateShell` 负责 shell 形态。

## 自定义光标与过渡

`components/interactive/customCursorShared.ts` 维护 hover 状态；路由切换 / 滚动 / blur / visibilitychange / DOM 卸载后**必须**用 reset helper 清状态，不能直接改内部 ref。GOTCHAS 第 12 条。

## 性能联动

启动页 + 路由过渡都依赖 GSAP + Web Animations API。它们在 `useAdaptivePerformance` 的 `allowDecorativeMotion` 能力位上挂载——`reduced` 与 `minimal` 档会跳过装饰动画但保留功能过渡（如 fade-in）。

## 调试

dev 模式下：

- `localStorage.setItem('arsvine-skip-loading', '1')` 可跳过启动页（仅 dev 有效）
- `useTransition()` 暴露 `__debug` 入口，可强制走某个变体
- React DevTools 选 `TransitionContext.Provider` 看当前 transition state
