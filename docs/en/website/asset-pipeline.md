---
title: Asset publishing pipeline
description: assets:prepare / build / publish responsibilities, outputs, incremental uploads, and revalidate flow.
---

# Asset publishing pipeline

Asset publishing is composed of three pnpm scripts: `assets:prepare` → `assets:build` → `assets:publish`. Each has a single responsibility and can be run independently.

## 0. Prerequisite: the cos-workspace mirror

`cos-workspace/` is a purely local working directory and **must** be gitignored. `pnpm assets:prepare` expects a `cos-workspace/public-root-legacy/` subdirectory containing a mirror of the current live public bucket (pull it with `coscli sync` once, or place it manually).

## 1. `pnpm assets:prepare`

`scripts/prepare-cos-workspace.mjs`:

1. Rewrite `cos-workspace/public-root-legacy/` into `cos-workspace/public-root/`, normalizing all paths to the canonical `realm/...` / `shared/...` form
2. Normalize object base names to short English kebab-case (the build step appends `hash8` later)
3. Regenerate `cos-workspace/_meta/realm/{home,works,collections,links,audio}.json` and the logical asset-source metadata

Output is still **local files**, no upload.

## 2. `pnpm assets:build`

`scripts/assets-build.mjs`:

- Walk every file under `cos-workspace/public-root/`
- `realm/images/**` goes through `processImageFile`: read metadata with `sharp`, hash the content, and resize if needed; output is `<name>.<hash8>.<ext>`
- `realm/audio/**` goes through `processAudioFile`: hash + copy
- Other files go through `copySharedAsset`: direct copy
- Load `_meta/realm/{home,works,collections,links,audio}.json` and the optional `legacy-asset-sources.json`; replace each `source` field with the hashed `objectKey`
- Write the private catalog `dist/cos-upload/private-root/realm/catalog/versions/<version>/<section>.json`
- Write the private `current.json` (default `current.next.json`; with `--publish-current` write `current.json` directly)
- Write the public site catalog `dist/cos-upload/public-root/realm/site-catalog/versions/<version>/assets.json` (only `SITE_ASSET_KEYS`)
- Write the public `current.json` / `current.next.json`
- Write `dist/local-manifest/manifest.generated.json` for the publish script to read

`--publish-current` skips the staging step and points `current.json` straight at the new version (used for one-off major-version cuts).

## 3. `pnpm assets:publish`

`scripts/assets-publish.mjs`:

```text
1. cos sync public  dist/cos-upload/public-root/  → cos://<public-bucket>/
   - Incremental by default
   - Exclude current.json and current.next.json
2. cos sync private dist/cos-upload/private-root/ → cos://<private-bucket>/
   - Same as above
3. cos ls public  realm/site-catalog/versions/<version>/assets.json
4. cos ls private realm/catalog/versions/<version>/static-assets.json
5. writePointer(version): cos cp both current.json with Cache-Control
6. POST /api/revalidate-assets
```

`revalidate()` parses the response body:

- `200 + failed: []` → success
- `200 + partial: true` → warning, log the failed paths, continue
- `5xx` → throw, the whole publish fails

`--dry-run` does not execute coscli or send the request, just prints the commands. `--force-full` swaps `cos sync` for `cos cp -r` to do a one-off full re-upload (for emergencies). `--rollback <version>` skips build and just `cos cp` writes `current.json` pointing at the old version.

## 4. Credentials and local dev

- `COS_SECRET_ID` / `COS_SECRET_KEY` are injected temporarily through `node --env-file=.env.local`
- Never write to a coscli config file; never print secrets
- `COSCLI_PATH` defaults to `./cos-workspace/coscli-windows-amd64.exe`; can be overridden
- `COS_SESSION_TOKEN` is optional (STS scenarios)

## 5. Verification checklist

After publishing:

```bash
# 1. Public catalog head is reachable
curl -I https://cdn.arsvine.com/realm/site-catalog/current.json

# 2. Affected pages have been rebuilt
curl -I https://arsvine.com/zh-CN
curl -I https://arsvine.com/zh-CN/content
curl -I https://arsvine.com/zh-CN/web/3

# 3. Version directories exist in the buckets
coscli ls cos://<public-bucket>/realm/site-catalog/versions/
coscli ls cos://<private-bucket>/realm/catalog/versions/
```

## 6. Critical invariants

- **The resource version (`<version>`) is UTC ISO without separators** in the form `20260710T120000Z`
- **Object keys are content-addressed** (hash embedded in the key), so `cos sync` skipping unchanged objects by etag is safe
- **Writing `current.json` is the last step**, and only via `cos cp`, never `cos sync`
- **`cos-workspace/` is always gitignored locally**
