import html from "./html/device.html?raw";

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
  "battery-voltage": "0",
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

    battery() {
      let b = Math.round(
        (Number(this.selected["battery-voltage"] || 0) - 3.2) * 7,
      );
      return b <= 0 ? 0 : b >= 7 ? "full" : b;
    },
  }),
};
