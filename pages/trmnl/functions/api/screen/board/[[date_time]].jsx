import { process, render } from "../screen.js";
import { googleFonts } from "takumi-js/helpers";

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
    ? (await Promise.all(await env.TRMNL_BOARD.get(messageKeys, "json")))
        .reduce((list, i) => (i[1] ? list.push(i[1]) && list : list), [])
        .sort(
          (a, b) =>
            -a.time.localeCompare(b.time) - 100 * a.day.localeCompare(b.day),
        )
    : [];

  let hide = eventKeys.find((key) => key.endsWith("..-"));
  let events = eventKeys.length
    ? (await Promise.all(await env.TRMNL_BOARD.get(eventKeys, "json")))
        .reduce((list, i) => {
          if (i[1] && !i[1].hide && (i[1].date || !hide)) {
            list.push(i[1]);
          }
          return list;
        }, [])
        .sort(
          (a, b) =>
            a.time.localeCompare(b.time) * 1000 +
            (Number(a.day) - Number(b.day)) * 100 +
            a.subject.localeCompare(b.subject),
        )
    : [];

  if (device.sleep) {
    time = "--:--";
  }

  console.log(`[INFO /api/screen/board/${device.id}] ${dateTime}`);

  return render(
    <div tw="flex h-full w-full flex-col bg-white font-[Noto_Sans] text-black text-6xl px-4 font-bold leading-loose">
      <div tw="flex text-8xl pb-16">
        <div tw="grow capitalize self-center">
          {day}, {date}
        </div>
        <div tw="text-9xl">{time}</div>
      </div>
      <div tw="flex justify-between m-4 text-5xl">
        <div tw="w-[880px] flex flex-col">
          {events.map((event) => (
            <div tw="mb-[44px]">
              <span tw="text-gray-700 text-6xl">{event.time} </span>
              <span tw="text-6xl">{event.subject}</span>
              <div tw="font-normal mt-[16px]" x-show="event.content">
                {event.content}
              </div>
            </div>
          ))}
        </div>
        <div tw="w-[880px] flex flex-col font-semibold">
          {messages.map((message) => (
            <div tw="mb-[44px] flex flex-col">
              <span tw="border-b-[4px] border-black px-[16px] py-[8px]">
                {message.content}
              </span>
              <span tw="self-end text-4xl">{message.from} </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      emoji: "fluentFlat",
      fonts: [font], //googleFonts([{ name: "Noto Sans", weight: "800..900" }]),
    },
  );
}
