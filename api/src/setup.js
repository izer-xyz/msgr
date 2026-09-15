export default async function setup(req, ctx) {
  let device = req.device;
  // TODO generate access token
  device.api_key = device.id;
  device.friendly_id = device.id.slice(-5);
  ctx.waitUntil(req.devices_stub.save(device));

  return Response.json({
    api_key: device.api_key,
    friendly_id: device.friendly_id,
    image_url: new URL(
      `/api/screen/${await req.devices_stub.getFilename(device)}`,
      req.url,
    ),
    message: "Welcome",
    status: 200,
  });
}
