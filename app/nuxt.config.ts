import process from 'node:process'
import type { Nitro } from 'nitropack'

export default defineNuxtConfig({

  runtimeConfig: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    public: {
      NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD,
    },
  },

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
    'nuxt-auth-utils',
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
