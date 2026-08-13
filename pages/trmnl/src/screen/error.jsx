import { render } from "takumi-js";

export default function screen(device, env, params) {
  return render(
    <h2 tw="flex h-full w-full flex-col justify-center bg-white">
      ERROR {params?.message}
    </h2>,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: 'raw'
    },
  );
}
