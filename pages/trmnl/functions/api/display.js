import { default as lookup, getFilename, save } from "./util.js";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES, true);

  // only save twice/3 a day KV limits apply
  if (
    new Date(device.updated || 0).toDateString() !==
      new Date().toDateString() ||
    device.sleep !== ""
  ) {
    await save(device, env.TRMNL_DEVICES);
  }

  let filename = `/api/screen/${getFilename(device)}`;

  // blackout screen during sleep time
  let response = {
    filename: filename,
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: new URL(filename, request.url),
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: device.sleep || device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    //'temperature_profile': 'default',
    //'touchbar_mode': 'tap',
    update_firmware: false,
  };

  metrics(device, env.TRMNL_ANALYTICS, filename);

  return Response.json(response);
}

function metrics(device, analytics, filename) {
  if (analytics) {
    analytics.writeDataPoint({
      blobs: [
        device["x-real-ip"],
        device.model,
        device["fw-version"],
        device.friendly_id,
        filename,
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
