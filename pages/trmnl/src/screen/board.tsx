import { render } from "takumi-js";

export default async function screen(device, env) {
  let date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Indian/Reunion",
  });
  let day = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    timeZone: "Indian/Reunion",
  });
  let time = new Date().toLocaleTimeString("fr-FR", {
    timeStyle: "short",
    timeZone: "Australia/Sydney",
    //timeZone: "Indian/Reunion",
  });
  return render(
    <div tw="flex h-full w-full flex-col bg-white text-black text-5xl px-5 leading-5">
      <div tw="flex">
        <h1 tw="flex grow">{time}</h1>
        <h1 tw="capitalize">{date}</h1>
      </div>
      <div tw="flex pt-4">
        <div tw="flex-1 flex flex-col">
          <h2 tw="flex capitalize font-bold m-0 p-0">
            <span tw="w-15"></span>
            {day}
          </h2>
          <div tw="flex pt-4">
            <span tw="w-15 flex-none text-right px-2">-</span>
            <span tw="">Anniversaire de Ming</span>
          </div>
          <div tw="flex pt-4">
            <span tw="w-15 flex-none text-right px-2">8:45</span>
            <span tw="">Check-up avec nurse</span>
          </div>
          <div tw="flex pt-4">
            <span tw="w-15 flex-none text-right px-2">10:30</span>
            <span tw="">
              Rdv avec la docteur B en ville. La bus part a 10:40.
            </span>
          </div>
          <div tw="flex pt-4">
            <span tw="w-15 flex-none text-right px-2">12:30</span>
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
    },
  );
}
