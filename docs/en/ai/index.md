---
title: Overview
description: AI-related systems: adaptive performance, geo signals, content acquisition.
---

# AI Systems overview

In the Realm context, "AI" means **intelligent / adaptive systems**, not chatbot. Realm has no conversational persona. Its "intelligence" is implicit:

- Client-side adaptive performance tiers (capability flags driven by device and runtime FPS)
- Vercel edge geo signals driving UI micro-tuning
- Third-party content acquisition (Hitokoto one-liners, tweet archive)

This section is broken down by subsystem. There is **no** mysterious internal AI model.

## Reading order

1. `adaptive-performance` — `useAdaptivePerformance` four tiers, sampling, tier transitions
2. `geo-and-region` — `GEO_COUNTRY` cookie and region-only UI micro-tuning
3. `hitokoto-and-tweets` — Hitokoto one-liner proxy and tweet month archive
4. `agent-workflow` — maintainer-side collaboration conventions with AI coding agents (CLAUDE.md / AGENTS.md / docs/ split)
