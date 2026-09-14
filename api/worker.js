import { Devices, getStub } from "./src/devices.js";
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
  console.log({ level: "info" }, req.method, new URL(req.url).pathname);
  req.devices_stub = getStub(env, req);
  req.device = await req.devices_stub.from(req.headers);
  if (!req.device.updated) {
    console.log(
      "[INFO api] Unknow device",
      req.device.id,
      await req.devices_stub.keys(),
    );
  } else {
    console.log(
      `[INFO api/${req.device.id}] from`,
      await req.devices_stub.keys(),
    );
  }
  req.analytics = env.TRMNL_ANALYTICS;
  metrics(req);
});

router.get(`/api/setup`, async ({ req }) => setup(req));
router.get(`/api/display`, async ({ req, env }) => display(req, env));
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
    console.log(
      `[INFO /api/display/${req.device.id}] ${JSON.stringify(req.device)}`,
    );
    await req.devices_stub.save(req.device);
  }
}
