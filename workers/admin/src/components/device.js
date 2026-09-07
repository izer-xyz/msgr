import html from "./html/device.html?raw";
import { getFilename } from "../../../../src/device.js";

const DEFAULT = {
  id: "",
  height: "",
  width: "",
  screen: "",
  refresh_rate: "",
  friendly_id: "",
  depth: "",
  sleep_from: "",
  sleep_to: "",
  time_zone: "",
  rssi: "",
  updated: "",
  "battery-voltage": "",
  "x-real-ip": "",
  "fw-version": "",
  model: "",
};

export default {
  name: "device",
  html,
  data: () => ({
    DEFAULT,
    loading: true,
    devices: [],
    selected: {
      ...DEFAULT,
    },

    async list() {
      await this.fetch("GET");
    },

    async save(device) {
      let response = await this.fetch("POST", device);
      // todo check for errors.
    },

    async fetch(method, device) {
      this.loading = true;
      let response = await (
        await fetch("/api/admin/device", {
          method: method,
          body: device ? JSON.stringify(device) : null,
        })
      ).json();
      this.devices = response.devices;
      if (this.selected.id === "" && this.devices.length > 0) {
        this.selected = this.devices[0];
      }
      this.loading = false;
      return response;
    },

    async preview(el, device) {
      if (!device.id) return;
      let url = `/api/screen-v2/${getFilename(device)}`;
      let options = {
        headers: {
          ID: device.id,
        },
      };
      el.src = URL.createObjectURL(await (await fetch(url, options)).blob());
    },
  }),
};
