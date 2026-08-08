import lookup from "../../src/device.ts";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {
  const device = await lookup(request.headers, env.TRMNL_DEVICES, true);

  if (env.TRMNL_ANALYTICS) {
    saveMetrics(env.TRMNL_ANALYTIC, device);
  } else {
    console.log(`[INFO /api/display/${device.id}] ${JSON.stringify(device)}`);
  }

  const filename = Date.now() + ".png";

  let refresh = getRefreshRate(device);

  // blackout screen during sleep time
  let response = JSON.stringify({
    filename: filename,
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: `${request.url}/../img/${filename}`,
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: refresh,
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

function saveMetrics(analytics, device) {
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
}

function getRefreshRate(device) {
  let refresh_rate = 0;

  if (
    device.sleep_from &&
    device.sleep_to &&
    device.sleep_from !== device.sleep_to
  ) {
    let from = device.sleep_from
      .split(":")
      .reduce((r, v) => r * 60 + Number(v) * 60, 0);

    let to = device.sleep_to
      .split(":")
      .reduce((r, v) => r * 60 + Number(v) * 60, 0);

    let now = new Date()
      .toLocaleTimeString("fr-FR", {
        timeStyle: "short",
        timeZone: device.time_zone,
      })
      .split(":")
      .reduce((r, v) => r * 60 + Number(v) * 60, 0);

    if (now < to && ((from < to && from < now) || from > to)) {
      refresh_rate = to - now - 2 * device.refresh_rate;
    } else if (from > to && from < now) {
      refresh_rate = to + 24 * 60 * 60 - now - 2 * device.refresh_rate;
    }
  }

  refresh_rate =
    refresh_rate > device.refresh_rate ? refresh_rate : device.refresh_rate;

  return refresh_rate;
}
