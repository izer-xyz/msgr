import { getStub } from "../../admin/src/board_do.js";
import { render } from "takumi-js";
import font1 from "@fontsource/noto-sans/files/noto-sans-latin-500-normal.woff2?inline";
import font2 from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2?inline";
import emoji from "@fontsource/noto-emoji/files/noto-emoji-emoji-500-normal.woff2?inline";

export default function (path, router, greyPngResponse) {
  //path : /api/screen/{screen}/[{date}/{time}/]{version}.png
  router.get(`${path}/:date/:time/:filename`, async ({ req, env }) =>
    greyPngResponse(await screen(req.device, req.params, env), req.device),
  );

  router.get(path, async ({ req }) => {
    console.info(
      `Device#${req.device.id} Headers`,
      Object.fromEntries(req.headers),
    );
    return Response.redirect(
      new URL(
        `${path}/../${await req.deviceStub.getFilename(req.device)}`,
        req.url,
      ),
      302,
    );
  });
  return screen;
}

async function screen(device, params, env) {
  let date = params.date;
  let time = params.time;
  let dateTime = new Date(date + " " + time);
  let dateText = dateTime.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let dayText = dateTime.toLocaleDateString("fr-FR", {
    weekday: "long",
  });

  let day = dateTime.getDay() || 7; // Sun is 7 not 0

  let stub = device.storage_id ? getStub(env, null, device.storage_id) : null;
  let messages = stub ? await stub.one(day, date, time) : [];

  if (device.sleep) {
    time = "--:--";
  }
  let font_size = device.font_size || 5;
  return render(
    `<div tw="flex h-full w-full flex-col bg-white text-black px-4 font-bold leading-none">
      <div tw="flex text-[96px] pb-12">
        <div tw="grow capitalize self-center">${dayText}, ${dateText}</div>
        <div tw="">${time}</div>
      </div>
      <div tw="h-full grid m-4 text-[${40 + font_size * 8}px] leading-[1.1] font-normal">
          ${render_messages(messages, font_size)}
      </div>
    </div>`,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      emoji: "from-font",
      fonts: [font1, font2, emoji],
      css: `
        @theme {
        }
      `,
    },
  );
}

function render_messages(messages, font_size) {
  return messages.reduce(
    (html, message) => `${html}
            <div tw="mb-[72px] content-center grid">
              <span tw="font-bold">${message.subject ? message.time + " " + message.subject : ""}</span>
              <span tw="">${message.content}</span>
              ${render_from(message, font_size)}
            </div>`,
    "",
  );
}

function render_from(message, font_size) {
  return message && message.from
    ? `<span tw="text-right border-t-[2px] border-gray-700 pt-[8px] text-[${16 + font_size * 8}px]">${message.from} </span>`
    : "";
}
