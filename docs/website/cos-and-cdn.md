---
title: COS 与 CDN
description: 公开/私有桶结构、对象键命名、版本指针、Cache-Control 头。
---

# COS 与 CDN

媒体资源（自有图、封面、图集、字体、装饰、音频）统一在腾讯云 COS 香港桶 `arsvine-cdn`，通过自有 CDN 域 `cdn.arsvine.com` 提供。

## 桶与权限

- **公开桶**：媒体资源
- **私有桶**：版本化目录（`realm/catalog/**`）+ 受签名访问的资源
- 公开桶策略：public-read / private-write
- 私有桶策略：所有读必须带签名（access cookie）
- 跨域：公开桶允许 `https://arsvine.com` 与子域、`http://dev.arsvine.com`（本地）跨域 GET/HEAD
- Referer 白名单：`arsvine.com`、`*.arsvine.com`（local 与空 Referer 被拒）

## 对象键

对象键结构与示例：

```text
public bucket:
  shared/fonts/<family>/<file>.woff2
  shared/fonts/google-fonts.css
  realm/images/YYYY/MM/DD/<name>.<hash8>.<ext>
  realm/audio/YYYY/MM/DD/<name>.<hash8>.<ext>
  realm/site-catalog/current.json
  realm/site-catalog/current.next.json
  realm/site-catalog/versions/<version>/assets.json

private bucket:
  realm/catalog/current.json
  realm/catalog/current.next.json
  realm/catalog/versions/<version>/
    home.json
    works.json
    collections.json
    links.json
    audio.json
    static-assets.json
```

`<hash8>` 是源文件 SHA256 的前 8 位，**写入对象键**而不是只写在 manifest。同源内容永远命中同一个对象键，所以 `cos sync` 可以按 etag 安全跳过未变化的资源。

`<version>` 是发布版本号（UTC ISO 去掉分隔符），形如 `20260710T120000Z`。

## 版本指针

`current.json` 是当前活跃版本的指针：

```json
{ "version": "20260710T120000Z" }
```

`current.next.json` 是构建期写、**不**被发布脚本切换的预发布指针。`cos sync` 显式 exclude 这两个文件，由 `scripts/assets-publish.mjs` 在最后一步用 `cos cp` 写入并附 `Cache-Control: no-cache, max-age=0, must-revalidate`。

切换顺序是 **last-writer-wins**：

1. 上传不可变对象（图片 / 音频 / shared/ 字体）
2. 上传私有 catalog 版本目录
3. `ls` 校验两份 `assets.json` / `static-assets.json` 存在
4. 写公开 `current.json`
5. 写私有 `current.json`
6. 调 `/api/revalidate-assets` 触发 ISR

任何前一步失败都不会切指针。

## Cache-Control 头

| 类别 | Cache-Control |
|---|---|
| `*.woff2` | `public, max-age=31536000, immutable` |
| `google-fonts.css` | `public, max-age=86400, must-revalidate` |
| 图片（哈希名） | `public, max-age=31536000, immutable` |
| 媒体 catalog JSON | `public, max-age=300` |
| `current.json`（公开 / 私有） | `no-cache, max-age=0, must-revalidate`（公开）/ `no-store`（私有） |
| 私有桶其他对象 | `no-store` |

## 客户端读取路径

- 自有图（`og:image`、post image、图集）：从 `data/site.ts` 的 `assets.ogImage` 或 catalog 的 `objectKey` 拼出 `https://cdn.arsvine.com/<key>`，走 `next/image` + `unoptimized={true}`。
- 字体：`styles/globals.scss` 的 `--font-hud` 等变量绑定到 `https://cdn.arsvine.com/shared/fonts/google-fonts.css`。
- 媒体 catalog（home / works / collections / links / audio）：客户端在运行时调 `/api/assets/<section>`，handler 读私有桶 `current.json` → 版本目录的 `<section>.json` → 把 hashed object key 替换为完整 `https://cdn.arsvine.com/...` URL 返回。

## 关键不变量

- **不要在代码里写死 COS object key**。所有资源引用都走 catalog。
- **不要把私有桶路径写进 public 文档**。本文档只描述结构，不写实例名。
- **不要把 `current.json` 跟 catalog 版本目录放进同一个 cos sync 任务**。前者用 `cos cp` 显式覆盖，后者用 `cos sync` 增量。
- **本地 dev 用 `dev.arsvine.com` + `scripts/dev-host-setup.cmd`** 解决 Referer。
