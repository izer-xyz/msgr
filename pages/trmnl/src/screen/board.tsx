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
    <div tw="flex h-full w-full flex-col bg-white font-[Roboto_Flex] text-black text-5xl leading-5">
      <div tw="flex px-5">
        <h3 tw="grow capitalize self-end">
          {day}, {date}
        </h3>
        <h1 tw="font-900 ">{time}</h1>
      </div>
      <div tw="flex pt-4 px-5 font-bold">
        <div tw="flex-1 flex flex-col">
          <div tw="flex ">
            <span tw="pr-12"></span>
            <span tw="">Anniversaire de Ming</span>
          </div>
          <div tw="flex pt-4">
            <span tw="pr-2 flex-none">08:11</span>
            <span tw="">Check-up avec nurse</span>
          </div>
          <div tw="flex pt-4">
            <span tw="pr-2 flex-none">10:30</span>
            <span tw="">
              Rdv avec la docteur B en ville. La bus part a 10:40.
            </span>
          </div>
          <div tw="flex pt-4">
            <span tw="pr-2 flex-none">12:30</span>
            <span tw="">Repas avec Jule a la maison.</span>
          </div>
        </div>
        <div tw="flex-1 flex flex-col">
          <div tw="flex flex-col pl-4">
            <span tw="border-black border-2 px-2 py-1 rounded-lg">
              Bonjour Mama - Je te suite une tres belle journee d'ete avec tous
              les mondes!
            </span>
            <span tw="self-end">Viv' </span>
          </div>
          <div tw="flex flex-col pl-4 pt-4">
            <span tw="border-black border-2 px-2 py-1 rounded-lg">
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
      fonts: googleFonts(["Roboto Flex"]),
    },
  );
}
