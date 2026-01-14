import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import nodeAdapter from "@astrojs/node";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon()],
  adapter: nodeAdapter(),
});
