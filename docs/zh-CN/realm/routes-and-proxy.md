---
title: 路由与 proxy 中间件
description: 路由形态、proxy.ts 的职责、与 i18n/config.ts 的关系。
---

# 路由与 proxy 中间件

## 路由形态

所有用户可见页面都在 `pages/[locale]/...` 下。locale 必须是 `i18n/config.ts` 里 `locales` 数组的成员之一（`zh-CN` / `zh-TW` / `en`）。URL 形如：

```text
/<locale>
/<locale>/content
/<locale>/works
/<locale>/web/<id>
/<locale>/life/<slug>
/<locale>/blog/<slug>
/<locale>/access/<group>
/<locale>/rss.xml
```

裸路径（`/`、`/content`、`/web/3` 等）由 `proxy.ts` 中间件 308 重定向到带 locale 的形式。

## proxy.ts

Next.js 16 把中间件入口从 `middleware.ts` 改名为 `proxy.ts`。本仓库的 `proxy.ts` 负责两件事：

1. **locale 路由**：对裸路径根据 `NEXT_LOCALE` cookie > `Accept-Language` > `zh-CN` 选一个 locale，前置成 `/{locale}/...` 再 308。
2. **GEO_COUNTRY cookie**：把 Vercel 边缘 `geolocation(request).country` 写到 `GEO_COUNTRY` cookie，TTL 12h。客户端 `_document` 内联脚本读这个 cookie 写 `<html data-country>`，驱动 B 站等 region-only UI 微调。

### 旁路（bypass）规则

`proxy.ts` 完全跳过这些前缀，让它们不进入 i18n 路由逻辑：

```text
/api, /_next, /_vercel, /favicon.ico, /apple-touch-icon.png,
/icons, /fonts, /images, /decor, /music, /robots.txt,
/sitemap.xml, /rss.xml
```

任何带文件扩展名的路径（`/\.[a-z0-9]+$/i`）也直接旁路。`pages/[locale]` 路由不会以扩展名结尾，所以这个判断是安全的。

### 防 `/en/fr/web/1` bug

为了避免把「长得像 locale 但不在支持列表」的路径段错误地当作裸业务路径再前置 locale，`proxy.ts` 用 `LOOKS_LIKE_LOCALE = /^[a-z]{2}(-[A-Za-z]{2,4})?$/` 检测首段。如果首段匹配（比如 `/fr/web/1`），会被剥掉再前置选中的 locale，而不是拼出 `/en/fr/web/1` 这种 404 路径。

### `?_geo=` 调试覆盖

`proxy.ts` 支持 `?_geo=US` 临时覆盖 country（写进 cookie），`?_geo=` 清空覆盖。这个能力主要给开发调试和 VPN 切换后强制刷新用，不参与任何权限决策。

## i18n/config.ts

`i18n/config.ts` 是 locale 信息的单一信息源：

| 字段 | 用途 |
|---|---|
| `locales` | UI locales 元组（`['zh-CN', 'zh-TW', 'en']`） |
| `defaultLocale` | 缺译回退目标，固定 `zh-CN` |
| `htmlLangMap` | locale → `<html lang>` 的 BCP-47 值（`zh-CN` → `zh-Hans-CN`） |
| `ogLocaleMap` | locale → `og:locale`（Facebook 风格下划线） |
| `rssLanguageMap` | locale → RSS `<language>` 字段 |
| `localeShortLabel` | locale → LanguageSwitcher 上显示的短标签（`简中` / `繁中` / `ENG`） |
| `localeNativeName` | locale → LocaleFallbackBanner 上显示的全名 |

辅助函数 `isLocale(value)`、`getLocaleFromPath(path)`、`resolveLocale(rawLocale, path)` 都被 `proxy.ts` 和页面侧的 `getStaticProps` 共用。

修改 locales 数组必须同步：locales JSON 三份文件齐全、`data/<topic>/<locale>.ts` 缺译时回退到 defaultLocale、`proxy.ts` 的 locale 检测、sitemap / RSS / hreflang 输出。

## Locale 解析顺序（必须遵守）

```text
NEXT_LOCALE cookie > Accept-Language > zh-CN
```

不要用 IP / 国家做语言推断。`GEO_COUNTRY` cookie 只用于 UI 微调，不参与 locale 选择。这条规则在 `docs/GOTCHAS.md` 第 19 条被显式标记为「不要改」。
