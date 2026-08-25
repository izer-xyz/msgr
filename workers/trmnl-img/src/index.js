import { from } from "../../../src/device.js";
import { encode } from "fast-png";
import welcome from "./welcome.js";
import board from "./board.js";

const SCREENS = {
  welcome,
  board,
};

export default {
  // /api/screen/{screen}/[{date}/{time}/]{version}.png
  async fetch(request, env, ctx) {
    let path = new URL(request.url).pathname.split("/").filter((a) => a !== "");
    let device = (await from(env.TRMNL_DEVICES, request.headers)).device;

    if (path.length < 4 || device.screen !== path[2]) {
      return new Response("Not found", { status: 404 });
    }

    let screen = SCREENS[device.screen] || SCREENS.welcome;
    let png = encode(greyscale(device, await screen(device, path, env)));

    return new Response(png, { headers: { "Content-Type": "image/png" } });
  },
};

function greyscale(device, data) {
  let out = {
    depth: Number(device.depth),
    channels: 1,
    width: Number(device.width),
    height: Number(device.height),
    data: null,
  };
  out.data = new Uint8Array(
    new Array((out.width * out.height * out.depth) / 8),
  );

  let channels = data.length / (out.width * out.height);

  for (let i = 0; i < out.width * out.height; i++) {
    let grey =
      0.2126 * data[i * channels] +
      0.7152 * data[i * channels + 1] +
      0.0722 * data[i * channels + 2];

    out.data[Math.floor((i * out.depth) / 8)] |=
      (grey >> (8 - out.depth)) <<
      (8 - out.depth * (1 + (i % (8 / out.depth))));
  }

  return out;
}
