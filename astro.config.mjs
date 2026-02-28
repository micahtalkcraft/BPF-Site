// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { remarkBaseUrl } from './src/plugins/remark-base-url.ts';

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
    remarkPlugins: [[remarkBaseUrl, { base: siteBase }]],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});