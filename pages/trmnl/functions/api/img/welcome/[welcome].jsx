import lookup from "../../../../src/device.js";
import process from "../../../../src/image.js";

export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES);
  const png = await process(device, env);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
