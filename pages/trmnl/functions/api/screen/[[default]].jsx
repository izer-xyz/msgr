import { process, render } from "./screen.js";

export let onRequest = process(screen);

export async function screen(device) {
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
    <div tw="flex h-full w-full flex-col justify-center bg-white p-20">
      <div tw="flex flex-col">
        <h1 tw="m-0 text-9xl font-bold leading-none text-black"> {time} </h1>
        <h1 tw="m-0 text-9xl font-bold leading-none text-black capitalize">
          {date}
        </h1>
      </div>
    </div>,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
    },
  );
}
