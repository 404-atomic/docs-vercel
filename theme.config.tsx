import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>FIRE 文档中心</span>,
  toc: {
    title: '目录'
  },
  project: {
    link: 'https://github.com/404-atomic/docs-vercel',
  },
  docsRepositoryBase: 'https://github.com/404-atomic/docs-vercel',
  footer: {
    text: '文档中心',
  },
  primaryHue: {
    dark: 204,
    light: 204,
  },
  search: {
    placeholder: '搜索文档...'
  },
  feedback: {
    content: null
  },
  editLink: {
    component: null
  },
  gitTimestamp: ({ timestamp }) => {
    return <>最后更新于: {timestamp.toLocaleDateString('zh-CN')}</>
  }
}

export default config
