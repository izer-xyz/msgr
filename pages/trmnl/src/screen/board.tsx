import { render } from "takumi-js";
import { googleFonts } from "takumi-js/helpers";

export default async function screen(device, env) {
  // celing to the nearest 5 minutes
  const coef = 1000 * 60 * 5;
  let now = new Date(Math.ceil(new Date() / coef) * coef);
  let date = now.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Indian/Reunion",
  });
  let day = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    timeZone: "Indian/Reunion",
  });
  let time = now.toLocaleTimeString("fr-FR", {
    timeStyle: "short",
    timeZone: "Australia/Sydney",
    //timeZone: "Indian/Reunion",
  });
  return render(
    <div tw="flex h-full w-full flex-col bg-white font-[Noto_Sans] font-black text-black text-6xl px-1 leading-5">
      <div tw="flex text-2xl pb-8">
        <div tw="grow capitalize self-end ">
          {day}, {date}
        </div>
        <div tw="">{time}</div>
      </div>
      <div tw="flex">
        <div tw="flex-1 flex flex-col">
          <div tw="bg-gray-200 p-1 rounded-lg">
            <span tw=""></span>
            <span tw="">Anniversaire de Ming</span>
          </div>
          <div tw="mt-5 bg-gray-200 p-1 rounded-lg">
            <span tw="text-gray-600">08:15 </span>
            <span tw="">Check-up avec nurse</span>
          </div>
          <div tw="mt-5 bg-gray-200 p-1 rounded-lg">
            <span tw="text-gray-700">10:30 </span>
            <span tw="">
              Rdv avec la docteur B en ville. La bus part a 10:40.
            </span>
          </div>
          <div tw="mt-5 bg-gray-200 p-1 rounded-lg">
            <span tw="text-gray-800">12:30 </span>
            <span tw="">Repas avec Jule a la maison.</span>
          </div>
        </div>
        <div tw="flex-1 flex flex-col text-xs font-bold">
          <div tw="flex flex-col pl-4">
            <span tw="bg-gray-200 p-2 rounded-lg">
              Bonjour Mama - Je te suite une tres belle journee d'ete avec tous
              les mondes!
            </span>
            <span tw="self-end">Viv' </span>
          </div>

          <div tw="flex flex-col pl-4 pt-4">
            <span tw="bg-gray-200 p-2 rounded-lg">
              fdj fd kdfjkd fd fdf df djf dkjfkdjf dfkd fkdf dfjkdfkd
              jfkjdkfjdfjkd fk-- fdf df fd d df df
            </span>
            <span tw="self-end">Gustave </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      fonts: googleFonts([{ name: "Noto Sans", weight: "800..900" }]),
    },
  );
}
