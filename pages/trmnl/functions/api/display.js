import { default as lookup, getFilename } from "./util.js";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES, true);

  let filename = getFilename(device);

  // blackout screen during sleep time
  let response = {
    filename: filename,
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: new URL(`/api/screen/${filename}`, request.url), // TODO add screen name
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    //'temperature_profile': 'default',
    //'touchbar_mode': 'tap',
    update_firmware: false,
  };

  metrics(device, env.TRMNL_ANALYTICS);
  return Response.json(response);
}

function metrics(device, analytics) {
  if (analytics) {
    analytics.writeDataPoint({
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
}
