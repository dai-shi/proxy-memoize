import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  // setup for github pages
  site: 'https://pheno-agency.github.io',
  // note: this is the path to the repo, not the path to the site
  base: '/',
  integrations: [
    UnoCSS({
      injectReset: true, // or a path to the reset file
    }),
  ],
});
