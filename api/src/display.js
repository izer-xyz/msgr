export default async function display(req) {
  let device = req.device;
  await req.devices_stub.save(device);
  let filename = await req.devices_stub.getFilename(device);

  return Response.json({
    filename: filename.replaceAll("/", "_"),
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: new URL(`/api/screen/${filename}`, req.url),
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: device.sleep || device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    update_firmware: false,
  });
}
