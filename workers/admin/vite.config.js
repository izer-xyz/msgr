import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import materialSymbols from "vite-plugin-material-symbols";

export default defineConfig({
  plugins: [
    cloudflare({ persistState: { path: "../../.wrangler" } }),
    tailwindcss(),
    materialSymbols(),
  ],
  server: {
    allowedHosts: true,
  },
});
