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
  const png = encode(greyscale(decode(raw), Number(device.depth)));
  return png;
}

function greyscale({ width, height, data }, depth) {
  let out = {
    depth,
    channels: 1,
    width,
    height,
    data: new Uint8Array(new Array((width * height * depth) / 8)),
  };
  let channels = data.length / (width * height);

  for (let i = 0; i < width * height; i++) {
    let grey =
      0.2126 * data[i * channels]! +
      0.7152 * data[i * channels + 1]! +
      0.0722 * data[i * channels + 2]!;

    out.data[Math.floor((i * depth) / 8)] |=
      (grey >> (8 - depth)) << (8 - depth * (1 + (i % (8 / depth))));
  }

  return out;
}
