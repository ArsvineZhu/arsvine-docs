---
title: 资源发布流水线
description: assets:prepare / build / publish 三个命令的职责、产物、增量、revalidate 流程。
---

# 资源发布流水线

资源发布由三个 pnpm 脚本组成：`assets:prepare` → `assets:build` → `assets:publish`。每个命令职责单一，可独立运行。

## 0. 前置：cos-workspace 镜像

`cos-workspace/` 是本地工作目录，**必须** gitignored。`pnpm assets:prepare` 期望一个 `cos-workspace/public-root-legacy/` 子目录，内容是当前线上公开桶的镜像（手动 `coscli sync` 拉一次或直接放进去）。

## 1. `pnpm assets:prepare`

`scripts/prepare-cos-workspace.mjs`：

1. 把 `cos-workspace/public-root-legacy/` 重写成 `cos-workspace/public-root/`，路径全部对齐到 `realm/...` / `shared/...` canonical 形式
2. 把对象 base name 规整成短英文 kebab-case（构建期会再追加 hash8）
3. 重新生成 `cos-workspace/_meta/realm/{home,works,collections,links,audio}.json` 与 logical asset-source metadata

输出仍是**本地文件**，不上传。

## 2. `pnpm assets:build`

`scripts/assets-build.mjs`：

- 遍历 `cos-workspace/public-root/` 下所有文件
- `realm/images/**` 走 `processImageFile`：`sharp` 读 metadata + content hash + 必要的 resize，输出 `<name>.<hash8>.<ext>`
- `realm/audio/**` 走 `processAudioFile`：hash + 复制
- 其他走 `copySharedAsset`：直接复制
- 加载 `_meta/realm/{home,works,collections,links,audio}.json` 与可选的 `legacy-asset-sources.json`，把 `source` 字段替换成 hashed `objectKey`
- 写私有 catalog `dist/cos-upload/private-root/realm/catalog/versions/<version>/<section>.json`
- 写私有 `current.json`（默认 `current.next.json`；`--publish-current` 时直接写 `current.json`）
- 写公开 site catalog `dist/cos-upload/public-root/realm/site-catalog/versions/<version>/assets.json`（只含 SITE_ASSET_KEYS）
- 写公开 `current.json` / `current.next.json`
- 写 `dist/local-manifest/manifest.generated.json` 给 publish 脚本读

`--publish-current` 跳过 staging 阶段，让 `current.json` 直接指向新版本（用于一次性大版本切换）。

## 3. `pnpm assets:publish`

`scripts/assets-publish.mjs`：

```text
1. cos sync 公开 dist/cos-upload/public-root/ → cos://<public-bucket>/
   - 默认增量
   - 显式 exclude current.json 与 current.next.json
2. cos sync 私有 dist/cos-upload/private-root/ → cos://<private-bucket>/
   - 同上
3. cos ls 公开 realm/site-catalog/versions/<version>/assets.json
4. cos ls 私有 realm/catalog/versions/<version>/static-assets.json
5. writePointer(version): cos cp 两个 current.json，附 Cache-Control
6. POST /api/revalidate-assets
```

`revalidate()` 解析响应体：

- 200 + `failed: []` → 成功
- 200 + `partial: true` → 警告，日志输出失败路径，继续
- 5xx → throw，让整个 publish 失败

`--dry-run` 不执行 coscli、不发 fetch，只打印命令。`--force-full` 把 cos sync 换成 cos cp -r，做一次性全量重传（排障用）。`--rollback <version>` 跳过 build，直接 `cos cp` 写 `current.json` 指向旧版本。

## 4. 凭据与本地 dev

- `COS_SECRET_ID` / `COS_SECRET_KEY` 通过 `node --env-file=.env.local` 临时注入
- 绝不写 coscli 配置文件，绝不打印 secret
- `COSCLI_PATH` 默认 `./cos-workspace/coscli-windows-amd64.exe`，可覆盖
- `COS_SESSION_TOKEN` 可选（STS 场景）

## 5. 验证清单

发布后：

```bash
# 1. 公开 catalog 头文件可达
curl -I https://cdn.arsvine.com/realm/site-catalog/current.json

# 2. 受影响页面已经重生
curl -I https://arsvine.com/zh-CN
curl -I https://arsvine.com/zh-CN/content
curl -I https://arsvine.com/zh-CN/web/3

# 3. 桶中版本目录存在
coscli ls cos://<public-bucket>/realm/site-catalog/versions/
coscli ls cos://<private-bucket>/realm/catalog/versions/
```

## 6. 关键不变量

- **资源版本号（`<version>`）是 UTC ISO 去掉分隔符**：`20260710T120000Z` 形式
- **对象键是内容寻址**（hash 写入 key），所以 `cos sync` 按 etag 跳过未变化对象是安全的
- **写 `current.json` 是最后一步**，且只 `cos cp` 不 `cos sync`
- **本地 `cos-workspace/` 永远 gitignored**
