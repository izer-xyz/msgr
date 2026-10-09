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
  let messages = stub ? await stub.listMessages(date, day) : [];
  let events = stub ? await stub.listEvents(date, day) : [];

  // hide events more than 1-1.5h old
  let expiry = `${dateTime.getHours() - 1}:${time.split(":")[1]}`;
  if (expiry.length == 4) expiry = "0" + expiry;
  console.log(`!!! EXPIRY ${expiry}`);
  events = events.filter((e) => !e.time || e.time > expiry);

  console.log(events);

  if (device.sleep) {
    time = "--:--";
  }
  let font_size = device.font_size || 5;
  return render(
    `<div tw="flex h-full w-full flex-col bg-white text-black px-4 font-bold leading-none">
      <div tw="flex text-[96px] pb-12">
        <div tw="grow capitalize self-center">${dayText}, ${dateText}</div>
        <div tw="text-[120px]">${time}</div>
      </div>
      <div tw="flex justify-between m-4 text-[${40 + font_size * 8}px] leading-[1.1] font-normal">
        <div tw="w-[1100px] flex flex-col border-r-[2px] border-gray-700 pr-[8px] h-[80vh]">
          ${render_events(events, font_size)}
        </div>
        <div tw="w-[680px] flex flex-col">
          ${render_messages(messages, font_size)}
        </div>
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

function render_events(events, font_size) {
  return events.reduce(
    (html, event) =>
      event.hide || event.day == events[0].hide
        ? html
        : `${html}
            <div tw="mb-[36px]">
              <div tw="font-bold text-[${48 + font_size * 8}px]"><span tw="text-gray-800">${event.time} </span>${event.subject}</div>
              <div tw="" x-show="event.content">${event.content}</div>
            </div>`,
    "",
  );
}

function render_messages(messages, font_size) {
  return messages.reduce(
    (html, message) => `${html}
            <div tw="mb-[36px] flex flex-col">
              <span tw="border-b-[2px] border-gray-700 pb-[8px]">${message.content}</span>
              <span tw="self-end text-[${24 + font_size * 8}px]">${message.from} </span>
            </div>`,
    "",
  );
}
