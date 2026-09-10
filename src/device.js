export default class Device {
  constructor(device, kv) {
    this.device = device;
    this.kv = kv;
  }

  async save() {
    this.device.updated = new Date().toISOString();
    await this.kv.put(this.device.id, JSON.stringify(this.device, null, " "));
  }

  getFilename() {
    return getFilename(this.device);
  }
}

const DEFAULTS = {
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

export async function list(kv) {
  let devices = [];
  let keys = (await kv.list()).keys.map((key) => key.name);
  console.log("[INFO] Device.list", keys);
  if (keys.length !== 0) {
    devices = (await Promise.all(await kv.get(keys, "json"))).reduce(
      (list, i) => (i[1] ? list.push(i[1]) && list : list),
      [],
    );
  }
  return devices;
}

// Create a device from a request headers (with defaults and saved device)
export async function from(kv, headers, request = {}) {
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

  let device = await kv.get(
    (headers && headers.get("id")) || DEFAULTS.id,
    "json",
  );

  // All headers are lowercase
  let trmnlHeaders =
    (headers &&
      Object.fromEntries(
        headers.entries().filter(([key]) => !IGNORE_HEADERS.includes(key)),
      )) ||
    {};

  device = {
    ...DEFAULTS,
    ...device,
    ...trmnlHeaders,
    ...request,
  };

  device.sleep = getSleepTime(device);

  return new Device(device, kv);
}

// return seconds between now and end of sleep time (if after start of sleep time)
export function getSleepTime(device, now = new Date()) {
  let refresh_rate = 0;

  if (
    device.sleep_from &&
    device.sleep_to &&
    device.sleep_from !== device.sleep_to
  ) {
    let from = timeToSeconds(device.sleep_from);
    let to = timeToSeconds(device.sleep_to);
    let current = Number.NaN;

    try {
      current = timeToSeconds(
        now.toLocaleTimeString("lt-LT", {
          timeStyle: "short",
          timeZone: device.time_zone,
        }),
      );
    } catch {
      return "";
    }

    if (
      from === null ||
      to === null ||
      !Number.isFinite(Number(device.refresh_rate))
    ) {
      return "";
    }

    if (current < to && ((from < to && from < current) || from > to)) {
      refresh_rate = to - current - 2 * Number(device.refresh_rate);
    } else if (from > to && from < current) {
      refresh_rate = to + 24 * 60 * 60 - current - 2 * Number(device.refresh_rate);
    }
  }

  refresh_rate =
    refresh_rate > Number(device.refresh_rate) ? refresh_rate : "";

  return refresh_rate;
}

export function getFilename(device, now = new Date()) {
  let dateTime = deviceDateTime(device, now).replaceAll(" ", "/");
  return `${device.screen}/${dateTime}/0.png`;
}

export function deviceDateTime(device, now = new Date()) {
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

  return new Date(
    Math.ceil(
      new Date(
        Date.parse(
      now.toLocaleString("lt-LT", {
            timeZone: device.time_zone,
          }),
        ),
      ) / coef,
    ) * coef,
  )
    .toLocaleString("lt-LT")
    .slice(0, -3);
}

function timeToSeconds(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value));
  return match ? (Number(match[1]) * 60 + Number(match[2])) * 60 : null;
}
