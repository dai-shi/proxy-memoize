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
}

export default defineConfig({
  rules: [[/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })]],
  shortcuts: [
    // ...
  ],
  theme: {
    colors
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography({
      cssExtend: {
        'h1,h2,h3,h4,h5,h6': {
          color: colors.indigo
        },
        'p,ul,code': {
          color: '#536E8F'
        },
        'a': {
          color: colors.indigo
        }
      }
    }),
    presetWebFonts({
      provider: 'google', // default provider

      fonts: {
        Dm: {
          name: 'DM Sans',
          weights: ['400', '500', '700'],
        },
        Roboto: {
          name: 'Roboto',
          weights: ['700', '500'],
        },
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
