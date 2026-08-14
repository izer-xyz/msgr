import { process, render } from "../screen.js";
//import { googleFonts } from "takumi-js/helpers";

export let onRequest = process(screen, "board");

async function screen(device, { env, params }) {
  let dateFilter = params.date_time[0];
  let time = params.date_time[1];
  let dateTime = new Date(dateFilter + " " + time);
  let date = dateTime.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let day = dateTime.toLocaleDateString("fr-FR", {
    weekday: "long",
  });

  let dayOfWeek = dateTime.getDay() || 7; // Sun is 7 not 0

  let messageKeys = [
    ...(await env.TRMNL_BOARD.list({ prefix: `M.D${dayOfWeek}` })).keys,
    ...(await env.TRMNL_BOARD.list({ prefix: `M.${dateFilter}` })).keys,
  ].map((key) => key.name);

  let eventKeys = [
    ...(await env.TRMNL_BOARD.list({ prefix: `C.D${dayOfWeek}` })).keys,
    ...(await env.TRMNL_BOARD.list({ prefix: `C.${dateFilter}` })).keys,
  ].map((key) => key.name);

  let messages = messageKeys.length
    ? (
        await Promise.all(await env.TRMNL_BOARD.get(messageKeys, "json"))
      ).reduce((list, i) => (i[1] ? list.push(i[1]) && list : list), [])
    : [];

  let events = eventKeys.length
    ? (await Promise.all(await env.TRMNL_BOARD.get(eventKeys, "json"))).reduce(
        (list, i) => (i[1] ? list.push(i[1]) && list : list),
        [],
      )
    : [];

  if (device.sleep) {
    time = "--:--";
  }

  console.log(`[INFO /api/screen/board/${device.id}] ${dateTime}`);

  return render(
    <div tw="flex h-full w-full flex-col bg-white font-[Noto_Sans] font-black text-black text-6xl px-1 leading-5">
      <div tw="flex text-2xl pb-8">
        <div tw="grow capitalize self-end ">
          {day}, {date}
        </div>
        <div tw="text-3xl pr-2">{time}</div>
      </div>
      <div tw="flex">
        <div tw="flex-1 flex flex-col">
          {events.map((event) => (
            <div tw="bg-gray-200 p-1 rounded-lg">
              <span tw="text-gray-700">{event.time} </span>
              <span tw="">{event.subject}</span>
              <div tw="text-xs font-bold pl-1">{event.content}</div>
            </div>
          ))}
        </div>
        <div tw="flex-1 flex flex-col text-xs font-bold pr-2">
          {messages.map((message) => (
            <div tw="flex flex-col pl-4">
              <span tw="border-3 border-black px-2 py-1 rounded-lg">
                {message.content}
              </span>
              <span tw="self-end">{message.from} </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      //fonts: googleFonts([{ name: "Noto Sans", weight: "800..900" }]),
    },
  );
}
