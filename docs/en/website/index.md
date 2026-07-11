---
title: Overview
description: "Arsvine site runtime: DNS, deployment, object storage, SEO, security."
---

# Website Infrastructure overview

This is the "runtime" manual: domains, DNS, deployment platform, object storage, fonts, SEO, telemetry, security boundaries. All content is public fact; no secret values.

## Top-level locations

| Asset | Location |
|---|---|
| Main site | `https://arsvine.com` |
| Documentation site | `https://docs.arsvine.com` |
| Static media domain | `https://cdn.arsvine.com` (self-hosted CDN backed by Tencent Cloud COS Hong Kong bucket `arsvine-cdn`) |
| Domain registration | Tencent Cloud (DNSPod console) |
| DNS | Tencent Cloud DNSPod |
| Deployment | Vercel independent projects (main site and docs site are independent) |
| Media storage | Tencent Cloud COS (public bucket + private bucket) |
| External content | Private GitHub repo (`arsvine-content`) |

## Reading order

1. `server-and-stack` — `server.js` entry, build stack, Next.js configuration
2. `env-vars` — every `.env.example` field, purpose, and security tier
3. `vercel-dnspod` — Vercel project settings, domain binding, DNSPod records
4. `cos-and-cdn` — COS bucket layout, object key naming, version pointers
5. `font-hosting` — self-hosted Google Fonts fetching and upload
6. `asset-pipeline` — `assets:prepare` → `build` → `publish` pipeline
7. `rss-sitemap-robots` — dynamically generated SEO files
8. `telemetry` — telemetry (off by default, opt-in via env)
9. `seo-and-security` — site metadata, revalidate secret, TOTP, access cookie, remote image hosts
10. `content-pipeline` — external GitHub content repo structure

## Content red lines

The following are **forbidden** in public docs:

- Any secret value from `.env.local`
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP secrets (base32 literals)
- Private bucket paths, full API endpoint URLs
- Real high-value resource maps
- Unpublished friend information
- Vercel / DNSPod screenshots with sensitive fields

Write about "flows" and "field names" — never about "real keys" and "private paths".
