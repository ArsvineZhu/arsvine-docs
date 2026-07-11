---
title: 组件架构
description: 50+ 组件的分类与职责，按目录划分。
---

# 组件架构

Realm 的组件分布在 `components/` 下 10 个子目录中，约 50 个文件。本节按目录列出每个组件的实际用途。

## layout/ — 布局骨架

| 组件 | 文件 | 职责 |
|---|---|---|
| `MainLayout` | `MainLayout.tsx` | 全局布局根组件。组合 `LeftPanel`、`GlobalHud`，动态导入 `TesseractExperience` / `RainMorimeEffect` / `CustomCursor`（均 `ssr: false`），挂载 `HomeLoadingScreen`、`RouteLoadingOverlay`、`MusicPlayer`，注册 scroll anchor，处理 content hash 导航 |
| `GlobalHud` | `GlobalHud.tsx` | 顶部 HUD 装饰栏（时钟等） |
| `LeftPanel` | `LeftPanel.tsx` | 左侧导航面板 |
| `NavigationColumns` | `NavigationColumns.tsx` | 首页 5 个主导航列 |
| `RouteLoadingOverlay` | `RouteLoadingOverlay.tsx` | 路由过渡 loading 覆盖层 |
| `SectionPageLayout` | `SectionPageLayout.tsx` | 章节页通用布局容器 |

## effects/ — WebGL 与视觉效果

| 组件 | 文件 | 职责 |
|---|---|---|
| `Tesseract` | `Tesseract.tsx` | SVG 回退版 tesseract（桌面端） |
| `TesseractExperience` | `TesseractExperience.tsx` | 交互式 3D tesseract（`@react-three/cannon` 物理引擎，桌面端专属） |
| `RainMorimeEffect` | `RainMorimeEffect.tsx` | 大气雨粒子效果（10000+ 粒子） |
| `Noise` | `Noise.tsx` | 噪点覆盖层 |

## interactive/ — 交互组件

| 组件 | 文件 | 职责 |
|---|---|---|
| `MusicPlayer` | `MusicPlayer.tsx` + `music-player/` 子目录 + `.module.scss` | 全功能音乐播放器 |
| `CustomCursor` | `CustomCursor.tsx` + `customCursorShared.ts` | 自定义光标，支持 contextual label（如 BACK） |
| `Lightbox` | `Lightbox.tsx` | 图片灯箱 |
| `ActivationLever` | `ActivationLever.tsx` + `.module.scss` | 拉杆按钮，语义上必须是 `<button>` |

## sections/ — 内容聚合页的各段

| 组件 | 文件 |
|---|---|
| `AboutSection` | `sections/AboutSection.tsx` |
| `BlogSection` | `sections/BlogSection.tsx` |
| `ContactSection` | `sections/ContactSection.tsx` |
| `ExperienceSection` | `sections/ExperienceSection.tsx` |
| `LifeSection` | `sections/LifeSection.tsx` |
| `TweetsSection` | `sections/TweetsSection.tsx` |
| `WorksSection` | `sections/WorksSection.tsx` |

## detail/ — 详情页视图

| 组件 | 文件 |
|---|---|
| `WorkDetailView` | `detail/WorkDetailView.tsx` |
| `ExperienceDetailView` | `detail/ExperienceDetailView.tsx` |
| `LifeDetailView` | `detail/LifeDetailView.tsx` |
| `StandalonePanelState` | `detail/standalone/` 子目录 |

## blog/ — 博文系统

| 组件 | 文件 | 职责 |
|---|---|---|
| `BlogDetailScaffold` | `blog/BlogDetailScaffold.tsx` | 博文详情页脚手架 |
| `BlogStateShell` | `blog/BlogStateShell.tsx` | 博文状态机外壳 |
| `ProtectedPostGate` | `blog/ProtectedPostGate.tsx` | 受保护博文 TOTP 门禁 |

## cards/ — 卡片

| 组件 | 文件 |
|---|---|
| `ProjectCard` | `cards/ProjectCard.tsx` |
| `SimpleImageCard` | `cards/SimpleImageCard.tsx` |

## mdx/ — MDX 渲染组件

| 组件 | 文件 | 职责 |
|---|---|---|
| `MDXComponents` | `mdx/MDXComponents.tsx` | 自定义 MDX 组件映射 |
| `Term` | `mdx/Term.tsx` | ruby 注释（proper noun / 缩写 / 短注） |
| `Explain` | `mdx/Explain.tsx` | tooltip / 移动端底部 sheet，长句注 |

## shared/ — 共享 UI 组件

| 组件 | 文件 | 职责 |
|---|---|---|
| `AnimatedTitleChars` | `shared/AnimatedTitleChars.tsx` | 动画标题字符（默认 uppercase，博文必须传 `uppercase={false}`） |
| `HomeLoadingScreen` | `shared/HomeLoadingScreen.tsx` | 首页加载序列 |
| `LoadingScreen` | `shared/LoadingScreen/` 子目录 | 加载屏幕 |
| `HreflangLinks` | `shared/HreflangLinks.tsx` | SEO hreflang 标签 |
| `LanguageSwitcher` | `shared/LanguageSwitcher.tsx` | 语言切换器 |
| `LazyImage` | `shared/LazyImage.tsx` | 懒加载图片 |
| `LocaleFallbackBanner` | `shared/LocaleFallbackBanner.tsx` | 缺译提示横幅 |
| `NotFoundView` | `shared/NotFoundView.tsx` | 404 视图 |
| `ShinyText` | `shared/ShinyText.tsx` | 光泽文字效果 |
| `VerticalShinyText` | `shared/VerticalShinyText.tsx` | 纵向光泽文字 |
| `SkillTree` | `shared/SkillTree.tsx` | 技能树可视化 |
| `Timeline` | `shared/Timeline.tsx` | 时间线组件 |

## telemetry/ — 遥测

| 组件 | 文件 | 职责 |
|---|---|---|
| `TelemetryRoot` | `telemetry/TelemetryRoot.tsx` | 遥测根组件，按 env 决定是否挂载 |
| `VercelTelemetry` | `telemetry/VercelTelemetry.tsx` | `@vercel/analytics` + `@vercel/speed-insights` 集成 |

## 组件层次

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
                                ├─ SectionPageLayout (章节页)
                                │   └─ AboutSection / BlogSection / ...
                                └─ DetailView (详情页)
                                     └─ BlogDetailScaffold
                                          ├─ BlogStateShell
                                          └─ ProtectedPostGate
```

## 关键约束

- Three.js 组件（`TesseractExperience`、`RainMorimeEffect`）全部动态导入 + `ssr: false`，一旦 `webglReady` 不再卸载以避免 GPU context 重建（GOTCHAS #20）
- `CustomCursor` 的 hover 状态必须走 reset helper，不能直接动内部 ref（GOTCHAS #12）
- `ActivationLever` 语义上必须是 `<button>`，不能改为 `<div>`（GOTCHAS #15）
- `AnimatedTitleChars` 默认 uppercase，博文标题必须显式传 `uppercase={false}`（GOTCHAS #17）
- `navigateTo()` 是唯一受支持的内部导航方式，`router.push()` 跳过过渡动画（GOTCHAS #6）
