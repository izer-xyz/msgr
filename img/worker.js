import { WorkerEntrypoint } from "cloudflare:workers";
import { getStub as deviceStub } from "../api/src/devices_do.js";

import { Router } from "@tsndr/cloudflare-worker-router";
import { encode, ColorType } from "@cf-wasm/png";

import welcomeRoute from "./src/welcome.js";
import boardRoute from "./src/board.js";
import { greyscale, validateDisplay } from "./src/image.js";

// Initialize Router
const router = new Router();

// Enabling build in CORS support
router.cors();

let welcome = welcomeRoute("/api/screen/welcome", router, greyPngResponse);
let board = boardRoute("/api/screen/board", router, greyPngResponse);

router.use(async ({ env, req }) => {
  req.deviceStub = deviceStub(env, req);
  let device = (req.device = await req.deviceStub.from(req.headers));
  if (!device.updated) {
    console.log("[WARN] IMG Unknow device", device.id);
  }
  // TODO improve auth
  if (req.url.indexOf(device.screen) < 0) {
    console.log(
      `[WARN] IMG Device screen (${device.screen}) doesn't match url (${req.url})`,
    );
    return greyPngResponse(await welcome(req), device);
  }
  console.log(`[INFO] IMG ${device.screen}/${device.id}`);
});

// Listen Cloudflare Workers Fetch Event
export default class Img extends WorkerEntrypoint {
  async fetch(request) {
    return router.handle(request, this.env, this.ctx, null, { device: {} });
  }
  async preview(device, params) {
    return greyPngResponse(
      await ({ welcome, board }[device.screen] || welcome)(
        device,
        params,
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
