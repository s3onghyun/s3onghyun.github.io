import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://s3onghyun.github.io',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});
