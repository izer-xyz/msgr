import { WorkerEntrypoint } from "cloudflare:workers";
import { Router } from "@tsndr/cloudflare-worker-router";
import { encode, ColorType } from "@cf-wasm/png";

import { from } from "../src/device.js";
import welcomeRoute from "./src/welcome.js";
import boardRoute from "./src/board.js";
import { greyscale, validateDisplay } from "./src/image.js";

// Initialize Router
const router = new Router();

// Enabling build in CORS support
router.cors();

let welcome = welcomeRoute("/api/screen-v2/welcome", router, greyPngResponse);
let board = boardRoute("/api/screen-v2/board", router, greyPngResponse);

router.use(async ({ env, req }) => {
  req.device = (await from(env.TRMNL_DEVICES, req.headers)).device;
  // TODO improve auth
  if (req.url.indexOf(req.device.screen) < 0) {
    console.log(
      `[WARN] Device screen (${req.device.screen}) doesn't match url (${req.url})`,
    );
    return greyPngResponse(await welcome(req.device), req.device);
  }
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
