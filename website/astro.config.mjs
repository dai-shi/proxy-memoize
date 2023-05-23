import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  // setup for github pages
  site: 'https://pheno-agency.github.io',
  // note: this is the path to the repo, not the path to the site
  base: '/proxy-memoize',
  integrations: [
    react(),
    UnoCSS({
      injectReset: true, // or a path to the reset file
    }),
  ],
});
