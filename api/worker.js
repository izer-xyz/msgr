import { Devices, getStub } from "./src/devices_do.js";
import { Router } from "@tsndr/cloudflare-worker-router";

import display from "./src/display.js";
import log from "./src/log.js";
import setup from "./src/setup.js";

// export DurableObject
export { Devices };

// Initialize Router
const router = new Router();

// get current user profile
router.use(async ({ env, req }) => {
  req.devices_stub = getStub(env, req);
  req.device = await req.devices_stub.from(req.headers);
  req.device.storage_id = req.devices_stub.name;
  console.info(`Device#${req.device.id}`, await req.devices_stub.keys());
  req.analytics = env.TRMNL_ANALYTICS;
  metrics(req);
});

router.get(`/api/setup`, async ({ req, ctx }) => setup(req, ctx));
router.get(`/api/display`, async ({ req, ctx }) => display(req, ctx));
router.post(`/api/log`, async ({ req }) => log(req));

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx, null, { device: {} });
  },
};

async function metrics(req) {
  if (req.analytics) {
    req.analytics.writeDataPoint({
      blobs: [
        req.device["x-real-ip"],
        req.device.model,
        req.device["fw-version"],
        req.device.friendly_id,
        await req.devices_stub.getFilename(req.device),
      ],
      doubles: [
        Number(req.device["wake-time"]),
        Number(req.device["battery-voltage"]),
        Number(req.device.refresh_rate),
      ],
      indexes: [req.device.id],
    });
  } else {
    // no analytics just save to KV
    console.info("Metrics", req.device.id, req.device);
  }
}
