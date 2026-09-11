import { Router } from "@tsndr/cloudflare-worker-router";
import { from } from "../src/device.js";

import display from "./src/display.js";
import log from "./src/log.js";
import setup from "./src/setup.js";

// Initialize Router
const router = new Router();

// get current user profile
router.use(async ({ env, req }) => {
  console.log("[", req.method, new URL(req.url).pathname, "]");
  req.device = await from(env.TRMNL_DEVICES, req.headers);
  metrics(req.device, env);
});

router.get(`/api/setup`, async ({ req }) => setup(req));
router.get(`/api/display`, async ({ req, env }) => display(req, env));
router.post(`/api/log`, async ({ req }) => log(req));

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx, null, { device: {} });
  },
};

async function metrics(data, env) {
  if (env.TRMNL_ANALYTICS) {
    env.TRMNL_ANALYTICS.writeDataPoint({
      blobs: [
        data.device["x-real-ip"],
        data.device.model,
        data.device["fw-version"],
        data.device.friendly_id,
        data.getFilename(),
      ],
      doubles: [
        Number(data.device["wake-time"]),
        Number(data.device["battery-voltage"]),
        Number(data.device.refresh_rate),
      ],
      indexes: [data.device.id],
    });
  } else {
    // no analytics just save to KV
    console.log(
      `[INFO /api/display/${data.device.id}] ${JSON.stringify(data.device)}`,
    );
    await data.save();
  }
}
