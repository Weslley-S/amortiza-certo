import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://amortizacerto.com.br',
  output: 'static',
  compressHTML: true,
  integrations: [
    preact(),
    tailwind(),
    sitemap(),
  ],
});
