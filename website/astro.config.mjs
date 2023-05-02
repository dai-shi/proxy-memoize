import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  // setup for github pages
  site: 'https://pheno-agency.github.io',
  base: '/proxy-memoize',
  integrations: [
    UnoCSS({
      injectReset: true, // or a path to the reset file
    }),
  ],
});