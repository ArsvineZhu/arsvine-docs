---
title: Three.js 效果
description: 桌面端 WebGL 效果、动态导入、性能联动、移动端回退。
---

# Three.js 效果

Realm 的 Three.js 效果只在**桌面端**启用，按 `useAdaptivePerformance` 的能力位动态挂载。移动端走简化回退，不进 GPU 上下文。

## 三个效果

### RainMorimeEffect

`components/effects/RainMorimeEffect.tsx`：末世氛围雨粒子效果。背景层，挂在 `MainLayout` 之下。

- 10000+ 粒子
- InstancedMesh
- 性能档 `full` / `balanced` 启用（`allowAmbientWebGL`）

### TesseractExperience

`components/effects/TesseractExperience.tsx`：交互式充电 / 物理效果，用 `@react-three/cannon` + `cannon-es`。

- 4D 超正方体在 3D 空间旋转
- 用户滚动 / 鼠标移动驱动物理
- 性能档 `full` / `balanced` / `reduced` 启用（`allowInteractiveWebGL`）
- 移动端走 `useMobileTesseractCharge` 简化版（CSS 动画）

### Tesseract

`components/effects/Tesseract.tsx`：静态 tesseract SVG 装饰，挂在 loading screen。

- 纯 SVG，不进 GPU
- 所有性能档启用

## 动态导入与 SSR 关闭

```ts
const RainMorimeEffect = dynamic(() => import('@/components/effects/RainMorimeEffect'), { ssr: false });
const TesseractExperience = dynamic(() => import('@/components/effects/TesseractExperience'), { ssr: false });
```

SSR 关闭避免 `window` / `WebGLRenderingContext` 在 Node 端报错。

## 不要 churn GPU 上下文

WebGL 效果**不应**在路由切换时被反复 unmount → mount。`components/layout/MainLayout.tsx` 维持一个稳定的 effect container，路由切换只切换上层 React 树，效果本身在 ready 之后常驻。

理由：每次 mount 创建新的 WebGL context（`canvas.getContext('webgl2')`），频繁创建/销毁会让桌面 GPU 驱动进入不稳定状态，jank 与崩溃概率上升。GOTCHAS 第 20 条。

## 性能联动

```ts
const { allowAmbientWebGL, allowInteractiveWebGL } = useAdaptivePerformance();

return (
  <>
    {allowAmbientWebGL && <RainMorimeEffect />}
    {allowInteractiveWebGL && <TesseractExperience />}
  </>
);
```

`tier` 变化时 React 会重渲染，能力位变化驱动 effect mount / unmount。效果模块本身**不**直接读 `navigator` 信号。

## 移动端回退

`tier === 'minimal'` 时 `allowInteractiveWebGL === false`，`<TesseractExperience />` 卸载，`<Tesseract />`（SVG 版）保留。

`useMobileTesseractCharge()` 在 mobile breakpoint（`useMediaQuery`）下提供简化版 charge 行为（CSS transform + opacity 动画），不创建 GPU context。

## 调试

- `localStorage.setItem('arsvine-tier', 'minimal')` 强制降到最低档
- React DevTools Profiler 看 effect mount 频率
- 浏览器 DevTools → Performance → 录一段路由切换，验证 GPU context 数量稳定

## 新增 WebGL 效果的清单

1. 用 `dynamic(() => import(...), { ssr: false })`
2. 接受 tier 变化的 mount / unmount，不要自管理
3. 不要在 useEffect 里读 `navigator`
4. 处理 module load failure（component 应能容忍 import 失败）
5. 测试 tier 切换、路由切换、移动端 breakpoint 三种路径
