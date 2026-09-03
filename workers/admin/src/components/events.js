import html from "./html/events.html?raw";
import { DateTime } from "luxon";

const DEFAULT = {
  date: "",
  subject: "",
  content: "",
  time: "",
  from: "",
  id: "",
  reference: "",
  day: "",
  flag: "",
};

const now = () =>
  DateTime.now()
    .setZone("Indian/Reunion")
    .toFormat("yyyy-LL-dd TT c")
    .split(" ");

export default {
  name: "events",
  html,
  data: () => ({
    DEFAULT,
    loading: true,
    events: [],
    event: {
      ...DEFAULT,
    },
    last_date: [now()[0], Number(now()[2])],
    selected_date: now()[0],
    selected_day: Number(now()[2]),

    //now,

    select(day) {
      if (day === this.selected_day.toString() && !this.selected_date) {
        this.selected_date = this.last_date[0];
        this.selected_day = this.last_date[1];
        this.event = { ...DEFAULT };
      } else {
        this.event = this.events.find((m) => m.day == day) || {
          ...DEFAULT,
          day: day,
        };
        this.selected_date = "";
        this.selected_day = Number(day);
      }
    },

    select_time(time) {
      let existing = this.events.find(
        (item) =>
          item.time === time &&
          ((!this.selected_date && item.day === this.selected_day.toString()) ||
            (this.selected_date && item.date === this.selected_date)),
      );
      if (existing) {
        this.event = existing;
      } else {
        this.event.time = time;
      }
    },

    select_date() {
      let dateTime = DateTime.fromISO(this.selected_date);
      this.selected_day = dateTime.toFormat("c");
      this.last_date = [this.selected_date, this.selected_day];
      this.list();
    },

    async list() {
      await this.fetch("GET");
    },

    async save(event) {
      if (event.day === "" && event.date === "") {
        if (this.selected_date === "") {
          event.day = this.selected_day.toString();
        } else {
          event.date = this.selected_date;
        }
      }
      let response = await this.fetch("POST", event);
      // todo check for errors.
      this.event = { ...DEFAULT };
      //this.selected = "";
    },

    async hide() {
      this.save({
        ...DEFAULT,
        date: this.selected_date,
        reference: "-",
        hide: this.selected_day.toString(),
      });
    },

    async remove(event) {
      this.event = { ...event, id: "", reference: "" };
      await this.fetch("DELETE", event);
    },

    async fetch(method, event) {
      this.events = [];
      this.loading = true;
      let response = await (
        await fetch(
          `/api/admin/events?date=${this.selected_date || this.last_date[0]}`,
          {
            method: method,
            body: event ? JSON.stringify(event) : null,
          },
        )
      ).json();
      this.events = response.events;
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
