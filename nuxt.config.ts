// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  // Google Fonts
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700, 800],
      'JetBrains Mono': [400, 500, 600],
    },
    display: 'swap',
  },

  // Runtime config — populated from .env
  runtimeConfig: {
    // Server-only (private)
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
    jwtSecret: process.env.JWT_SECRET || 'default-dev-secret',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',

    // Client-side (public)
    public: {
      appName: 'Obsidia Service',
    },
  },

  // App metadata
  app: {
    head: {
      title: 'Obsidia Service — Premium Key System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Premium key management dashboard for Obsidia Service' },
        { name: 'theme-color', content: '#7c3aed' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  // Tailwind CSS config
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  // Enable SSR for Vercel
  ssr: true,

  devtools: { enabled: false },
})
