import { render } from "takumi-js";
import font1 from "@fontsource/noto-sans/files/noto-sans-latin-500-normal.woff2?inline";
import font2 from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2?inline";
import emoji from "@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2?inline";

export default function (path, router, greyPngResponse) {
  router.get(path, async ({ req }) =>
    greyPngResponse(await screen(req.device), req.device),
  );
  router.get(`${path}/:date/:time/:filename`, async ({ req }) =>
    greyPngResponse(await screen(req.device), req.device),
  );
  return screen;
}

export async function screen(device) {
  return render(
    `<div tw="flex h-full w-full flex-col justify-center bg-white text-black p-20">
      <div tw="flex flex-col">
        <h1 tw="m-0 text-9xl font-bold">Bienvenue 🏖️</h1>
        <h1 tw="m-0 text-5xl font-normal py-20">
          💡 Allumez-moi chez Mamie avec le bouton 'on' derrière.   
        </h1>
      </div>
    </div>`,
    {
      width: Number(device.width),
      height: Number(device.height),
      format: "raw",
      emoji: "from-font",
      fonts: [font1, font2, emoji],
    },
  );
}
