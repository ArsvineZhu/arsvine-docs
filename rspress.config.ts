import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';

export default defineConfig({
  root: 'docs',

  title: 'ARSVINE DOCS',
  description: 'Technical notes, system manuals, and engineering records for Arsvine Realm.',
  lang: 'zh-CN',

  llms: true,

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
            { text: '架构说明', link: '/realm/architecture' },
            { text: '开发维护', link: '/realm/development' },
            { text: '部署运行', link: '/realm/deployment' },
            { text: '易踩坑', link: '/realm/gotchas' },
          ],
        },
      ],
      '/website/': [
        {
          text: 'Website Infrastructure',
          items: [
            { text: '概览', link: '/website/' },
            { text: 'Vercel / Cloudflare', link: '/website/vercel-cloudflare' },
            { text: 'COS 图片工作流', link: '/website/cos-image-workflow' },
            { text: 'SEO 与安全', link: '/website/seo-and-security' },
            { text: '内容流水线', link: '/website/content-pipeline' },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'AI Systems',
          items: [
            { text: '概览', link: '/ai/' },
            { text: 'Persona Runtime', link: '/ai/persona-runtime' },
            { text: '视觉语义管线', link: '/ai/visual-semantic-pipeline' },
            { text: 'Agent 工作流', link: '/ai/agent-workflow' },
          ],
        },
      ],
      '/design/': [
        {
          text: 'Design System',
          items: [
            { text: '概览', link: '/design/' },
            { text: 'Realm 视觉语言', link: '/design/realm-visual-language' },
            { text: 'MayRain Portfolio', link: '/design/mayrain-portfolio' },
          ],
        },
      ],
    },

    editLink: {
      docRepoBaseUrl: 'https://github.com/ArsvineZhu/arsvine-docs/tree/main/docs',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: true,
    outlineTitle: '目录',
    prevPageText: '上一页',
    nextPageText: '下一页',
  },
});
