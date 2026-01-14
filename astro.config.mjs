// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import node from '@astrojs/node'; // Node.js adapter

export default defineConfig({
  output: 'server',       // required for SSR
  adapter: node({ mode: 'standalone' }), // <-- fix: specify mode

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [icon()],
  devToolbar: { enabled: false },
});
