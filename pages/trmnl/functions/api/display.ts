import lookup from "../../src/device.ts";
// import process from '../../src/image.ts';

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES, true);

  if (env.TRMNL_ANALYTICS) {
    env.TRMNL_ANALYTICS.writeDataPoint({
      blobs: [
        device["x-real-ip"],
        device.model,
        device["fw-version"],
        device.friendly_id,
      ],
      doubles: [
        Number(device["wake-time"]),
        Number(device["battery-voltage"]),
        Number(device.refresh_rate),
      ],
      indexes: [device.id],
    });
  } else {
    console.log(`[INFO /api/display/${device.id}] ${JSON.stringify(device)}`);
  }

  const filename = Date.now() + ".png"; //await process(device, env);

  let response = JSON.stringify({
    filename: filename,
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: `${request.url}/../img/${filename}`,
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    //'temperature_profile': 'default',
    //'touchbar_mode': 'tap',
    update_firmware: false,
  });

  return new Response(response, {
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
}
