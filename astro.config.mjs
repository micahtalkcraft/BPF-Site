// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? 'https://micahtalkcraft.github.io'
    : 'https://www.bestpropfirms.com',
  base: process.env.CI ? '/BPF-Site' : '/',
  output: 'static',
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});