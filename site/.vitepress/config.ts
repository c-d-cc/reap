import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'REAP',
  description: 'AI와 사람이 소프트웨어를 함께 진화시키기 위한 규약과 도구',
  ignoreDeadLinks: false,
  srcExclude: ['release-notes-content.md'],

  locales: {
    root: {
      label: '한국어',
      lang: 'ko',
    },
  },

  themeConfig: {
    nav: [
      {
        text: '시작하기',
        items: [
          { text: '소개', link: '/introduction' },
          { text: '설치', link: '/install' },
          { text: '첫 사용', link: '/quick-start' },
          { text: '개념', link: '/concepts' },
        ],
      },
      {
        text: '레퍼런스',
        items: [
          { text: 'skill 10종', link: '/skills' },
          { text: 'CLI', link: '/cli' },
          { text: 'hooks', link: '/hooks' },
          { text: '코드 인덱스', link: '/code-index' },
          { text: 'orchestrate', link: '/orchestrate' },
          { text: 'v0.17에서 이주', link: '/migration' },
        ],
      },
      { text: '릴리스 노트', link: '/release-notes' },
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
      {
        text: '레퍼런스',
        items: [
          { text: 'skill 10종', link: '/skills' },
          { text: 'CLI', link: '/cli' },
          { text: 'hooks', link: '/hooks' },
          { text: '코드 인덱스', link: '/code-index' },
          { text: 'orchestrate', link: '/orchestrate' },
          { text: 'v0.17에서 이주', link: '/migration' },
        ],
      },
      {
        text: '릴리스 노트',
        items: [
          { text: '릴리스 노트', link: '/release-notes' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/c-d-cc/reap' },
    ],
  },
})
