import { DurableObject } from "cloudflare:workers";

const DEVICE_KEY_PREFIX = "device:";

export class Devices extends DurableObject {
  async lookup(id) {
    if (typeof id !== "string" || id.length === 0) {
      throw new TypeError("Device id must be a non-empty string");
    }

    return (await this.ctx.storage.get(`${DEVICE_KEY_PREFIX}${id}`)) ?? null;
  }

  async save(device) {
    if (
      device === null ||
      typeof device !== "object" ||
      typeof device.id !== "string" ||
      device.id.length === 0
    ) {
      throw new TypeError("Device must have a non-empty string id");
    }

    await this.ctx.storage.put(`${DEVICE_KEY_PREFIX}${device.id}`, device);
    return device;
  }

  async list() {
    const devices = await this.ctx.storage.list({
      prefix: DEVICE_KEY_PREFIX,
    });

    return [...devices.values()];
  }
}