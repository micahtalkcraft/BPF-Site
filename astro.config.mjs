// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rehypeBaseUrl } from './src/plugins/rehype-base-url.ts';

const siteBase = process.env.CI ? '/BPF-Site' : '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? 'https://micahtalkcraft.github.io'
    : 'https://www.bestpropfirms.com',
  base: siteBase,
  output: 'static',
  integrations: [react(), sitemap()],

  markdown: {
    rehypePlugins: [[rehypeBaseUrl, { base: siteBase }]],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});