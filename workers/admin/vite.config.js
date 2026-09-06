import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      persistState: { path: "../../.wrangler" },
      //auxiliaryWorkers: [{ configPath: "../trmnl-img/wrangler.toml" }], // build.rolldownOptions.external!
    }),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true,
  },
});
