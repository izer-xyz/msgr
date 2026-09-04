import { WorkerEntrypoint } from "cloudflare:workers";
import { Router } from "@tsndr/cloudflare-worker-router";
import { encode, ColorType } from "@cf-wasm/png";

import { from } from "../../../src/device.js";
import welcomeRoute from "./welcome.js";
import boardRoute from "./board.js";

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
    );
  }
}

function greyPngResponse(img, device) {
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

function greyscale(device, data) {
  let size = Number(device.width) * Number(device.height);
  let depth = Number(device.depth);

  let out = new Uint8Array((size * depth) / 8);
  let channels = data.length / size;

  for (let i = 0; i < size; i++) {
    // let grey = 0.2126 * data[i * channels] + 0.7152 * data[i * channels + 1] + 0.0722 * data[i * channels + 2];
    let index = i * channels;
    let grey = (data[index] + data[index + 1] + data[index + 2]) / 3;
    out[Math.floor((i * depth) / 8)] |=
      (grey >> (8 - depth)) << (8 - depth * (1 + (i % (8 / depth))));
  }
  return out;
}
