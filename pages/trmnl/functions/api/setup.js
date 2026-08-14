import { default as lookup, save } from "./util.js";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#setup
// https://oetiker.github.io/byonk/dev/api/http-api.html#get-apisetup
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES);

  // TODO generate access token
  device.api_key = device.id;
  device.friendly_id = device.id.slice(-5);

  await save(device, env.TRMNL_DEVICES);

  const filename = Date.now() + ".png"; //await process(device, env);

  return Response.json({
    api_key: device.api_key,
    friendly_id: device.friendly_id,
    image_url: `${request.url}/../img/${filename}`,
    message: "Welcome",
    status: 200,
  });
}
