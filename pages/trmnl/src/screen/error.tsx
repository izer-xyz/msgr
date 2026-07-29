import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export default function screen(device, env, params) {
  return new ImageResponse(
    (
      <h2 tw="flex h-full w-full flex-col justify-center bg-white">
        ERROR {params?.message}
      </h2>
    ),
    {
      width: Number(device.width),
      height: Number(device.height),
      status: 404,
    },
  );
}
