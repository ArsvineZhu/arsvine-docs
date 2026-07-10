---
title: 性能分层
description: useAdaptivePerformance 的四档自适应与采样规则、能力位。
---

# 性能分层

Realm 的 `hooks/useAdaptivePerformance.ts` 在客户端维持一个四档自适应 `PerformanceTier`，把不同效果绑到「能力位」上。组件读能力位而不是直接判断 `navigator.userAgent` 或 `window.innerWidth`。

## 四档与能力位

| 档 | Logo 动效 | 环境 WebGL | 重 CSS | 交互 WebGL | 自定义光标 | 装饰动效 |
|---|---:|---:|---:|---:|---:|---:|
| `full` | on | on | on | on | on | on |
| `balanced` | off | on | on | on | on | on |
| `reduced` | off | off | off | on | on | on |
| `minimal` | off | off | off | off | off | off |

logo 在所有档都可见，只是 `balanced` 上去掉 pointer listener、animation frame loop、彩色 drop shadow。能力位由 `buildPerformanceState()` 一次性映射，组件读 `useAdaptivePerformance()` 的返回值即可。

## 启发式上限

`resolveHeuristic()` 在 hydration 后从环境信号推出一个**上限**档（`maxTier`），运行时档不会超过这个上限：

| 信号 | 推出的 maxTier | reason |
|---|---|---|
| `prefers-reduced-motion: reduce` | `minimal` | `'reduced-motion'` |
| `navigator.connection.saveData === true` | `reduced` | `'device-heuristic'` |
| `navigator.connection.effectiveType` ∈ `slow-2g` / `2g` / `3g` | `reduced` | `'device-heuristic'` |
| `navigator.deviceMemory <= 4` 或 `navigator.hardwareConcurrency <= 4` | `balanced` | `'device-heuristic'` |
| 其他 | `full` | `null` |

SSR 阶段用不到 client-only 信号，临时给 `full`。

## 运行时采样

动画序列结束（`animationsComplete`）后启动一个 `requestAnimationFrame` 采样循环，每个采样窗口最长 **120 帧 或 2500ms**，以先到为准：

- 帧间隔 > **32ms** 视为「慢帧」
- 平均 FPS < **45** 或 慢帧比 ≥ **25%** → **poor window**
- 平均 FPS ≥ **55** 且 慢帧比 ≤ **10%** → **healthy window**

档位迁移规则：

- **连续 2 个 poor window** → 降一档（5s 冷却）
- **连续 3 个 healthy window** → 升一档（10s 冷却；且不能超过启发式上限）
- 其他 → 不变

`lastTierChangeRef` 维护冷却时间。reason 在 runtime 切换时变为 `'runtime-fps'`，回到 maxTier 时回到 `null`。

档位变化写入 `<html data-performance-tier="...">`，CSS 可以基于此属性做条件样式（比如关掉某些动画）。

## 添加新效果时的约束

- 不要在组件里读 `navigator.userAgent` / `navigator.deviceMemory` / `window.matchMedia('(prefers-reduced-motion)')`——一律读 `useAdaptivePerformance()` 返回的能力位。
- 任何「可选」效果必须**能容忍被卸载**，因为 tier 变化会触发 `useEffect` cleanup。
- 模块加载失败要 swallow（已经有重试在更外层做），不要污染上层错误。
