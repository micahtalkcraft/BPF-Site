// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { remarkBaseUrl } from './src/plugins/remark-base-url.ts';

const siteBase = process.env.CI ? '/BPF-Site' : '/';

/** @type {Record<string, string>} */
const regionSubdomains = {
  us: 'https://us.bestpropfirms.com',
  uk: 'https://uk.bestpropfirms.com',
  ca: 'https://ca.bestpropfirms.com',
  in: 'https://in.bestpropfirms.com',
};

const regionSite = regionSubdomains[process.env.REGION ?? 'us'] ?? regionSubdomains.us;

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? 'https://micahtalkcraft.github.io'
    : regionSite,
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