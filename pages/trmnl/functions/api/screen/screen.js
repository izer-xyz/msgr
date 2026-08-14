import lookup from "../util.js";
import { encode } from "fast-png";
import { screen as error } from "./[[default]].jsx";

export { render } from "takumi-js";

export function process(render, screen = "welcome") {
  return async (ctx) => {
    let device = await lookup(ctx.request.headers, ctx.env.TRMNL_DEVICES);
    let raw =
      device.screen === screen
        ? await render(device, ctx)
        : await error(device, ctx);
    let png = encode(greyscale(device, raw));
    return new Response(png, { headers: { "Content-Type": "image/png" } });
  };
}

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
