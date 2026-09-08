import html from "./html/messages.html?raw";
import { DateTime } from "luxon";

const DEFAULT = {
  date: "",
  content: "",
  time: "",
  from: "",
  id: "",
  reference: "",
  day: "",
};

const now = () =>
  DateTime.now()
    .setZone("Indian/Reunion")
    .toFormat("yyyy-LL-dd TT c")
    .split(" ");

export default {
  name: "messages",
  html,
  data: () => ({
    DEFAULT,
    loading: true,
    msgs: [],
    msg: {
      ...DEFAULT,
    },

    profile: {},
    last_date: [now()[0], Number(now()[2])],
    selected_date: now()[0],
    selected_day: Number(now()[2]),

    select(day) {
      if (day === this.selected_day.toString() && !this.selected_date) {
        this.selected_date = this.last_date[0];
        this.selected_day = this.last_date[1];
        this.msg = { ...DEFAULT };
      } else {
        this.msg = this.msgs.find((m) => m.day == day) || {
          ...DEFAULT,
          day: day,
        };
        this.selected_date = "";
        this.selected_day = Number(day);
      }
    },

    async list() {
      await this.fetch("GET");
    },

    async save(msg) {
      msg.from = this.profile.name;
      if (msg.day === "") {
        msg.date = this.last_date[0];
        msg.time = now()[1];
      } else {
        msg.date = "";
        msg.time = "";
      }
      let response = await this.fetch("POST", msg);
      // todo check for errors.
      this.msg = { ...DEFAULT };
      this.selected_date = this.last_date[0];
      this.selected_day = this.last_date[1];
    },

    async remove(msg) {
      // this.msg = { ...msg, id: "", reference: "" };
      if (confirm("Supprimer le message?")) {
        await this.fetch("DELETE", msg);
      }
    },

    async fetch(method, msg) {
      this.msgs = [];
      this.loading = true;
      let response = await (
        await fetch(`/api/admin/messages?date=${this.last_date[0]}`, {
          method: method,
          body: msg ? JSON.stringify(msg) : null,
        })
      ).json();
      this.msgs = response.messages;
      this.profile = response.profile;
      DEFAULT.from = this.msg.from = this.profile.name;
      this.loading = false;
      return response;
    },

    dateOrDay() {
      return this.selected_date
        ? DateTime.fromISO(this.selected_date)
            .setLocale("fr")
            .toLocaleString(DateTime.DATE_HUGE)
        : DateTime.fromObject({ weekday: this.selected_day })
            .setLocale("fr")
            .toFormat("cccc") + " (récurrents)";
    },
  }),
};
