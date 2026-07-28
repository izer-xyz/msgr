import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export default async function screen(device, env) {
  let date = new Date().toLocaleDateString('fr-FR', {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
      timeZone: 'Indian/Reunion'
  });
  let time = new Date().toLocaleTimeString('fr-FR', {
      timeStyle: 'short',
      timeZone: 'Indian/Reunion'
  });
  return new ImageResponse(
    <div tw="flex h-full w-full flex-col bg-white p-20 text-6xl">
      <div tw="flex">
        <h1 tw="m-0 grow text-7xl font-bold leading-none text-black capitalize"> {date} </h1>
        <h1 tw="m-0 text-9xl font-bold leading-none text-black"> { time } </h1>
      </div>
      <div tw="flex">
        <div tw="flex-1 flex flex-col">
          <div tw="font-bold self-center">Ajoudhui</div>
          <div tw="flex pt-10">
            <span tw="flex-1">09:45</span> 
            <span tw="flex-4">Ajoudhui fdfd fdfdf ddd  dfdfd df d fdf f</span>
          </div>
          <div tw="flex pt-10">
            <span tw="flex-1">15:58</span> 
            <span tw="flex-4">Ajoudhui fdfd fdfdf ddd  dfdfd df d fdf f</span>
          </div>
        </div>
        <div tw="flex-1 flex flex-col">
          <div tw="flex flex-col p-10">
            <span>Messages fdj fd kdfjkd fd fdf df djf dkjfkdjf dfkd fkdf dfjkdfkd j-- fdf df fd d df df</span>
            <span tw="self-end">- Vivi</span>
          </div>
         <div tw="flex flex-col p-10">
            <span>Messages fdj fd kdfjkd fd fdf df djf dkjfkdjf dfkd fkdf dfjkdfkd jfkjdkfjdfjkd fk-- fdf df fd d df df</span>
            <span tw="self-end">- Vivi</span>
          </div>
        </div>
      </div>
    </div>
    ,  
    {
      width: Number(device.width),
      height: Number(device.height)
    },
  );  
}
