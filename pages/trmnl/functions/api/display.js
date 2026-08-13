import lookup from "../../src/device.js";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES, true);
  metrics(device, env.TRMNL_ANALYTICS);

  let coef =
    ([
      /* TODO FIX TimeZone! the large groups don't work sets to 4am
      1m   2m   5m  10m  15m   30m    1h    2h     3h     6h    12h    24h*/
      60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400,
    ].find((c) => c > Number(device.refresh_rate)) || device.refresh_rate) *
    1000;
  let now = new Date(Math.ceil(new Date().getTime() / coef) * coef);

  let dateTime = now
    .toLocaleString("lt-LT", {
      // lituania uses the ISO 8601 format
      timeZone: device.time_zone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
    .split(" ");

  let filename = dateTime.join("_") + ".png";

  // blackout screen during sleep time
  let response = {
    filename: filename,
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: new URL(`/api/img/${filename}`, request.url), // TODO add screen name
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    //'temperature_profile': 'default',
    //'touchbar_mode': 'tap',
    update_firmware: false,
  };

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
