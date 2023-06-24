import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro';

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  // setup for github pages
  site: 'https://proxy-memoize.js.org',
  // note: this is the path to the repo, not the path to the site
  // base: '',
  integrations: [react(), UnoCSS({
    injectReset: true // or a path to the reset file
  }), compress()]
});
