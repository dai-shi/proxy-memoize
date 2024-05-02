/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    return {
      resolve: { alias: { 'proxy-memoize': resolve('src') } },
    };
  }
  return {};
});
