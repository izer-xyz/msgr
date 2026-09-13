import { DurableObject } from "cloudflare:workers";

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

export function getStub(env, req) {
  let name = /:\/\/([^\/\.]+)/.exec(req.url)[1] || "default";
  let id = env.DEVICES.idFromName(name);
  console.log(`[INFO Devices] ID`, name);
  let stub = env.DEVICES.get(id, { locationHint: "weur" });
  return stub;
}

export class Devices extends DurableObject {
  lookup(id) {
    if (typeof id !== "string" || id.length === 0) {
      throw new TypeError("Device id must be a non-empty string");
    }

    return this.ctx.storage.kv.get(id) ?? null;
  }

  save(device) {
    if (
      device === null ||
      typeof device !== "object" ||
      typeof device.id !== "string" ||
      device.id.length === 0
    ) {
      throw new TypeError("Device must have a non-empty string id");
    }

    device.updated = new Date().toISOString();
    this.ctx.storage.kv.put(device.id, device);
    return device;
  }

  list() {
    const devices = this.ctx.storage.kv.list().map((i) => i[1]);
    return [...devices];
  }

  keys() {
    const devices = this.ctx.storage.kv.list().map((i) => i[0]);
    return [...devices];
  }

  // Create a device from a request headers (with defaults and saved device)
  async from(headers = new Map(), request = {}) {
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

    let device = await this.lookup(headers.get("id") || DEFAULTS.id);

    // All headers are lowercase
    let trmnlHeaders =
      Object.fromEntries(
        headers.entries().filter(([key]) => !IGNORE_HEADERS.includes(key)),
      ) || {};

    device = {
      ...DEFAULTS,
      ...device,
      ...trmnlHeaders,
      ...request,
    };

    device.sleep = this.getSleepTime(device);

    return device;
  }

  // return seconds between now and end of sleep time (if after start of sleep time)
  getSleepTime(device, now = new Date()) {
    let refresh_rate = 0;

    if (
      device.sleep_from &&
      device.sleep_to &&
      device.sleep_from !== device.sleep_to
    ) {
      let from = this.timeToSeconds(device.sleep_from);
      let to = this.timeToSeconds(device.sleep_to);
      let current = Number.NaN;

      current = this.timeToSeconds(
        now.toLocaleTimeString("lt-LT", {
          timeStyle: "short",
          timeZone: device.time_zone,
        }),
      );

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
        refresh_rate =
          to + 24 * 60 * 60 - current - 2 * Number(device.refresh_rate);
      }
    }

    refresh_rate =
      refresh_rate > Number(device.refresh_rate) ? refresh_rate : "";
    return refresh_rate;
  }

  getFilename(device, now = new Date()) {
    let dateTime = this.deviceDateTime(device, now).replaceAll(" ", "/");
    return `${device.screen}/${dateTime}/0.png`;
  }

  deviceDateTime(device, now = new Date()) {
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

  timeToSeconds(value) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value));
    return match ? (Number(match[1]) * 60 + Number(match[2])) * 60 : null;
  }
}
