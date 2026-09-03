import { encode, ColorType } from "@cf-wasm/png";

import { from } from "../../../src/device.js";
import welcome from "./welcome.js";
import board from "./board.js";

const SCREENS = {
  welcome,
  board,
};

export default {
  // /api/screen/{screen}/[{date}/{time}/]{version}.png
  async fetch(request, env, ctx) {
    let png = null;
    if (request.method !== "OPTIONS") {
      let path = new URL(request.url).pathname
        .split("/")
        .filter((a) => a !== "");
      let device = (await from(env.TRMNL_DEVICES, request.headers)).device;

      if (path.length < 4 || device.screen !== path[2]) {
        return new Response("Not found", { status: 404 });
      }

      let screen = SCREENS[device.screen] || SCREENS.welcome;
      let raw = greyscale(device, await screen(device, path, env));
      png = encode(raw, device.width, device.height, {
        color: ColorType.Grayscale,
        depth: Number(device.depth),
      });
    }
    // Access-Control-Allow-* is needed to run locally and fetch cross origin image in admin
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": request.headers.get("origin"),
        "Access-Control-Allow-Headers": "id",
      },
    });
  },
};

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
