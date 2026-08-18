import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlifyPlugin from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [netlifyPlugin()],

  vite: {
    optimizeDeps: {
      exclude: [
        "@tanstack/react-start",
        "@tanstack/router-core",
        "seroval",
      ],
    },
  },

  tanstackStart: {
    server: { entry: "server" },
  },

  nitro: {
    preset: "netlify",
  },
});

