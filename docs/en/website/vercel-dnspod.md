---
title: Vercel & DNSPod
description: Vercel project configuration, domain binding, Tencent Cloud DNSPod records, first-time verification.
---

# Vercel & DNSPod

Domains are registered on Tencent Cloud. DNS goes through Tencent Cloud DNSPod. This page records the workflow for connecting both Vercel projects to DNSPod.

## Two independent Vercel projects

The main site (`arsvine-realm`) and the documentation site (`arsvine-docs`) **must** be independent Vercel projects. They bind different subdomains and do not share configuration.

### Main site

| Item | Value |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` (uses custom `server.js`) |
| Node.js | 24.x (aligned with `package.json#engines.node`) |

### Documentation site

| Item | Value |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `doc_build` |
| Node.js | 22.x |

The docs site uses `vercel.json` to declare `buildCommand` / `outputDirectory` / `installCommand` / `framework: null` explicitly so Vercel skips framework auto-detection.

## Vercel domain binding

1. Log in to Vercel; open the target project
2. Settings → Domains → Add `arsvine.com` / `docs.arsvine.com`
3. Vercel assigns a CNAME target (one per project, looking like `cname.vercel-dns.com` as a subdomain)
4. Vercel auto-provisions a Let's Encrypt certificate

## Tencent Cloud DNSPod records

Log in to the [DNSPod console](https://console.dnspod.cn/), pick `arsvine.com` under "Domain records", and add two CNAMEs:

| Host record | Record type | Value | TTL |
|---|---|---|---|
| `@` | CNAME | main-site CNAME target from Vercel | 600 |
| `docs` | CNAME | docs-site CNAME target from Vercel | 600 |

An empty host record (`@`) means the apex domain. Use `docs`, `blog`, etc. for subdomains.

Wait tens of seconds to a few minutes for DNSPod to propagate. Refresh the Vercel domain page until it shows **Valid Configuration**.

## Verification

```bash
# Verify resolution from a local terminal
nslookup docs.arsvine.com
dig docs.arsvine.com CNAME +short
```

Both records should resolve to the Vercel-provided CNAME target.

## HTTPS

- Vercel auto-issues and renews Let's Encrypt certificates
- DNSPod does not participate in certificate issuance; it only handles resolution
- **Do not** share a single Vercel project between the main site and the docs site

## Rollback

- Vercel → Deployments → select an older deployment → Promote to Production
- COS resource rollback: `node --env-file=.env.local scripts/assets-publish.mjs --rollback <version>` writes the `current.json` pointer back (see `asset-pipeline`)
