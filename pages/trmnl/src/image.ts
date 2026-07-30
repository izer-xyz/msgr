import { encode, decode } from "fast-png";
//import { Jimp } from "jimp";
import error from "./screen/error.tsx";
import welcome from "./screen/welcome.tsx";
import board from "./screen/board.tsx";

const SCREENS = {
  error,
  welcome,
  board,
};

export default async function process(device, env) {
  let render = SCREENS[device.screen] || error;
  let raw = await render(device, env);
  const png = encode(greyscale(device, raw));
  return png;
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
      0.2126 * data[i * channels]! +
      0.7152 * data[i * channels + 1]! +
      0.0722 * data[i * channels + 2]!;

    out.data[Math.floor((i * out.depth) / 8)] |=
      (grey >> (8 - out.depth)) <<
      (8 - out.depth * (1 + (i % (8 / out.depth))));
  }

  return out;
}
