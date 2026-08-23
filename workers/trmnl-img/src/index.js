import { render } from "takumi-js";
import { encode } from "fast-png";

import font1 from "@fontsource/noto-sans/files/noto-sans-latin-500-normal.woff2"; 
import font2 from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2"; 
import emoji from "@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2";

export default {
	async fetch(request, env, ctx) {
		return process(screen)(ctx); 
	},
};

export function process(render) {
  return async (ctx) => {
    let device = {time_zone : "Australia/Sydney", width: 1872, height:1404, depth:4}; 
    let raw = await render(device, ctx); 
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

function screen(device) {
  let dateTime = new Date();
  let date = dateTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: device.time_zone,
  });
  let time = dateTime.toLocaleTimeString("fr-FR", {
    timeStyle: "short",
    timeZone: device.time_zone,
  });

  console.log(`[INFO /api/screen/${device.id}] ${date} ${time}`);

  return render(
    `<div tw="flex h-full w-full flex-col justify-center bg-white p-20">
      <div tw="flex flex-col">
        <h1 tw="m-0 text-9xl font-normal leading-none text-black"> ${time} </h1>
        <h1 tw="m-0 text-9xl font-bold leading-none text-black capitalize">
          ${date} 🍜
        </h1>
      </div>
    </div>`,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      emoji: "from-font",
      fonts: [font1,font2,emoji],
    },
  );
}


