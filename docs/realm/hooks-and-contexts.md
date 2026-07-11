---
title: Hooks 与 Contexts
description: 22 个自定义 hooks 与 4 个 contexts 的用途与关系。
---

# Hooks 与 Contexts

## 4 个 Contexts

### AppContext (`contexts/AppContext.tsx`)

站级交互态与效果状态。提供：

- loading 序列状态
- power / battery / inversion 状态
- 实时统计（FPS 等）
- 首页打字机效果控制
- column hover 状态

所有子组件通过 `useAppContext()` 消费。

### TransitionContext (`contexts/TransitionContext.tsx`)

控制路由过渡动画。提供：

- `navigateTo(url)` — **所有内部跳转必须用这个**，不能用 `router.push()`（GOTCHAS #6）
- `setBackOverride()` — 让 detail view 和 lightbox 拦截 BACK 行为

通过 `useTransition()` 消费。

### LayoutAnchorsContext (`contexts/LayoutAnchorsContext.tsx`)

注册 active scroll container。因为 layout 用锁定高度的内容容器，深链 scroll 必须打到那个容器而不是 document viewport。

### SiteAssetsContext (`contexts/SiteAssetsContext.tsx`)

提供 site-shell 资源（`favicon`、`og:image`、`avatar`）的 catalog 解析结果。消费自 `/api/assets/home` 的响应。

## 22 个 Hooks

### 性能与设备

| Hook | 文件 | 职责 |
|---|---|---|
| `useAdaptivePerformance` | `hooks/useAdaptivePerformance.ts` | 四档自适应性能控制（full / balanced / reduced / minimal），含运行时 FPS 采样 |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | CSS media query 响应式监听 |
| `useMobileTesseractCharge` | `hooks/useMobileTesseractCharge.ts` | 移动端 tesseract 充电逻辑 |

### 博文系统

| Hook | 文件 | 职责 |
|---|---|---|
| `useBlogPostState` | `hooks/useBlogPostState.ts` | 博文状态机（idle → checking → granted/required → loading → ready/error） |

### 路由与导航

| Hook | 文件 | 职责 |
|---|---|---|
| `useLayoutRouteMode` | `hooks/useLayoutRouteMode.ts` | 布局路由模式判定 |
| `useRouteLoadingKind` | `hooks/useRouteLoadingKind.ts` | 按「离开路径」决定 loading 覆盖层变体（source-driven，不是 target-driven） |
| `useDrawerNavigation` | `hooks/useDrawerNavigation.ts` | 抽屉导航控制 |

### 详情页

| Hook | 文件 | 职责 |
|---|---|---|
| `useDetailHeroParallax` | `hooks/useDetailHeroParallax.ts` | 详情页 hero 视差 |
| `useDetailScrollReveal` | `hooks/useDetailScrollReveal.ts` | 详情页滚动揭示动画 |
| `useDetailSectionNav` | `hooks/useDetailSectionNav.ts` | 详情页段导航 |
| `useDetailTitleReveal` | `hooks/useDetailTitleReveal.ts` | 详情页标题揭示动画 |

### 打字机效果

| Hook | 文件 | 职责 |
|---|---|---|
| `useTypingEffect` | `hooks/useTypingEffect.ts` | 基础打字机效果（Unicode script 分 Latin / CJK 路径，GOTCHAS #26） |
| `useTypingSubtitle` | `hooks/useTypingSubtitle.ts` | 首页副标题打字机 |

### 交互与 UI

| Hook | 文件 | 职责 |
|---|---|---|
| `useCursorTargetRegistry` | `hooks/useCursorTargetRegistry.ts` | 自定义光标目标注册 |
| `useGalleryLightbox` | `hooks/useGalleryLightbox.ts` | 画廊灯箱控制 |
| `usePowerSystem` | `hooks/usePowerSystem.ts` | 电源系统 |
| `useRealtimeStats` | `hooks/useRealtimeStats.ts` | 实时统计（FPS、内存等） |
| `useLoadingSystem` | `hooks/useLoadingSystem.ts` | loading 系统 |
| `useStandalonePanelState` | `hooks/useStandalonePanelState.ts` | standalone panel 状态 |
| `useAnimationSequence` | `hooks/useAnimationSequence.ts` | 动画序列编排 |
| `useColumnHover` | `hooks/useColumnHover.ts` | 首页列 hover 状态 |
| `useVisitorLanguageCode` | `hooks/useVisitorLanguageCode.ts` | 访客语言代码检测 |

### 工具类

| Hook | 文件 | 职责 |
|---|---|---|
| `useSafeTimeouts` | `hooks/use-safe-timeouts.ts` | 安全的 setTimeout 封装，组件卸载时自动清理 |

## Contexts 与 Hooks 的关系

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

独立（不依赖 context）
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
