import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export default function screen(device, env, params) {
  return new ImageResponse(
    <h2 tw="">${ params.message }</h2>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      status: 404, 
    },
  );  
}
