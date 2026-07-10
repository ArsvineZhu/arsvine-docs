---
title: 字阶与字体变量
description: 四个 CSS 变量、字族、Unicode 范围、Latin-only 限制。
---

# 字阶与字体变量

`styles/globals.scss` 维护四个 CSS 变量，对应四类用途。**绝对不要**给错变量挂字符串。

## 四个变量

| 变量 | 字族 | 适用 |
|---|---|---|
| `--font-display` | ZELDA Free（Latin-only） | HUD 装饰字（短标语、版本号） |
| `--font-hud` | Dosis + Noto Sans SC | HUD 标签、数字、blog 标题、安全 Latin |
| `--font-reading` | Noto Serif SC | MDX 正文、长文阅读 |
| `--font-typewriter` | 系统等宽 + Noto Sans SC Mono | 打字机效果、代码块、终端式 UI |

## `--font-display` 的硬限制（GOTCHAS 第 2 条）

ZELDA Free 是装饰字，**只有拉丁基础字符**。给以下场景用会出问题：

- 任何 CJK 字符 → 字形缺失
- 带音 Latin（é ñ ü 等）→ 偶发缺失
- 翻译字符串（locale 切换可能引入任意 Unicode）
- 博客标题
- 用户提交内容

安全用法：`> LOADING`、`> READY`、`v1.2.0` 这类纯 ASCII / Latin 短串。

## 字族与权重

| 字族 | 权重 | 用途 |
|---|---|---|
| Dosis | 300 / 400 / 500 | HUD Latin |
| Noto Sans SC | 300 / 400 / 500 / 700 | CJK 正文 + 部分粗体 |
| Noto Serif SC | 400 / 700 | MDX 阅读体 |
| Noto Sans SC Mono | 400 | 等宽效果 |

Noto Serif SC 500 实际未用，源 `data/site.ts.fonts.googleStylesheet` 已裁。

## 字号 / 行高 / 字距

`styles/globals.scss` 暴露的 type scale（精简）：

```scss
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

HUD 大数字走 `clamp(2.4rem, 4vw, 3.2rem)` 之类弹性规则，桌面大屏与移动端都有合理显示。

## 修改字体的清单

1. 改 `data/site.ts.fonts.googleStylesheet` 与 `cdnStylesheet`
2. `node scripts/fetch-google-fonts.mjs` 抓新版 woff2
3. 通过 coscli 上传到 `cos://shared/fonts/`，并按 `website/font-hosting` 写 `Content-Type` / `Cache-Control`
4. `curl -I` 验证头
5. 浏览器开 `http://dev.arsvine.com`（用 `scripts/dev-host-setup.cmd`）目检 CJK / 带音字符不豆腐
