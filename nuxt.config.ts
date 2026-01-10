// https://nuxt.com/docshttps://api.bajiraj.cloud/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  app:{
    head: {
      script: [

        {
          src: `https://maps.googleapis.com/mapshttps://api.bajiraj.cloud/js?key=${process.env.GOOGLE_MAP_API_KEY}&callback=initGoogleMaps`,
          async: true,
          defer: true,
        },
      ],
    },
  },
  css: ["~/assets/style/main.scss"],
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  plugins: ["~/plugins/pinia.js"],
  build: {
    transpile: ["vuetify", "@vuepic/vue-datepicker"],
  },
  modules: [

    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },

    //...
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_BASE_URL || "http://127.0.0.1:8000",
    },
  },

  compatibilityDate: "2024-10-16",
});