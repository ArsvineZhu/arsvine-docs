---
title: COS 图片工作流
description: COS 公开/私有桶结构、内容哈希对象键、版本指针与增量发布。
---

# COS 图片工作流

媒体资源（图片、字体、音频）放在 Tencent Cloud Object Storage（COS）。这一节解释桶结构、对象命名、版本控制和发布流水。

## 桶结构

- 公开桶：站点图片、字体、UI 静态资源
- 私有桶：受签名 cookie 保护的内容（音乐、博文附件等）

公开桶的根直接对应站点的资源域；私有桶则在签发访问 cookie 后才能访问。

## 对象键（命名）

对象键形如：

```text
realm/site-catalog/versions/<YYYYMMDDTHHMMSSZ>/<group>/<name>.<hash8>.<ext>
realm/catalog/versions/<YYYYMMDDTHHMMSSZ>/<group>/<name>.<hash8>.<ext>
```

- `<YYYYMMDDTHHMMSSZ>` 是发布版本号（UTC）
- `<hash8>` 是源文件 SHA256 的前 8 位，**写入对象键而非仅写入 manifest**
- 同源内容永远命中同一个对象键，从而 `cos sync` 可以安全地按 etag 跳过

## 版本指针

- `realm/site-catalog/current.json`：公开桶的当前版本指针
- `realm/catalog/current.json`：私有桶的当前版本指针
- `current.json` 走 `Cache-Control: no-cache, max-age=0, must-revalidate`
- `current.json` 与 `current.next.json` 都被 `cos sync` 显式 exclude，避免被批量同步误覆盖

## 构建与发布

```bash
# 1. 重新生成 manifest 与 COS 打包
npm run assets:build
# 产物：dist/cos-upload/{public,private}-root + dist/local-manifest/manifest.generated.json

# 2. 上传（增量）
node --env-file=.env.local scripts/assets-publish.mjs

# 3. 回滚
node --env-file=.env.local scripts/assets-publish.mjs --rollback 20260710T170000Z
```

`cos sync` 是默认模式，按 etag 跳过未变化的对象；如需全量覆盖，可加 `--force-full`。

## 公开/私有边界

- 公开桶的资源路径可以写在 `data/site.ts`、博客 MDX 等地方
- 私有桶资源只能通过运行时 API + 签名 cookie 获取，不进静态产物

## 缓存头

| 类别 | Cache-Control |
|---|---|
| 字体 | `public, max-age=31536000, immutable` |
| 静态图片（哈希名） | `public, max-age=31536000, immutable` |
| 媒体目录 JSON | `public, max-age=300` |
| `current.json` | `no-cache, max-age=0, must-revalidate` |
| 私有桶对象 | `no-store` |

## 密钥管理

- `coscli` 只通过 `node --env-file=.env.local` 注入临时环境变量运行
- 任何 CLI 配置文件都不写 secret
- 长期密钥只放在 `.env.local`，提交前确认 `.gitignore` 已屏蔽
