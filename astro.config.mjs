// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { remarkBaseUrl } from './src/plugins/remark-base-url.ts';

const isGitHubPages = !!process.env.GITHUB_ACTIONS;
const siteBase = isGitHubPages ? '/BPF-Site' : '/';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages
    ? 'https://micahtalkcraft.github.io'
    : 'https://reviews.bestpropfirms.com',
  base: siteBase,
  output: 'static',
  integrations: [react(), sitemap()],

  markdown: {
    remarkPlugins: [[remarkBaseUrl, { base: siteBase }]],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});