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
      ].find((c) => c >= Number(this.device.refresh_rate) * 1000) || W;

    let dateTime = new Date(
      Math.ceil(
        new Date(
          Date.parse(
            new Date().toLocaleString("lt-LT", {
              timeZone: this.device.time_zone,
            }),
          ),
        ) / coef,
      ) * coef,
    )
      .toLocaleString("lt-LT")
      .replaceAll(" ", "/");

    return `${this.device.screen}/${dateTime}/0.png`;
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
  if (keys.length !== 0) {
    devices = (await Promise.all(await kv.get(keys, "json"))).reduce(
      (list, i) => (i[1] ? list.push(i[1]) && list : list),
      [],
    );
  }
  return devices;
}

// Create a device from a request headers (with defaults and saved device)
export async function from(kv, headers = {}, request = {}) {
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

  let device = await kv.get(headers.get("id") || DEFAULTS.id, "json");

  // All headers are lowercase
  let trmnlHeaders = Object.fromEntries(
    headers.entries().filter(([key]) => !IGNORE_HEADERS.includes(key)),
  );

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
      .toLocaleTimeString("lt-LT", {
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
