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

  let stub = device.storage_id ? env.BOARD.getByName(device.storage_id) : null;
  let messages = stub ? await stub.listMessages(date, day) : [];
  let events = stub ? await stub.listEvents(date, day) : [];

  if (device.sleep) {
    time = "--:--";
  }

  console.log(`[INFO /api/screen/board/${device.id}]`, params);

  return render(
    `<div tw="flex h-full w-full flex-col bg-white text-black px-4 font-bold leading-none">
      <div tw="flex text-[96px] pb-16">
        <div tw="grow capitalize self-center">${dayText}, ${dateText}</div>
        <div tw="text-[120px]">${time}</div>
      </div>
      <div tw="flex justify-between m-4 text-[48px] leading-[1.2] font-normal">
        <div tw="w-[1100px] flex flex-col border-r-[2px] border-gray-700 pr-[32px] h-[80vh]">
          ${render_events(events)}
        </div>
        <div tw="w-[660px] flex flex-col">
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
      css: `
        @theme {
        }
      `,
    },
  );
}

function render_events(events) {
  return events.reduce(
    (html, event) =>
      event.hide
        ? html
        : `${html}
            <div tw="mb-[44px]">
              <div tw="font-bold text-[54px] leading-[1em]"><span tw="text-gray-800">${event.time} </span>${event.subject}</div>
              <div tw="mt-[16px]" x-show="event.content">${event.content}</div>
            </div>`,
    "",
  );
}

function render_messages(messages) {
  return messages.reduce(
    (html, message) => `${html}
            <div tw="mb-[44px] flex flex-col">
              <span tw="border-b-[2px] border-gray-700 px-[24px] py-[16px]">${message.content}</span>
              <span tw="self-end text-[44px]">${message.from} </span>
            </div>`,
    "",
  );
}
