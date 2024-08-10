// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  alias: {
    '.prisma/client/index-browser':
      './node_modules/.prisma/client/index-browser.js',
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
  ],

  css: [
    '@unocss/reset/tailwind.css',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
})
