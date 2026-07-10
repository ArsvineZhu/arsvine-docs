---
title: 地理与可见性
description: GEO_COUNTRY cookie、proxy.ts 注入、region-only UI 微调。
---

# 地理与可见性

Realm 把 Vercel 边缘的地理信号写到客户端 cookie，驱动 B 站等 region-only UI 微调。**不**用于语言选择、权限、限流。

## proxy.ts 的 GEO_COUNTRY 写入

```ts
// proxy.ts
const GEO_COOKIE = 'GEO_COUNTRY';
const GEO_COOKIE_MAX_AGE = 60 * 60 * 12; // 12h
const GEO_OVERRIDE_PARAM = '_geo';
```

解析顺序：

1. URL `?_geo=US` 显式覆盖（dev 调试 / 切 VPN 后强制刷新）
   - `?_geo=` 空值 → 清除覆盖
   - 非两位字母 → 忽略，按未覆盖处理（但仍清 cookie）
2. Vercel 边缘 `geolocation(request).country`（大写两位）
3. 已有 `GEO_COUNTRY` cookie（兜底）

返回 `{ country, overrideAction: 'set' | 'clear' | 'none' }`，`attachGeo()` 据此写 cookie：

- `set` 且与现有值不同 → 写 12h
- `clear` → 写 `maxAge: 0` 删 cookie
- `none` → 不动

## 客户端读取

`_document` 内联脚本读 cookie 写 `<html data-country="US">`（或当前两位码）。hydration 之前同步执行，所以首屏 CSS 就能基于这个属性切换。

`lib/region-visibility.ts` 是统一 helper：

```ts
import { isRegionVisible } from '@/lib/region-visibility';
isRegionVisible('BILIBILI_BLOCKED')  // 返回 boolean
```

B 站嵌入 / 友链 / 联系方式等 region-only 内容都走这个 helper，不直接读 cookie / window。

## 为什么不用 SSR 注入

旧版本（PROBLEM 注释里有记录）尝试在 SSG/ISR 共享缓存层通过 `x-geo-country` 请求头把 country 注入下游 SSR。但 Vercel CDN 缓存会跨访客复用，第一访客的 country 会污染整段缓存窗口，导致 B 站等 region UI 漂移到错误区域。

现方案是**只在客户端**使用 country。SSG 产物不带任何 country 信号，由客户端 bootstrap 脚本读 cookie 写 `<html>` 属性。这样：

- SSG 缓存跨访客安全
- 一次刷新就能反映新 geo
- 客户端 JS 不可用时，region UI 退化到「全显示」或「全隐藏」（由各 helper 决定），不漂移

## Vercel 之外的部署

`@vercel/functions` 的 `geolocation(request)` 在 Vercel 环境之外没有数据，会返回空 country。此时：

- 第一次请求 GEO_COUNTRY cookie 是空串
- `isRegionVisible()` 应返回默认（最宽松或最严格，取决于业务）
- 后续请求如果 cookie 还在就用 cookie

非 Vercel 部署如果需要 region 数据，需要在 `proxy.ts` 里替换 `geolocation(request)` 为等价数据源（CDN header、MaxMind GeoIP2 等），并改 `lib/region-visibility.ts` 配合。

## 安全边界

- GEO_COUNTRY cookie **不**参与任何权限 / 限流 / locale 决策
- URL 里的 `?_geo=` 覆盖只影响 UI 微调，不影响 revalidate、TOTP、access-grant
- `country` 字段永远是大写两位码或空串，没有其他格式
