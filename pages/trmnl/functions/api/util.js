export const DEFAULTS = {
  id: "undefined",
  height: "1404",
  width: "1872",
  screen: "welcome",
  refresh_rate: "300",
  api_key: null,
  friendly_id: null,
  depth: "4",
  sleep_from: "",
  sleep_to: "",
  time_zone: "Indian/Reunion",
  sleep: "",
};

export default async function lookup(headers, kv, persist = false) {
  const device = await kv.get(headers.get("id") || DEFAULTS.id, "json");

  // All headers are lowercase
  const trmnlHeaders = Object.fromEntries(
    headers.entries().filter(([key]) => !IGNORE_HEADERS.includes(key)),
  );

  const newDevice = {
    ...DEFAULTS,
    ...device,
    ...trmnlHeaders,
  };
  console.log(
    `[INFO /headers/${newDevice.id}] ${JSON.stringify(trmnlHeaders)}`,
  );

  let refresh_rate = getSleepTime(newDevice);

  // only save twice/3 a day KV limits apply
  if (
    (persist &&
      new Date(newDevice?.updated || 0).toDateString() !==
        new Date().toDateString()) ||
    refresh_rate !== newDevice.refresh_rate ||
    newDevice.sleep !== ""
  ) {
    if (refresh_rate !== newDevice.refresh_rate) {
      newDevice.sleep = refresh_rate;
    } else {
      newDevice.sleep = "";

      await save(newDevice, kv);
      // don't save the refresh rate when asleep
      newDevice.refresh_rate = refresh_rate;
    }
  }
  return newDevice;
}

export async function save(device, kv) {
  device.updated = new Date().toISOString();
  console.log(`[INFO /device/${device.id}] ${JSON.stringify(device)}`);
  await kv.put(device.id, JSON.stringify(device, null, " "));
}

export function getFilename(device) {
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
  return `${device.screen}/${dateTime.join("/")}/0.png`;
}

function getSleepTime(device) {
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

const IGNORE_HEADERS = [
  "host",
  "connection",
  "content-type",
  "content-length",
  "user-agent",
  "api_key",
  "screen",
  "depth",
  "refresh_rate",
  "cf-ray",
  "accept-encoding",
  "x-forwarded-proto",
  "cf-connecting-ip",
  "updated",
  "fw-commit",
  "cf-visitor",
];
