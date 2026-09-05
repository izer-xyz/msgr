import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import materialSymbols from "vite-plugin-material-symbols";

export default defineConfig({
  plugins: [
    cloudflare({
      persistState: { path: "../../.wrangler" },
      //auxiliaryWorkers: [{ configPath: "../trmnl-img/wrangler.toml" }], // build.rolldownOptions.external!
    }),
    tailwindcss(),
    materialSymbols(),
  ],
  server: {
    allowedHosts: true,
  },
});
