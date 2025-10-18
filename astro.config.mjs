// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://collisiontowingaz.com",

  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      NOTIFICATION_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
      
    },
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Inter",
        cssVariable: "--font-inter",
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],

  output: "server",

  adapter: cloudflare(),
});
