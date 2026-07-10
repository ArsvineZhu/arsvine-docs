---
title: 视觉语言
description: 色板、间距、栅格、关键组件骨架。
---

# 视觉语言

Realm 的视觉语言是「末世 HUD」：低饱和、强对比、扫描式、装饰几何感。设计上不追求精致细腻，追求「在路上的机器」感。

## 色板

```scss
// styles/globals.scss（精简）
--color-bg-primary: #0a0c10;     // 主背景
--color-bg-secondary: #10141b;   // 次背景（侧栏 / overlay）
--color-fg-primary: #e2e6ec;     // 主文字
--color-fg-secondary: #9aa1ad;   // 次文字
--color-fg-tertiary: #5b6371;    // 三级文字（标签 / 数字）

--color-accent-amber: #ffb454;   // 主色（琥珀）
--color-accent-blue: #5db9ff;    // 副色（蓝灰）
--color-accent-rose: #ff5b5b;    // 警示
--color-accent-mint: #5eddc1;    // 状态指示
--color-accent-violet: #b48bff;  // 链接 / hover
```

琥珀 + 蓝灰是 HUD 基础二元色；薄荷与紫罗兰只在状态指示与链接使用，避免与琥珀抢戏。

## 间距

8pt 基准：

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

常用节奏：4 / 8 / 16 / 24 / 40 / 64。

## 栅格

- 容器最大宽度 1200px（`--container-max`）
- 正文区最大 720px（`--reading-max`）
- 移动端断点 768px；平板 1024px；桌面 1280px+
- 桌面端左侧 HUD 固定 240px

## 关键组件

### GlobalHud

`components/layout/GlobalHud.tsx`：固定在视口顶部的状态条，左侧站点名 + 实时数据，右侧时间戳 + 状态点。永远显示。

### LeftPanel

`components/layout/LeftPanel.tsx`：左侧固定面板，分三段：

- `_left-panel-core.scss`：logo / 状态核心
- `_left-panel-nav.scss`：主导航（5 列）
- `_left-panel-status.scss`：底部状态行（电池 / 信号 / 模式）

抽屉模式下变 bottom sheet。

### NavigationColumns

`components/layout/NavigationColumns.tsx`：首页 5 个主导航栏，列之间有扫描式分隔线，hover 时 column retract/expand。

### LoadingScreen

`components/shared/LoadingScreen/`：

- `IndustrialHud.tsx`：工业 HUD 风格背景
- `LogoTitle.tsx`：站名 logo 打字效果
- `TerminalConsole.tsx`：终端式加载日志
- `SplitTransition.tsx`：左右分割的过渡

### CustomCursor

`components/interactive/CustomCursor.tsx`：自定义光标，支持 hover label（如「BACK」、「OPEN」）。GOTCHAS 第 7、12 条相关。

## 装饰几何

- 角部 chunk corner：`::before` / `::after` 绘制 L 形角标
- 扫描线：CSS `repeating-linear-gradient` 模拟 CRT 扫描
- 噪点：`components/effects/Noise.tsx` + `styles/effects/Noise.module.scss`
- tesseract：充电时显示的 4D 超正方体（`components/effects/Tesseract.tsx`）
