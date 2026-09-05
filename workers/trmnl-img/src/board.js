import { Message } from "../../../src/event.js";
import { Calendar } from "../../../src/event.js";

import { render } from "takumi-js";
import font1 from "@fontsource/noto-sans/files/noto-sans-latin-500-normal.woff2";
import font2 from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2";
import emoji from "@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2";

export default function (path, router, greyPngResponse) {
  //path : /api/screen/{screen}/[{date}/{time}/]{version}.png
  router.get(`${path}/:date/:time/:v.png`, async ({ req, env }) =>
    greyPngResponse(await screen(req.device, req, env), req.device),
  );
  return screen;
}

async function screen(device, req, env) {
  let date = req.params.date;
  let time = req.params.time;
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

  let messages = await new Message({ date, day }, env.TRMNL_BOARD).list(false);
  let events = await new Calendar({ date, day }, env.TRMNL_BOARD).list(false);

  if (device.sleep) {
    time = "--:--";
  }

  console.log(`[INFO /api/screen/board/${device.id}] ${dateTime}`);

  return render(
    `<div tw="flex h-full w-full flex-col bg-white font-[Noto_Sans] text-black text-6xl px-4 font-bold leading-loose">
      <div tw="flex text-8xl pb-16">
        <div tw="grow capitalize self-center">${dayText}, ${dateText}</div>
        <div tw="text-9xl tabular-nums">${time}</div>
      </div>
      <div tw="flex justify-between m-4 text-5xl">
        <div tw="w-[880px] flex flex-col">
          ${render_events(events)}
        </div>
        <div tw="w-[880px] flex flex-col font-semibold">
          ${render_messages(messages)}
        </div>
      </div>
    </div>`,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      emoji: "from-font",
      fonts: [font1, font2, emoji],
    },
  );
}

function render_events(events) {
  return events.reduce(
    (html, event) => `${html}
            <div tw="mb-[44px]">
              <span tw="text-gray-700 text-6xl">${event.time} </span>
              <span tw="text-6xl">${event.subject}</span>
              <div tw="font-normal mt-[16px]" x-show="event.content">${event.content}</div>
            </div>`,
    "",
  );
}

function render_messages(messages) {
  return messages.reduce(
    (html, message) => `${html}
            <div tw="mb-[44px] flex flex-col">
              <span tw="border-[2px] border-gray-700 rounded-4xl px-[24px] py-[16px]">${message.content}</span>
              <span tw="self-end text-4xl">${message.from} </span>
            </div>`,
    "",
  );
}
