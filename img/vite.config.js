import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      persistState: { path: "../.wrangler" },
    }),
  ],
  server: {
    allowedHosts: true,
    cors: true,
  },
});
