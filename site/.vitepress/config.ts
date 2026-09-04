import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'REAP',
  description: 'AI와 사람이 소프트웨어를 함께 진화시키기 위한 규약과 도구',
  ignoreDeadLinks: false,

  locales: {
    root: {
      label: '한국어',
      lang: 'ko',
    },
  },

  themeConfig: {
    nav: [
      { text: '소개', link: '/introduction' },
      { text: '설치', link: '/install' },
      { text: '첫 사용', link: '/quick-start' },
      { text: '개념', link: '/concepts' },
    ],

    sidebar: [
      {
        text: '시작하기',
        items: [
          { text: '소개', link: '/introduction' },
          { text: '설치', link: '/install' },
          { text: '첫 사용', link: '/quick-start' },
          { text: '개념', link: '/concepts' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/c-d-cc/reap' },
    ],
  },
})
