export default async function setup(req) {
  let device = req.device.device;
  // TODO generate access token
  device.api_key = device.id;
  device.friendly_id = device.id.slice(-5);
  await req.device.save();

  return Response.json({
    api_key: device.api_key,
    friendly_id: device.friendly_id,
    image_url: new URL(`/api/screen-v2/${req.device.getFilename()}`, req.url),
    message: "Welcome",
    status: 200,
  });
}
