/* eslint-disable */
// @ts-nocheck
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
// import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

const colors = {
  green: '#0DA84B',
  indigo: '#183F6E',
  lightBlue: '#DCEDFF',
  cyan: '#ECF5FF',
  gray: '#8094AC',
  // dark mode colors
  black: '#2D2D2D',
  fullBlack: '#1C1C1C',
  lightGray: '#A6A6A6',
};

export default defineConfig({
  rules: [[/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })]],
  shortcuts: [
    // ...
  ],
  theme: {
    colors,
  },
  presets: [
    presetUno(), // required
    presetAttributify(), // required when using attributify mode
    presetTypography({
      // selectorName: 'markdown', // now use like `markdown markdown-gray`, `not-markdown`
      // cssExtend is an object with CSS selector as key and
      // CSS declaration block as value like writing normal CSS.
      cssExtend: {
        'h1,h2,h3,h4,h5,h6': {
          color: colors.indigo,
          'font-family': 'Roboto',
        },
        pre: {
          background: '#183F6E',
        },
        'pre code': {
          'font-family': 'DM Sans',
        },
        p: {
          color: '#536E8F',
        },
        'code span': {
          color: '#fff',
        },
        a: {
          color: colors.indigo,
        },
        'a:hover': {
          color: '#f43f5e',
        },
        'a:visited': {
          color: '#14b8a6',
        },
      },
    }),
    presetIcons(),
    presetWebFonts({
      provider: 'google', // default provider
      fonts: {
        // these will extend the default theme
        Roboto: [
          {
            name: 'Roboto',
            weights: ['700', '500'],
          },
          {
            name: 'sans-serif',
            provider: 'none',
          },
        ],
        Dm: {
          name: 'DM Sans',
          weights: ['400', '500', '700'],
        },
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
