import { DateTime } from "luxon";

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

export default async function lookup(headers, kv) {
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

  newDevice.sleep = getSleepTime(newDevice);

  return newDevice;
}

export async function save(device, kv) {
  device.updated = new Date().toISOString();
  console.log(`[INFO /device/${device.id}] ${JSON.stringify(device)}`);
  await kv.put(device.id, JSON.stringify(device, null, " "));
}

export function getFilename(device) {
  const M = 60 * 1000,
    H = 60 * M,
    D = 24 * H,
    W = 7 * D;
  let coef =
    [
      M,
      2 * M,
      5 * M,
      10 * M,
      15 * M,
      30 * M,
      H,
      2 * H,
      3 * H,
      6 * H,
      12 * H,
      D,
      2 * D,
      W,
    ].find((c) => c >= Number(device.refresh_rate) * 1000) || W;

  let dateTime = DateTime.fromMillis(
    Math.ceil(
      DateTime.now()
        .setZone(device.time_zone)
        .setZone("utc", { keepLocalTime: true })
        .toMillis() / coef,
    ) * coef,
  );

  return `${device.screen}/${dateTime.toFormat("yyyy-MM-dd/HH:mm")}/0.png`;
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

  refresh_rate = refresh_rate > device.refresh_rate ? refresh_rate : "";

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
