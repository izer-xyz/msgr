import { WorkerEntrypoint } from "cloudflare:workers";
import { Devices, getStub } from "../api/src/devices.js";

import { Router } from "@tsndr/cloudflare-worker-router";
import { encode, ColorType } from "@cf-wasm/png";

import welcomeRoute from "./src/welcome.js";
import boardRoute from "./src/board.js";
import { greyscale, validateDisplay } from "./src/image.js";

export { Devices };

// Initialize Router
const router = new Router();

// Enabling build in CORS support
router.cors();

let welcome = welcomeRoute("/api/screen/welcome", router, greyPngResponse);
let board = boardRoute("/api/screen/board", router, greyPngResponse);

router.use(async ({ env, req }) => {
  req.deviceStub = getStub(env, req);
  let device = (req.device = await req.deviceStub.from(req.headers));
  if (!device.updated) {
    console.log("[WARN img] Unknow device", device.id);
  }
  // TODO improve auth
  if (req.url.indexOf(device.screen) < 0) {
    console.log(
      `[WARN img] Device screen (${device.screen}) doesn't match url (${req.url})`,
    );
    return greyPngResponse(await welcome(req), device);
  }
  console.log(`[INFO ${device.screen}/${device.id}]`, req.url);
  console.log(
    `[INFO ${device.screen}/${device.id}]`,
    Object.fromEntries(req.headers),
  );
});

// Listen Cloudflare Workers Fetch Event
export default class Img extends WorkerEntrypoint {
  async fetch(request) {
    return router.handle(request, this.env, this.ctx, null, { device: {} });
  }
  async preview(device, request) {
    return greyPngResponse(
      await ({ welcome, board }[device.screen] || welcome)(
        device,
        request,
        this.env,
      ),
      device,
    );
  }
}

function greyPngResponse(img, device) {
  validateDisplay(device);
  let raw = greyscale(device, img);
  let png = encode(raw, device.width, device.height, {
    color: ColorType.Grayscale,
    depth: Number(device.depth),
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
