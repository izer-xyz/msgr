import error from "../../../src/screen/error.tsx";
import { default as lookup, DEFAULTS } from "../../../src/device.ts";
import process from "../../../src/image.ts";

export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES);
  const png = await process(device, env);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
