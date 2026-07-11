import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';

export default defineConfig({
  root: 'docs',

  title: 'ARSVINE DOCS',
  description: 'Technical notes, system manuals, and engineering records for Arsvine Realm.',
  lang: 'zh-CN',

  llms: true,

  locales: [
    { lang: 'zh-CN', label: '简体中文' },
    { lang: 'en', label: 'English' },
  ],

  i18nSource: (source) => {
    for (const key of Object.keys(source)) {
      if (source[key].zh && !source[key]['zh-CN']) source[key]['zh-CN'] = source[key].zh;
    }
    if (source.editLinkText) source.editLinkText['zh-CN'] = '在 GitHub 上编辑此页';
    if (source.editLinkText) source.editLinkText.en = 'Edit this page on GitHub';
    return source;
  },

  plugins: [
    pluginSitemap({
      siteUrl: 'https://docs.arsvine.com',
      defaultChangeFreq: 'weekly',
      defaultPriority: '0.6',
    }),
  ],

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/ArsvineZhu',
      },
    ],

    nav: [
      { text: 'Realm', link: '/realm/' },
      { text: 'Website', link: '/website/' },
      { text: 'AI', link: '/ai/' },
      { text: 'Design', link: '/design/' },
      { text: '返回主站', link: 'https://arsvine.com' },
    ],

    sidebar: {
      '/realm/': [
        {
          text: 'Arsvine Realm',
          items: [
            { text: '概览', link: '/realm/' },
            { text: '路由与 proxy 中间件', link: '/realm/routes-and-proxy' },
            { text: '页面树与动态路由', link: '/realm/pages-tree' },
            { text: '内容来源', link: '/realm/content-sources' },
            { text: '受保护博文', link: '/realm/protected-posts' },
            { text: 'API 端点', link: '/realm/api-endpoints' },
            { text: '性能分层', link: '/realm/performance-tiers' },
            { text: '开发维护', link: '/realm/development' },
            { text: '易踩坑', link: '/realm/gotchas' },
          ],
        },
      ],
      '/website/': [
        {
          text: 'Website Infrastructure',
          items: [
            { text: '概览', link: '/website/' },
            { text: '服务器与构建栈', link: '/website/server-and-stack' },
            { text: '环境变量', link: '/website/env-vars' },
            { text: 'Vercel 与 DNSPod', link: '/website/vercel-dnspod' },
            { text: 'COS 与 CDN', link: '/website/cos-and-cdn' },
            { text: '字体托管', link: '/website/font-hosting' },
            { text: '资源发布流水线', link: '/website/asset-pipeline' },
            { text: 'RSS / Sitemap / Robots', link: '/website/rss-sitemap-robots' },
            { text: '遥测', link: '/website/telemetry' },
            { text: 'SEO 与安全', link: '/website/seo-and-security' },
            { text: '外部内容仓库', link: '/website/content-pipeline' },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'AI Systems',
          items: [
            { text: '概览', link: '/ai/' },
            { text: '自适应性能', link: '/ai/adaptive-performance' },
            { text: '地理与可见性', link: '/ai/geo-and-region' },
            { text: 'Hitokoto 与 Tweets', link: '/ai/hitokoto-and-tweets' },
            { text: 'Agent 协作', link: '/ai/agent-workflow' },
          ],
        },
      ],
      '/design/': [
        {
          text: 'Design System',
          items: [
            { text: '概览', link: '/design/' },
            { text: '字阶与字体变量', link: '/design/typography-and-fonts' },
            { text: '视觉语言', link: '/design/visual-language' },
            { text: '加载与过渡', link: '/design/loading-and-transitions' },
            { text: 'Three.js 效果', link: '/design/three-effects' },
            { text: 'MayRain Portfolio', link: '/design/mayrain-portfolio' },
          ],
        },
      ],

      '/en/realm/': [
        {
          text: 'Arsvine Realm',
          items: [
            { text: 'Overview', link: '/en/realm/' },
            { text: 'Routes & proxy', link: '/en/realm/routes-and-proxy' },
            { text: 'Pages tree', link: '/en/realm/pages-tree' },
            { text: 'Content sources', link: '/en/realm/content-sources' },
            { text: 'Protected posts', link: '/en/realm/protected-posts' },
            { text: 'API endpoints', link: '/en/realm/api-endpoints' },
            { text: 'Performance tiers', link: '/en/realm/performance-tiers' },
            { text: 'Development', link: '/en/realm/development' },
            { text: 'Gotchas', link: '/en/realm/gotchas' },
          ],
        },
      ],
      '/en/website/': [
        {
          text: 'Website Infrastructure',
          items: [
            { text: 'Overview', link: '/en/website/' },
            { text: 'Server & build stack', link: '/en/website/server-and-stack' },
            { text: 'Environment variables', link: '/en/website/env-vars' },
            { text: 'Vercel & DNSPod', link: '/en/website/vercel-dnspod' },
            { text: 'COS & CDN', link: '/en/website/cos-and-cdn' },
            { text: 'Font hosting', link: '/en/website/font-hosting' },
            { text: 'Asset publishing pipeline', link: '/en/website/asset-pipeline' },
            { text: 'RSS / Sitemap / Robots', link: '/en/website/rss-sitemap-robots' },
            { text: 'Telemetry', link: '/en/website/telemetry' },
            { text: 'SEO & security', link: '/en/website/seo-and-security' },
            { text: 'External content repo', link: '/en/website/content-pipeline' },
          ],
        },
      ],
      '/en/ai/': [
        {
          text: 'AI Systems',
          items: [
            { text: 'Overview', link: '/en/ai/' },
            { text: 'Adaptive performance', link: '/en/ai/adaptive-performance' },
            { text: 'Geo & region', link: '/en/ai/geo-and-region' },
            { text: 'Hitokoto & Tweets', link: '/en/ai/hitokoto-and-tweets' },
            { text: 'Agent workflow', link: '/en/ai/agent-workflow' },
          ],
        },
      ],
      '/en/design/': [
        {
          text: 'Design System',
          items: [
            { text: 'Overview', link: '/en/design/' },
            { text: 'Typography & font variables', link: '/en/design/typography-and-fonts' },
            { text: 'Visual language', link: '/en/design/visual-language' },
            { text: 'Loading & transitions', link: '/en/design/loading-and-transitions' },
            { text: 'Three.js effects', link: '/en/design/three-effects' },
            { text: 'MayRain Portfolio', link: '/en/design/mayrain-portfolio' },
          ],
        },
      ],
    },

    editLink: {
      docRepoBaseUrl: 'https://github.com/ArsvineZhu/arsvine-docs/tree/main/docs',
    },

    lastUpdated: true,
  },
});
