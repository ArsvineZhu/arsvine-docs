---
title: 字体托管
description: 自托管 Google Fonts 的来源、抓取、上传与元数据。
---

# 字体托管

Realm 不直接走 `fonts.googleapis.com`——国内访问 Google Fonts 不稳定。所有字体文件下载后改写 CSS，托管在 `cdn.arsvine.com/shared/fonts/`。

## 三个字族

| 字族 | 权重 | 用途 |
|---|---|---|
| Dosis | 300 / 400 / 500 | HUD UI 文字主力（拉丁） |
| Noto Sans SC | 300 / 400 / 500 / 700 | 中文正文 + 部分粗体 |
| Noto Serif SC | 400 / 700 | MDX 阅读体（`--font-reading`） |

Noto Serif SC 500 实际未用，已在 `data/site.ts` 里裁掉。三个字族 4 个 `wght` 值切 unicode-range。

## 真理之源

```ts
// data/site.ts
fonts: {
  cdnPreconnect: [
    { href: 'https://cdn.arsvine.com', crossOrigin: 'anonymous' },
  ],
  googleStylesheet:
    'https://fonts.googleapis.com/css2?family=Dosis:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap',
  cdnStylesheet: 'https://cdn.arsvine.com/shared/fonts/google-fonts.css',
}
```

- `cdnPreconnect` 在 `<head>` 加 `<link rel="preconnect">`，缩短 TLS 握手
- `googleStylesheet` 是**输入**，仅给 `scripts/fetch-google-fonts.mjs` 用
- `cdnStylesheet` 是**输出**，浏览器实际加载的 CSS

## 抓取脚本

```bash
node scripts/fetch-google-fonts.mjs
```

脚本做的事：

1. 用现代 Chrome User-Agent 拉 Google CSS
2. 下载所有 `.woff2`
3. 把每条 `url()` 改写为 `cdn.arsvine.com/shared/fonts/<family>/<file>`
4. 写到 `public/_fonts-staging/`

`public/_fonts-staging/` 是临时目录，gitignored，不入版本控制。

## 上传与元数据

```bash
# 用 coscli 上传到 cos://shared/fonts/
# 不要走 coscli config init，凭证通过环境变量注入：
COS_SECRET_ID=... COS_SECRET_KEY=... coscli cp -r public/_fonts-staging/ cos://shared/fonts/
```

COS 自定义 header 严格：

| 对象 | Content-Type | Cache-Control |
|---|---|---|
| `google-fonts.css` | `text/css; charset=utf-8` | `public, max-age=86400, must-revalidate` |
| `*.woff2` | `font/woff2` | `public, max-age=31536000, immutable` |

**Value 字段只能写值**，不能把 `Cache-Control: public, ...` 整段粘进去。错填会导致 `Cache-Control: Cache-Control: ...`，Firefox 拒收字体，传统中文偶现「豆腐字」（GOTCHAS.md 第 3 条）。

## 验证

```bash
curl -I -H "Referer: https://arsvine.com/" https://cdn.arsvine.com/shared/fonts/google-fonts.css
```

预期看到 `Content-Type` 与 `Cache-Control` 各出现一次，值正确。

## Variable font 去重

Google Fonts 会对同一份 `.woff2` 返回多个 `@font-face` 块（不同 `font-weight`）。这是 Variable Font 的预期行为——一个文件覆盖连续 `wght` 轴。**不要**重写 `fetch-google-fonts.mjs` 强制「一个 weight 一个文件」（GOTCHAS.md 第 4 条）。
