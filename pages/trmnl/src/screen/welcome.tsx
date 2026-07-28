import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export default async function screen(device, env) {
  let date = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Indian/Reunion' }); 
  return new ImageResponse(
    <div tw="flex h-full w-full flex-col justify-center bg-black p-20">
      <div tw="flex flex-col">
        <h1 tw="m-0 text-9xl font-bold leading-none tracking-tighter text-white"> { date } </h1>
        <h1 tw="m-0 text-9xl font-bold leading-none tracking-tighter text-white">Welcome </h1>
      </div>
    </div>
    ,  
    {
      width: Number(device.width),
      height: Number(device.height),
      format: 'png'
    },
  );  
}
