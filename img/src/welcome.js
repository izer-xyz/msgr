import { render } from "takumi-js";
import font1 from "@fontsource/noto-sans/files/noto-sans-latin-500-normal.woff2?inline";
import font2 from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2?inline";
import emoji from "@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2?inline";

export default function (path, router, greyPngResponse) {
  router.get(path, async ({ req }) =>
    greyPngResponse(
      await screen(req.device, await toDeviceTimeParams(req)),
      req.device,
    ),
  );
  return screen;
}

async function toDeviceTimeParams(req) {
  let dateTime = await req.deviceStub.deviceDateTime(req.device);
  let split = dateTime.split(" ");
  return { date: split[0], time: split[1] };
}

export async function screen(device, params) {
  let dateTime = new Date(params.date + " " + params.time);
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

  console.log(`[INFO /api/screen/${device.id}]`, params, date, time);

  return render(
    `<div tw="flex h-full w-full flex-col justify-center bg-white p-20">
      <div tw="flex flex-col">
        <h1 tw="m-0 text-9xl font-normal leading-none text-black"> ${time} </h1>
        <h1 tw="m-0 text-9xl font-bold leading-none text-black capitalize">
          ${date}
        </h1>
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
