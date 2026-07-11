---
title: 自适应性能
description: useAdaptivePerformance 的设计、检测、采样、档位迁移。
---

# 自适应性能

Realm 在客户端维持一个**四档自适应** `PerformanceTier`，让不同效果绑到「能力位」上而不是设备判断。完整代码在 `hooks/useAdaptivePerformance.ts`。

## 为什么是「能力位」而不是媒体查询

直接判断 `navigator.userAgent` 或 `window.innerWidth` 会让效果与设备型号耦合，跨设备升级时容易回归。能力位是抽象层：

```ts
// 组件里
const { allowAmbientWebGL, allowHeavyCssEffects } = useAdaptivePerformance();
// 读 allow* 位，而不是判断设备
```

效果模块按能力位挂载 / 卸载，tier 变化由 hook 统一协调。

## 四档

| 档 | Logo 动效 | 环境 WebGL | 重 CSS | 交互 WebGL | 自定义光标 | 装饰动效 |
|---|---:|---:|---:|---:|---:|---:|
| `full` | on | on | on | on | on | on |
| `balanced` | off | on | on | on | on | on |
| `reduced` | off | off | off | on | on | on |
| `minimal` | off | off | off | off | off | off |

logo 在所有档都可见，`balanced` 上去掉 pointer listener、animation frame loop、彩色 drop shadow。

`buildPerformanceState(tier, reason)` 是能力位的唯一映射函数，所有组件读它，不自己映射。

## 启发式上限

`resolveHeuristic()` 在 hydration 后从环境信号推出 `maxTier`：

| 信号 | maxTier | reason |
|---|---|---|
| `prefers-reduced-motion: reduce` | `minimal` | `'reduced-motion'` |
| `navigator.connection.saveData === true` | `reduced` | `'device-heuristic'` |
| `navigator.connection.effectiveType` ∈ `slow-2g` / `2g` / `3g` | `reduced` | `'device-heuristic'` |
| `navigator.deviceMemory <= 4` 或 `navigator.hardwareConcurrency <= 4` | `balanced` | `'device-heuristic'` |
| 其他 | `full` | `null` |

SSR 阶段 client-only 信号拿不到，临时给 `full`，hydration 后再 reconcile。

运行时档位**永远不会**超过 `maxTier`。如果 `maxTier = 'reduced'`，运行时档最多升到 `reduced`，不会跳到 `full`。

## 运行时采样

动画序列结束（`animationsComplete`）后启动 `requestAnimationFrame` 采样循环。每个采样窗口最长 **120 帧 或 2500ms**，先到为准。

帧间隔 > 32ms 视为「慢帧」。窗口判定：

- 平均 FPS < 45 或 慢帧比 ≥ 25% → poor window
- 平均 FPS ≥ 55 且 慢帧比 ≤ 10% → healthy window
- 其他 → 中性，不变

档位迁移：

- 连续 2 个 poor window → 降一档（**5s 冷却**）
- 连续 3 个 healthy window → 升一档（**10s 冷却**；且不超过 maxTier）
- 其他 → 不变

reason 在 runtime 切换时变为 `'runtime-fps'`，回到 maxTier 时回到 `null`。

`lastTierChangeRef` 维护冷却时间戳。`useEffect` cleanup 调 `cancelAnimationFrame`，卸载时停采样。

档位变化写 `<html data-performance-tier="...">`，CSS 可以基于属性做条件样式。

## 约束

- 任何新效果都**不**直接读 `navigator.userAgent` / `navigator.deviceMemory` / `matchMedia('(prefers-reduced-motion)')`——一律读 `useAdaptivePerformance()` 的能力位
- 可选效果必须**容忍被卸载**：tier 变化会触发 effect cleanup
- 模块加载失败要 swallow
- 不要把 tier 数字硬编码到组件
