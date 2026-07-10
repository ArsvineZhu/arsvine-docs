---
title: Website Infrastructure 概览
description: Vercel、腾讯云 DNSPod、COS 图片工作流、SEO 与安全相关的所有运行基础设施。
---

# Website Infrastructure 概览

这一节记录 Arsvine 系列网站对外可见的运行底座：DNS、部署平台、对象存储、SEO、安全、内容流水线。

## 在哪里

- 域名：主站 `arsvine.com`、文档站 `docs.arsvine.com`（在腾讯云注册）
- 部署：Vercel 独立项目
- 存储：Tencent COS（公开桶 + 私有桶）
- DNS：腾讯云 DNSPod

## 阅读顺序

1. `vercel-dnspod.md`：Vercel 项目配置与 DNSPod 解析记录
2. `cos-image-workflow.md`：COS 桶结构、目录快照、发布流水线
3. `seo-and-security.md`：SEO 元信息、revalidate secret、TOTP、access cookie
4. `content-pipeline.md`：博客兜底/运行时双层结构（待补）
