---
title: RSS / Sitemap / Robots
description: 动态生成的 SEO 文件、URL 模板、运行时触发。
---

# RSS / Sitemap / Robots

三个 SEO / feed 文件都是运行时动态生成，**不**是构建期静态产物。

## Sitemap

`/sitemap.xml` 由 Pages Router 顶层 handler（不在 `pages/[locale]/` 下）动态生成。内容来源：

- `i18n/config.ts` 的 `locales` 数组（每个 locale 一组 URL）
- `data/site.ts` 的 `url`（canonical base）
- `data/projects`（所有 web / game / early 项目 ID）
- `data/life`（所有 life slug）
- 外部 `blog-index.json`（如果配置了外部 content repo）

URL 模板：

```text
<base>/<locale>
<base>/<locale>/content
<base>/<locale>/works
<base>/<locale>/experience
<base>/<locale>/life
<base>/<locale>/friends
<base>/<locale>/about
<base>/<locale>/contact
<base>/<locale>/tweets
<base>/<locale>/copyright
<base>/<locale>/web/<id>
<base>/<locale>/life/<slug>
<base>/<locale>/blog/<slug>
```

每条带 `<lastmod>` `<changefreq>` `<priority>`。`<priority>` 在 0.5-0.8 区间，home 0.8，详情页 0.6。

## RSS

每个 locale 一份：`/{locale}/rss.xml`，由 `pages/[locale]/rss.xml.tsx` 生成。

- `<channel>` 的 `<title>` / `<description>` / `<language>`（来自 `rssLanguageMap`）/ `<link>` / `<lastBuildDate>` 都来自 `data/site.ts` + `i18n/config.ts`
- `<item>` 来自外部 `blog-index.json`，按发布日期倒序
- 未配置外部仓库时 items 为空（仅 channel 元数据）

## Robots

`/robots.txt` 动态生成：

```text
User-agent: *
Allow: /
Sitemap: <base>/sitemap.xml
```

`<base>` 用 `data/site.ts` 的 `url`（兜底 `https://arsvine.com`）。

## Hreflang

`components/shared/HreflangLinks.tsx` 在每个 locale 页 head 渲染三组 `<link rel="alternate" hreflang="...">`，让搜索引擎知道三语对应关系。`hreflang` 值用 `i18n/config.ts` 的 `htmlLangMap`（BCP-47）。

## 验证

部署后：

```bash
curl -I https://arsvine.com/sitemap.xml
curl -I https://arsvine.com/zh-CN/rss.xml
curl -I https://arsvine.com/robots.txt
```

并用浏览器或 `curl https://arsvine.com/sitemap.xml | head -50` 检查 URL 完整性，特别是新加的页面是否被收录。

## URL 生成的安全约束

- `<base>` 来自 `data/site.ts.siteConfig.url` 或 `process.env.NEXT_PUBLIC_SITE_URL`，**不**接受运行时请求注入
- 路径段必须过白名单字符（locale + topic + id/slug 各自的正则）
- 任何 untrusted 字符串都先过 `lib/redirect-helpers.ts` / `lib/blog-client.ts` 的 helper，再拼到 URL
